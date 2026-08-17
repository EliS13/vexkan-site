/**
 * Moves the hand-kept team list into Postgres, once.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-teams.mjs [--dry-run]
 *
 * Members are matched by full name against kiosk_members, because that is how
 * teams.ts named them. A name that matches nobody stops the run rather than
 * writing a team with a member missing — a team of three that silently becomes
 * a team of two is the kind of error nobody notices until somebody asks why
 * they have no awards.
 *
 * Safe to run twice: rows are keyed on (number, season) and upserted.
 */
import { readFileSync } from "node:fs";

const dryRun = process.argv.includes("--dry-run");
const URL_BASE = process.env.SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!dryRun && (!URL_BASE || !KEY)) {
  console.error("\n  Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or pass --dry-run.\n");
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
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`);
  const text = await res.text();
  return text.length === 0 ? null : JSON.parse(text);
}

/*
 * Read the list out of the TypeScript source rather than importing it. This
 * script runs under plain node with no build step, and the file is a literal
 * table with no logic in it.
 */
const source = readFileSync(new URL("../src/lib/kiosk/teams.ts", import.meta.url), "utf8");
const teams = [];
const block = source.slice(source.indexOf("export const TEAMS"), source.indexOf("/** Every team a member"));
for (const [, body] of block.matchAll(/\{([^{}]*number:[^{}]*)\}/gs)) {
  const pick = (key) => body.match(new RegExp(`${key}:\\s*"([^"]+)"`))?.[1];
  const members = [...(body.match(/members:\s*\[([^\]]*)\]/s)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map(
    (m) => m[1],
  );
  const number = pick("number");
  if (!number) continue;
  teams.push({ number, season: pick("season"), program: pick("program") ?? "IQ", members });
}

console.log(`\n  ${teams.length} teams read from teams.ts`);
if (teams.length === 0) {
  console.error("  Parsed nothing — the file's shape must have changed.\n");
  process.exit(1);
}

if (dryRun) {
  for (const t of teams) {
    console.log(`   ${t.number.padEnd(8)} ${t.season}  ${t.program.padEnd(5)} ${t.members.join(", ")}`);
  }
  console.log("\n  Dry run: nothing written.\n");
  process.exit(0);
}

const members = await rest("kiosk_members?select=id,first_name,last_name&limit=1000");
const idByName = new Map(members.map((m) => [`${m.first_name} ${m.last_name}`, m.id]));

const missing = new Set();
for (const t of teams) for (const name of t.members) if (!idByName.has(name)) missing.add(name);
if (missing.size > 0) {
  console.error(`\n  These names are not on the roster: ${[...missing].join(", ")}`);
  console.error("  Nothing written — fix the names or add the members first.\n");
  process.exit(1);
}

let written = 0;
for (const t of teams) {
  await rest("kiosk_teams?on_conflict=number,season", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      number: t.number,
      season: t.season,
      program: t.program,
      member_ids: t.members.map((n) => idByName.get(n)),
    }),
  });
  written++;
}

console.log(`\n  Done. ${written} teams written.\n`);
