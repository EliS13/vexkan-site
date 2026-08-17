/**
 * Asks VEX which of the club's teams went to a World Championship, and
 * compares that against the `worlds` flags in src/lib/kiosk/teams.ts.
 *
 * Usage:
 *   VEX_API_TOKEN=... node scripts/check-worlds.mjs
 *
 * Run it after a Worlds weekend. Attendance is a fact VEX already holds, and
 * the flag in the file is somebody remembering to set it — this is what turns
 * the second into a one-line check rather than a thing nobody thinks about
 * until a member asks why their badge is missing.
 *
 * It reports and never writes. A script that edits source in place is a
 * script whose diff nobody reads.
 */
import { readFileSync } from "node:fs";

const TOKEN = process.env.VEX_API_TOKEN;
if (!TOKEN) {
  console.error("\n  Set VEX_API_TOKEN.\n");
  process.exit(1);
}

const API = "https://events.vex.com/api/v2";
const REGION = "Alberta";

async function get(path) {
  const res = await fetch(`${API}/${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/json",
      // The API answers 403 to a default user agent.
      "User-Agent": "vexkan-site/1.0",
    },
  });
  if (!res.ok) throw new Error(`${res.status} on ${path}`);
  return res.json();
}

/**
 * The club season a World Championship closes, from the year in its name.
 *
 * Worlds is held in the spring at the end of a season, so the 2026 event
 * closes 2025-26. The SKU cannot be used: VEX coded the 2025 Worlds as -24-
 * and the 2026 Worlds as -26-, which is the season start in one case and the
 * season end in the other.
 */
function worldsSeason(eventName) {
  const year = /(\d{4})/.exec(eventName ?? "")?.[1];
  if (!year) return "unknown";
  const end = Number(year);
  return `${end - 1}-${String(end).slice(2)}`;
}

const source = readFileSync(new URL("../src/lib/kiosk/teams.ts", import.meta.url), "utf8");
const block = source.slice(source.indexOf("export const TEAMS"), source.indexOf("/**\n * Every Worlds"));

const declared = [];
for (const [, body] of block.matchAll(/\{([^{}]*number:[^{}]*)\}/gs)) {
  const number = body.match(/number:\s*"([^"]+)"/)?.[1];
  const season = body.match(/season:\s*"([^"]+)"/)?.[1];
  if (number && season) declared.push({ number, season, worlds: /worlds:\s*true/.test(body) });
}

const numbers = [...new Set(declared.map((t) => t.number))];
const actual = new Set();

for (const number of numbers) {
  const found = await get(`teams?number%5B%5D=${encodeURIComponent(number)}`);
  const team = found.data?.find((t) => t.location?.region === REGION);
  if (!team) continue;
  const events = await get(`teams/${team.id}/events?per_page=250`);
  for (const event of events.data ?? []) {
    if (/world championship/i.test(event.name ?? "")) {
      actual.add(`${number}|${worldsSeason(event.name)}`);
    }
  }
}

console.log(`\n  VEX says these teams competed at a World Championship:`);
for (const key of [...actual].sort()) console.log(`    ${key.replace("|", "  ")}`);

const wrong = [];
for (const team of declared) {
  const went = actual.has(`${team.number}|${team.season}`);
  if (went !== team.worlds) {
    wrong.push(`${team.number} ${team.season}: file says ${team.worlds}, VEX says ${went}`);
  }
}

if (wrong.length === 0) {
  console.log(`\n  teams.ts agrees with VEX on all ${declared.length} teams.\n`);
} else {
  console.log(`\n  ${wrong.length} disagree:`);
  for (const line of wrong) console.log(`    ${line}`);
  console.log("\n  Update the worlds flags in src/lib/kiosk/teams.ts.\n");
  process.exitCode = 1;
}
