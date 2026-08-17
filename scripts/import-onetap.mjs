/**
 * Imports a OneTap attendance export into the kiosk's tables.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/import-onetap.mjs "path/to/export.xlsx" [--dry-run]
 *
 * Reads the sheet without a spreadsheet library: an .xlsx is a zip of XML, and
 * this needs three text columns from one sheet. Pulling in a parser for that
 * would be more to install than to read.
 *
 * Safe to run twice. Members and groups are matched by name, and a session is
 * skipped when one already exists for the same member at the same minute — so a
 * re-run after a partial failure fills the gaps rather than doubling everyone's
 * hours.
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const [, , file, ...flags] = process.argv;
const dryRun = flags.includes("--dry-run");

const URL_BASE = process.env.SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!file) fail("Pass the .xlsx path as the first argument.");
if (!dryRun && (!URL_BASE || !KEY)) {
  fail("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or pass --dry-run.");
}

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

/* ------------------------------------------------------------- the sheet */

/** unzip via the system tool, so this needs nothing from npm. */
function sheetXml(path) {
  return execFileSync("unzip", ["-p", path, "xl/worksheets/sheet1.xml"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

function unescapeXml(text) {
  return text
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function readRows(xml) {
  const rows = [];
  for (const [, inner] of xml.matchAll(/<row[^>]*>(.*?)<\/row>/gs)) {
    const cells = [];
    for (const [, body] of inner.matchAll(/<c[^>]*>(.*?)<\/c>/gs)) {
      const inline = body.match(/<is>.*?<t[^>]*>(.*?)<\/t>/s);
      const value = body.match(/<v>(.*?)<\/v>/s);
      cells.push(unescapeXml(inline?.[1] ?? value?.[1] ?? ""));
    }
    rows.push(cells);
  }
  return rows;
}

/** "Aug 16, 2026 09:27 AM" in club time, to an instant. */
const MONTHS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseStamp(text) {
  const m = /^(\w{3}) (\d{1,2}), (\d{4}) (\d{1,2}):(\d{2}) (AM|PM)$/.exec(text.trim());
  if (!m) return null;
  const [, mon, day, year, hourText, minute, meridiem] = m;
  let hour = Number(hourText) % 12;
  if (meridiem === "PM") hour += 12;

  /*
   * The export has no timezone, and these are club-local wall clocks. Alberta
   * is UTC-6 in summer and UTC-7 in winter, so the offset is derived per date
   * rather than assumed — otherwise every session either side of the change
   * lands an hour out.
   */
  const guess = Date.UTC(Number(year), MONTHS[mon], Number(day), hour, Number(minute));
  const offset = offsetMinutes(new Date(guess));
  return new Date(guess + offset * 60_000).toISOString();
}

function offsetMinutes(at) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Edmonton",
    timeZoneName: "shortOffset",
  }).formatToParts(at);
  const name = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT-7";
  const m = /GMT([+-])(\d{1,2})/.exec(name);
  if (!m) return 420;
  return (m[1] === "-" ? 1 : -1) * Number(m[2]) * 60;
}

/** "Vex IQ Competition 595Y (August 16th)" is one group meeting many times. */
function groupName(listName) {
  return listName.replace(/\s*\([^)]*\)\s*$/, "").trim() || "Unsorted";
}

function splitName(full) {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "—" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
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
  return res.status === 204 ? null : res.json();
}

const rows = readRows(sheetXml(file));
const [header, ...body] = rows;
console.log(`\n  Read ${body.length} rows. Columns: ${header.slice(0, 5).join(" | ")}\n`);

const members = new Map();
const groups = new Map();
const sessions = [];
let skipped = 0;

for (const row of body) {
  const [name, list, inAt, outAt] = row;
  if (!name?.trim() || !inAt?.trim()) { skipped++; continue; }

  const signedInAt = parseStamp(inAt);
  if (!signedInAt) { skipped++; continue; }
  const signedOutAt = outAt?.trim() ? parseStamp(outAt) : null;

  const group = groupName(list ?? "");
  if (!groups.has(group)) groups.set(group, null);
  if (!members.has(name.trim())) members.set(name.trim(), new Set());
  members.get(name.trim()).add(group);

  sessions.push({ name: name.trim(), signedInAt, signedOutAt });
}

console.log(`  ${members.size} members, ${groups.size} groups, ${sessions.length} sessions` +
  (skipped ? `, ${skipped} rows skipped` : ""));

if (dryRun) {
  console.log("\n  Members:  " + [...members.keys()].join(", "));
  console.log("\n  Groups:   " + [...groups.keys()].join(" | "));
  const open = sessions.filter((s) => !s.signedOutAt).length;
  console.log(`\n  ${open} sessions have no check-out and will import as still open.`);
  console.log("\n  Dry run: nothing written.\n");
  process.exit(0);
}

// Groups first, so members can reference them.
for (const name of groups.keys()) {
  const existing = await rest(`kiosk_groups?name=eq.${encodeURIComponent(name)}&select=id`);
  if (existing.length > 0) { groups.set(name, existing[0].id); continue; }
  const [created] = await rest("kiosk_groups", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ name, meets_on: [], starts_at: "16:30", ends_at: "18:00" }),
  });
  groups.set(name, created.id);
  console.log(`  + group ${name}`);
}

const memberIds = new Map();
for (const [name, theirGroups] of members) {
  const { firstName, lastName } = splitName(name);
  const existing = await rest(
    `kiosk_members?first_name=eq.${encodeURIComponent(firstName)}` +
      `&last_name=eq.${encodeURIComponent(lastName)}&select=id`,
  );
  if (existing.length > 0) { memberIds.set(name, existing[0].id); continue; }
  const [created] = await rest("kiosk_members", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      // No photograph. One is added from the roster screen later.
      photo_url: null,
      group_ids: [...theirGroups].map((g) => groups.get(g)).filter(Boolean),
    }),
  });
  memberIds.set(name, created.id);
  console.log(`  + ${firstName} ${lastName}`);
}

/*
 * One open session per member is enforced by a unique index, and this export
 * contains several never-checked-out rows for the same person. All but the most
 * recent are closed at their own start, flagged auto_closed, so the import does
 * not collide with itself and nobody gains phantom hours.
 */
const lastOpenByMember = new Map();
for (const s of sessions) {
  if (s.signedOutAt) continue;
  const prev = lastOpenByMember.get(s.name);
  if (!prev || s.signedInAt > prev.signedInAt) lastOpenByMember.set(s.name, s);
}

let written = 0, already = 0;
for (const s of sessions) {
  const memberId = memberIds.get(s.name);
  if (!memberId) continue;

  const clash = await rest(
    `kiosk_sessions?member_id=eq.${memberId}&signed_in_at=eq.${encodeURIComponent(s.signedInAt)}&select=id`,
  );
  if (clash.length > 0) { already++; continue; }

  const stillOpen = !s.signedOutAt && lastOpenByMember.get(s.name) === s;
  await rest("kiosk_sessions", {
    method: "POST",
    body: JSON.stringify({
      member_id: memberId,
      signed_in_at: s.signedInAt,
      signed_out_at: s.signedOutAt ?? (stillOpen ? null : s.signedInAt),
      auto_closed: !s.signedOutAt && !stillOpen,
      verified: false,
      note: !s.signedOutAt && !stillOpen ? "Imported with no check-out recorded." : null,
    }),
  });
  written++;
}

console.log(`\n  Done. ${written} sessions written` + (already ? `, ${already} already there` : "") + ".\n");
