/**
 * Competition results for the club's teams, from the Public VEX Events API.
 *
 * Same API and the same server-only token as src/lib/vexEvents.ts — events.vex.com,
 * not RobotEvents, which refuses connections since VEX and the REC Foundation
 * separated.
 *
 * This replaces the hand-entered Worlds list. Who went to the World
 * Championship, and what they won there, is a fact VEX already holds; typing it
 * out from memory produced two wrong answers in an evening. Team membership
 * still comes from teams.ts, because the API knows which team won an award and
 * not which club member was standing behind it.
 */

import { awards as CLUB_AWARDS } from "@/content/club/events";
import { TEAMS } from "./teams";

const API = `${process.env.VEX_API_BASE ?? "https://events.vex.com/api/v2"}`;

/** One day. Results change on competition weekends, not hourly. */
export const REVALIDATE_SECONDS = 86400;

export type TeamAward = {
  /** "Excellence Award (V5)" as VEX titles it. */
  title: string;
  event: string;
  /** True when the event was a World Championship. */
  worlds: boolean;
  teamNumber: string;
  /** Club season, read from the event code: RE-VIQRC-24-8266 is 2024-25. */
  season: string;
  /** The members on that team that season. Empty when no roster covers it. */
  members: string[];
  /** True when the season had no roster and the nearest one was used. */
  inferred: boolean;
};

export type AwardsResult =
  | { ok: true; awards: TeamAward[] }
  | { ok: false; reason: "unconfigured" | "unavailable" };

type ApiTeam = {
  id: number;
  number: string;
  location?: { region?: string };
};

type ApiAward = {
  title?: string;
  event?: { name?: string; code?: string };
};

/*
 * The club season an event belongs to, from its code. RE-VIQRC-24-8266 is the
 * 2024-25 season.
 *
 * VEX codes the World Championship with the calendar year it is held in rather
 * than the season it closes, so the 2026 Worlds — the end of 2025-26 — reads
 * as 26 here. That is why an award whose season has no roster falls back to
 * the team's nearest one instead of being dropped: the alternative is losing
 * the club's best result to an off-by-one in somebody else's numbering.
 */
function seasonFromCode(code: string): string {
  const match = /-(\d{2})-/.exec(code);
  if (!match) return "unknown";
  const start = Number(match[1]);
  return `20${start}-${start + 1}`;
}

/** Who was on that team that season, falling back to its nearest roster. */
function rosterFor(number: string, season: string): { members: string[]; inferred: boolean } {
  const exact = TEAMS.find((t) => t.number === number && t.season === season);
  if (exact) return { members: exact.members, inferred: false };

  const mine = TEAMS.filter((t) => t.number === number);
  if (mine.length === 0) return { members: [], inferred: false };

  const year = Number(season.slice(0, 4));
  const nearest = mine.reduce((best, t) =>
    Math.abs(Number(t.season.slice(0, 4)) - year) < Math.abs(Number(best.season.slice(0, 4)) - year)
      ? t
      : best,
  );
  return { members: nearest.members, inferred: true };
}

/*
 * Team numbers are not unique worldwide — another region's 595C is a different
 * team entirely — so results are filtered to the club's own region before
 * anything is attributed to anybody.
 */
const REGION = "Alberta";

async function get<T>(path: string): Promise<T | null> {
  const token = process.env.VEX_API_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(`${API}/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        // The API answers 403 to a default user agent.
        "User-Agent": "vexkan-site/1.0",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** A World Championship, by the name VEX gives the event. */
function isWorlds(eventName: string): boolean {
  return /world championship/i.test(eventName);
}

/*
 * Awards the club holds that VEX's records do not.
 *
 * Two certificates never made it into VEX's award data, and the U.S. Open
 * invitation is something the club states about itself rather than a judged
 * award. All three are already kept in src/content/club/events.ts for the club
 * site, so they are read from there rather than typed out a second time — one
 * list to correct when one of them turns out to be wrong.
 *
 * The season comes from another award at the same event where VEX has one,
 * which is how the two January Showdown certificates get dated without anybody
 * remembering the year.
 */
function withClubRecords(fromApi: TeamAward[]): TeamAward[] {
  const seen = new Set(fromApi.map((a) => `${a.teamNumber}|${a.title}|${a.event}`));
  const seasonByEvent = new Map(fromApi.map((a) => [a.event, a.season]));

  const extra: TeamAward[] = [];
  for (const record of CLUB_AWARDS) {
    /* The API titles carry a programme suffix the club list does not. */
    const already = fromApi.some(
      (a) =>
        a.teamNumber === record.team &&
        a.title.replace(/\s*\((IQ|V5|WC)\)$/, "").trim() === record.award &&
        a.event.startsWith(record.event),
    );
    if (already || seen.has(`${record.team}|${record.award}|${record.event}`)) continue;

    /* Same event, different team: reuse the season VEX gave that event. */
    const match = [...seasonByEvent.entries()].find(([name]) => name.startsWith(record.event));
    const season = match?.[1] ?? "unknown";
    const { members, inferred } = rosterFor(record.team, season);
    extra.push({
      title: record.award,
      event: record.event,
      worlds: isWorlds(record.event),
      teamNumber: record.team,
      season,
      members,
      inferred: inferred || season === "unknown",
    });
  }
  return [...fromApi, ...extra];
}

/** Every award a member has a share in, because they were on the team that season. */
export function awardsForMember(awards: TeamAward[], fullName: string): TeamAward[] {
  return awards.filter((a) => a.members.includes(fullName));
}

/** Every award the given team numbers have won, newest API order preserved. */
export async function awardsForTeams(numbers: string[]): Promise<AwardsResult> {
  if (!process.env.VEX_API_TOKEN) return { ok: false, reason: "unconfigured" };

  const awards: TeamAward[] = [];
  for (const number of numbers) {
    const found = await get<{ data?: ApiTeam[] }>(
      `teams?number%5B%5D=${encodeURIComponent(number)}`,
    );
    const team = found?.data?.find((t) => t.location?.region === REGION);
    if (!team) continue;

    const won = await get<{ data?: ApiAward[] }>(`teams/${team.id}/awards?per_page=250`);
    for (const a of won?.data ?? []) {
      const event = a.event?.name ?? "";
      const season = seasonFromCode(a.event?.code ?? "");
      const { members, inferred } = rosterFor(number, season);
      awards.push({
        /* VEX pads some titles: "Inspire Award (WC) " arrives with a trailing
           space, which silently defeated matching against the club's list. */
        title: (a.title ?? "Award").trim(),
        event,
        worlds: isWorlds(event),
        teamNumber: number,
        season,
        members,
        inferred,
      });
    }
  }

  // A total failure and a genuinely award-less club look identical otherwise.
  if (awards.length === 0) return { ok: false, reason: "unavailable" };
  return { ok: true, awards: withClubRecords(awards) };
}

/* ------------------------------------------------------- worlds, from VEX */

type ApiEvent = { name?: string; sku?: string };

/**
 * Which of the club's teams competed at a World Championship, and in which
 * season, read from VEX's own event records.
 *
 * The teams file carries a `worlds` flag that somebody has to remember to set.
 * This is the same fact without the remembering: if a team qualifies next
 * spring, its entry appears here the day the event does, and nobody edits
 * anything.
 *
 * Attendance rather than awards. A team can go to Worlds and win nothing —
 * both of the club's IQ trips did — so the awards list, which was the first
 * thing tried, could not see them at all.
 */
export async function worldsTeamSeasons(numbers: string[]): Promise<Set<string>> {
  const found = new Set<string>();

  for (const number of numbers) {
    const teams = await get<{ data?: ApiTeam[] }>(
      `teams?number%5B%5D=${encodeURIComponent(number)}`,
    );
    const team = teams?.data?.find((t) => t.location?.region === REGION);
    if (!team) continue;

    const events = await get<{ data?: ApiEvent[] }>(`teams/${team.id}/events?per_page=250`);
    for (const event of events?.data ?? []) {
      if (!/world championship/i.test(event.name ?? "")) continue;
      /*
       * The season comes from the year in the name, not the SKU. Worlds is
       * held in the spring at the end of a season, so the 2026 event closes
       * 2025-26 — and the SKU cannot be trusted for this: VEX coded the 2025
       * Worlds as -24- and the 2026 Worlds as -26-, the season start in one
       * case and the season end in the other.
       */
      const year = /(\d{4})/.exec(event.name ?? "")?.[1];
      if (!year) continue;
      const end = Number(year);
      found.add(`${number}|${end - 1}-${String(end).slice(2)}`);
    }
  }
  return found;
}
