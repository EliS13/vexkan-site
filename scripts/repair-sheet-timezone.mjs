/**
 * Moves the imported paper sessions back one hour.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/repair-sheet-timezone.mjs [--dry-run]
 *
 * scripts/import-sheets.mjs converted the paper's wall-clock times against
 * America/Vancouver on its first three runs. The club's zone — CLUB_TIMEZONE in
 * src/lib/kiosk/schedule.ts, which the kiosk renders every time through — is
 * America/Edmonton, an hour ahead. So the 497 rows written from the sheets each
 * sit an hour later than the time somebody actually wrote down.
 *
 * Durations are untouched by this: both ends moved together, so nobody's hours
 * changed and the analytics totals were right all along. Only the clock face
 * was wrong, which matters when the point of the record is to say when the club
 * met.
 *
 * Both cities change daylight saving on the same dates, so the correction is a
 * flat hour rather than anything seasonal.
 *
 * The two windows below are the paper's own coverage, and they hold exactly the
 * 497 imported rows — the other 596 sessions in the table came from OneTap and
 * the live kiosk and are deliberately left alone. Run --dry-run first; it
 * prints the count and a sample without writing.
 */

const dryRun = process.argv.includes("--dry-run");

const URL_BASE = process.env.SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_BASE || !KEY) {
  console.error("\n  Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n");
  process.exit(1);
}

/** The paper's coverage: Dec 2024-Mar 2025, and Sept-Dec 2025. */
const WINDOWS =
  "or=(and(signed_in_at.gte.2024-12-30,signed_in_at.lt.2025-03-10)," +
  "and(signed_in_at.gte.2025-09-21,signed_in_at.lt.2025-12-25))";

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

const anHourEarlier = (stamp) =>
  new Date(Date.parse(stamp) - 3600000).toISOString();

const rows = await rest(
  `kiosk_sessions?select=id,signed_in_at,signed_out_at&${WINDOWS}&order=signed_in_at&limit=2000`,
);

console.log(`\n  ${rows.length} sessions in the paper windows`);
const [first] = rows;
console.log(`  first row  ${first.signed_in_at}  ->  ${anHourEarlier(first.signed_in_at)}`);

if (rows.length !== 497) {
  console.error(
    `\n  Expected 497 imported rows, found ${rows.length}. Something else has` +
      ` written into these dates — stopping rather than shifting it too.\n`,
  );
  process.exit(1);
}

if (dryRun) {
  console.log("\n  Dry run: nothing written.\n");
  process.exit(0);
}

let moved = 0;
for (const row of rows) {
  const body = { signed_in_at: anHourEarlier(row.signed_in_at) };
  if (row.signed_out_at) body.signed_out_at = anHourEarlier(row.signed_out_at);
  await rest(`kiosk_sessions?id=eq.${row.id}`, { method: "PATCH", body: JSON.stringify(body) });
  moved++;
}

console.log(`\n  Done. ${moved} sessions moved back an hour.\n`);
