/**
 * Closes impossibly long sessions at their own start time.
 *
 * The OneTap import left each member's most recent never-checked-out row open,
 * on the theory that somebody might still be in the room. That was wrong: those
 * rows are months old, and an open session counts to the present, so a check-in
 * from June accumulated thousands of hours. Signing them out then froze that
 * total as a closed session, which is how the club came to have 65,000 recorded
 * hours.
 *
 * A club meeting is a few hours. Anything past the cutoff never happened, so it
 * is closed at its start — contributing nothing — and flagged auto_closed, which
 * the analytics tab already reports as an estimate rather than a fact.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/repair-sessions.mjs [--dry-run] [--max-hours 14]
 */
const flags = process.argv.slice(2);
const dryRun = flags.includes("--dry-run");
const maxIndex = flags.indexOf("--max-hours");
/* Longer than any real meeting, shorter than an overnight mistake. */
const MAX_HOURS = maxIndex === -1 ? 14 : Number(flags[maxIndex + 1]);

const URL_BASE = process.env.SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_BASE || !KEY) {
  console.error("\n  Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n");
  process.exit(1);
}

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

const members = await rest("kiosk_members?select=id,first_name,last_name");
const byId = new Map(members.map((m) => [m.id, `${m.first_name} ${m.last_name}`]));
const sessions = await rest("kiosk_sessions?select=*");

const now = Date.now();
const hoursOf = (s) => {
  const start = Date.parse(s.signed_in_at);
  const end = s.signed_out_at ? Date.parse(s.signed_out_at) : now;
  return (end - start) / 3_600_000;
};

const bad = sessions.filter((s) => hoursOf(s) > MAX_HOURS);
const keptHours = sessions.filter((s) => hoursOf(s) <= MAX_HOURS).reduce((a, s) => a + hoursOf(s), 0);

console.log(`\n  ${sessions.length} sessions, ${bad.length} longer than ${MAX_HOURS}h\n`);
for (const s of bad.slice(0, 10)) {
  console.log(
    `    ${(byId.get(s.member_id) ?? "?").padEnd(18)} ${s.signed_in_at.slice(0, 10)}  ${hoursOf(s).toFixed(0)}h`,
  );
}
if (bad.length > 10) console.log(`    … and ${bad.length - 10} more`);

console.log(`\n  Recorded hours after the repair: ${keptHours.toFixed(0)}h`);

if (dryRun) {
  console.log("\n  Dry run: nothing written.\n");
  process.exit(0);
}

let fixed = 0;
for (const s of bad) {
  await rest(`kiosk_sessions?id=eq.${s.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      // Closed at its own start, so it contributes no hours at all.
      signed_out_at: s.signed_in_at,
      auto_closed: true,
      note: "Imported with no check-out recorded; length unknown.",
    }),
  });
  fixed++;
}

console.log(`\n  Done. ${fixed} sessions corrected.\n`);
