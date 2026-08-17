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
        title: a.title ?? "Award",
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
  return { ok: true, awards };
}
