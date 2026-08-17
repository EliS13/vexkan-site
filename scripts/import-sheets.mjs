/**
 * Imports the club's paper sign-in sheets into the kiosk's tables.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/import-sheets.mjs data/sheets/batch-01.csv [--dry-run]
 *
 * Reads the checked CSV produced from photographs of the sheets, not the
 * photographs themselves. Every row has been eyeballed against the paper
 * first — this only moves an approved table into Postgres.
 *
 * Safe to run twice, the same way the OneTap importer is: a session is skipped
 * when one already exists for that member at that minute, so a re-run after a
 * partial failure fills the gaps rather than doubling anyone's hours.
 */

const [, , file, ...flags] = process.argv;
const dryRun = flags.includes("--dry-run");

const URL_BASE = process.env.SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!file) fail("Pass the CSV path as the first argument.");
if (!dryRun && (!URL_BASE || !KEY)) {
  fail("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or pass --dry-run.");
}

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

/* ------------------------------------------------------------------ time */

/*
 * The paper records wall-clock time in the room, and the club's autumn spans
 * the end of daylight saving — Nov 2nd, 2025. Hardcoding one offset would move
 * every session after that date by an hour, so the zone is resolved per row.
 */
/*
 * The club's own zone, not the coast's. `CLUB_TIMEZONE` in
 * src/lib/kiosk/schedule.ts is the single source of truth and the kiosk renders
 * every time through it — importing against Vancouver instead put the first
 * 497 rows an hour late, which cost nothing in duration and everything in
 * legibility. Keep these two in step.
 */
const ZONE = "America/Edmonton";

function offsetMinutes(instant) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: ZONE, hour12: false,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    })
      .formatToParts(instant)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(
    +parts.year, +parts.month - 1, +parts.day,
    +parts.hour % 24, +parts.minute, +parts.second,
  );
  return (asUtc - instant.getTime()) / 60000;
}

/** "2025-11-02" + "10:00" in the club's zone -> a UTC timestamp. */
function toUtc(date, time) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const naive = Date.UTC(y, m - 1, d, hh, mm);
  // Two passes: the first offset may be read on the wrong side of a DST edge.
  let ts = naive;
  for (let i = 0; i < 2; i++) ts = naive - offsetMinutes(new Date(ts)) * 60000;
  return new Date(ts).toISOString();
}

/* ------------------------------------------------------------------- csv */

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows.filter((r) => r.some((c) => c !== ""));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

/* ---------------------------------------------------------------- import */

async function rest(path, init = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  const text = await res.text();
  return text.length === 0 ? null : JSON.parse(text);
}

function splitName(full) {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "—" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/*
 * Where a group left together and nobody wrote a time out, the club's answer is
 * 8:30pm — that is when the room empties. The row is still marked auto_closed
 * so the analytics banner keeps reporting what share of hours were inferred
 * rather than measured. A guessed hour that looks measured is the one outcome
 * worth avoiding here.
 *
 * That only holds for an era whose sessions actually end at 8:30. The 2024-25
 * sheets are afternoon meetings — people arrive at four and leave around six —
 * and closing those at 8:30pm would add roughly 4.8 hours to every row that
 * forgot a sign-out, against a real average of 2.2. So --close=average uses the
 * mean length of that file's own complete rows instead, which is the club's
 * stated fallback for when no group departure applies.
 */
const ASSUMED_LEAVE = "20:30";
const closeBy = flags.find((f) => f.startsWith("--close="))?.slice(8) ?? "20:30";
if (closeBy !== "average" && !/^\d{1,2}:\d{2}$/.test(closeBy)) {
  fail(`--close= wants "average" or a time like 18:30, not "${closeBy}".`);
}

const rows = parseCsv(await (await import("node:fs/promises")).readFile(file, "utf8"));

/** The mean length of the rows that did record both times, in minutes. */
function averageLength(rows) {
  const lengths = [];
  for (const r of rows) {
    if (!r.name_matched || !r.time_in || !r.time_out) continue;
    const span = (Date.parse(toUtc(r.date, r.time_out)) - Date.parse(toUtc(r.date, r.time_in))) / 60000;
    if (span > 0) lengths.push(span);
  }
  if (!lengths.length) fail("No complete rows to average from; pass a time instead.");
  return Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
}

const averageMinutes = closeBy === "average" ? averageLength(rows) : null;

/** When the leave time is missing, the moment the club's rules say to use. */
function closedAt(row, signedInAt) {
  if (closeBy === "average") {
    return new Date(Date.parse(signedInAt) + averageMinutes * 60000).toISOString();
  }
  return toUtc(row.date, closeBy);
}

const reason = closeBy === "average"
  ? `No leave time on the paper sheet; closed at this batch's average of ` +
    `${Math.floor(averageMinutes / 60)}h${String(averageMinutes % 60).padStart(2, "0")}.`
  : `No leave time on the paper sheet; closed at the group's ${closeBy}.`;

const sessions = [];
const unresolved = [];
let inferred = 0;

for (const row of rows) {
  if (!row.name_matched) { unresolved.push(row); continue; }
  if (!row.date || !row.time_in) { unresolved.push(row); continue; }

  const signedInAt = toUtc(row.date, row.time_in);
  let signedOutAt, autoClosed = false, note = null;

  if (row.time_out) {
    signedOutAt = toUtc(row.date, row.time_out);
    // A few sheets record a leave time earlier than the arrival — a misreading
    // on paper, not a session. Closing it at 8:30pm is kinder than a negative.
    if (signedOutAt <= signedInAt) {
      signedOutAt = closedAt(row, signedInAt);
      autoClosed = true;
      note = `Paper recorded a leave time before the arrival. ${reason}`;
      inferred++;
    }
  } else {
    signedOutAt = closedAt(row, signedInAt);
    autoClosed = true;
    note = reason;
    inferred++;
  }

  sessions.push({ name: row.name_matched, signedInAt, signedOutAt, autoClosed, note });
}

const names = [...new Set(sessions.map((s) => s.name))].sort();
const hours = sessions.reduce(
  (t, s) => t + (Date.parse(s.signedOutAt) - Date.parse(s.signedInAt)) / 3600000, 0);

console.log(`\n  ${sessions.length} sessions across ${names.length} people`);
console.log(`  ${hours.toFixed(1)} hours, ${inferred} of them closed by rule`);
if (unresolved.length) console.log(`  ${unresolved.length} rows held back, unresolved`);

if (dryRun) {
  console.log("\n  People:  " + names.join(", "));
  if (unresolved.length) {
    console.log("\n  Held back:");
    for (const r of unresolved) {
      console.log(`    ${r.date}  ${r.name_raw.padEnd(24)}  ${r.note || "no name match"}`);
    }
  }
  console.log("\n  Dry run: nothing written.\n");
  process.exit(0);
}

const memberIds = new Map();
for (const name of names) {
  const { firstName, lastName } = splitName(name);
  const existing = await rest(
    `kiosk_members?first_name=eq.${encodeURIComponent(firstName)}` +
      `&last_name=eq.${encodeURIComponent(lastName)}&select=id`,
  );
  if (existing.length > 0) { memberIds.set(name, existing[0].id); continue; }
  const [created] = await rest("kiosk_members", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    // No photograph and no group. Both are set from the roster screen later —
    // the paper says nothing about either.
    body: JSON.stringify({ first_name: firstName, last_name: lastName, photo_url: null, group_ids: [] }),
  });
  memberIds.set(name, created.id);
  console.log(`  + ${firstName} ${lastName}`);
}

let written = 0, already = 0;
for (const s of sessions) {
  const memberId = memberIds.get(s.name);
  if (!memberId) continue;

  const clash = await rest(
    `kiosk_sessions?member_id=eq.${memberId}` +
      `&signed_in_at=eq.${encodeURIComponent(s.signedInAt)}&select=id`,
  );
  if (clash.length > 0) { already++; continue; }

  await rest("kiosk_sessions", {
    method: "POST",
    body: JSON.stringify({
      member_id: memberId,
      signed_in_at: s.signedInAt,
      signed_out_at: s.signedOutAt,
      auto_closed: s.autoClosed,
      verified: false,
      note: s.note,
    }),
  });
  written++;
}

console.log(`\n  Done. ${written} sessions written` + (already ? `, ${already} already there` : "") + ".\n");
