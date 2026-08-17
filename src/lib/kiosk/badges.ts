import { CLUB_TIMEZONE } from "./schedule";
import { sessionMs } from "./hours";
import type { Member, Session } from "./types";

/**
 * What a member has earned, derived entirely from the session rows.
 *
 * Nothing here is stored. A badge is a fact about the sessions — "second place
 * in 2025-26", "came ten club days running" — so recomputing it can never
 * disagree with the attendance record, and correcting a mis-transcribed sheet
 * corrects the badges with it. The alternative, an awards table written when a
 * season ends, drifts the first time a session is edited.
 */

export type BadgeTier = "gold" | "silver" | "bronze" | "milestone" | "streak" | "special";

/** Which drawing to use. The renderer owns the artwork; this owns the meaning. */
export type BadgeShape = "medal" | "star" | "gem" | "flame" | "laurel" | "clock" | "layers";

export type Badge = {
  /** Stable across renders, so React keys and tests can rely on it. */
  id: string;
  label: string;
  detail: string;
  shape: BadgeShape;
  tier: BadgeTier;
  /** 1, 2 or 3 for a podium medal, so the numeral can be struck into it. */
  place?: number;
  /** Higher shows first. A tile has room for three of these. */
  weight: number;
};

/* ------------------------------------------------------------------ dates */

/*
 * One formatter, built once, and every answer remembered.
 *
 * Constructing an Intl.DateTimeFormat is expensive and this is called for every
 * session on every render. Building one per call put badge computation at over
 * five seconds for a roster of 37 against a thousand sessions — on a kiosk that
 * re-renders every ten seconds. The cache is keyed by the timestamp string,
 * which is immutable, so it can never go stale.
 */
const DAY_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: CLUB_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const dayCache = new Map<string, string>();

/** The club-local calendar day of an instant, as YYYY-MM-DD. */
export function clubDay(iso: string): string {
  const hit = dayCache.get(iso);
  if (hit !== undefined) return hit;
  const day = DAY_FORMAT.format(new Date(iso));
  dayCache.set(iso, day);
  return day;
}

/**
 * The season a day belongs to, named by the year it began: "2025" is
 * 2025-05-01 to 2026-04-30.
 */
export function seasonOf(iso: string): string {
  const [year, month] = clubDay(iso).split("-").map(Number);
  return String(month >= 5 ? year : year - 1);
}

/** "2025" -> "2025–26", the way a club writes it. */
export function seasonLabel(season: string): string {
  return `${season}–${String(Number(season) + 1).slice(2)}`;
}

/* ---------------------------------------------------------------- podiums */

/*
 * The podium is three deep. Fourth and fifth were dropped at Eli's request —
 * a badge for placing fifth is a badge for having been present, and the tile
 * only has room for three anyway.
 */
const PODIUM: { tier: BadgeTier; name: string; weight: number }[] = [
  { tier: "gold", name: "1st", weight: 100 },
  { tier: "silver", name: "2nd", weight: 90 },
  { tier: "bronze", name: "3rd", weight: 80 },
];

/** Total hours per member over a set of sessions, ranked, most first. */
function rank(sessions: Session[], now: number): { memberId: string; ms: number }[] {
  const totals = new Map<string, number>();
  for (const s of sessions) {
    totals.set(s.memberId, (totals.get(s.memberId) ?? 0) + sessionMs(s, now));
  }
  return [...totals.entries()]
    .filter(([, ms]) => ms > 0)
    .map(([memberId, ms]) => ({ memberId, ms }))
    .sort((a, b) => b.ms - a.ms || a.memberId.localeCompare(b.memberId));
}

const hours = (ms: number) => `${(ms / 3_600_000).toFixed(1)}h`;

/* ----------------------------------------------------------------- streak */

/**
 * The longest run of consecutive club days a member attended.
 *
 * Consecutive *club* days, not calendar days: this club meets two or three
 * times a week, so counting calendar days would cap almost everyone at one and
 * reward a competition weekend over a season of turning up. Missing a day the
 * club was closed costs nothing.
 */
export function longestStreak(sessions: Session[], memberId: string): number {
  const clubDays = [...new Set(sessions.map((s) => clubDay(s.signedInAt)))].sort();
  const mine = new Set(
    sessions.filter((s) => s.memberId === memberId).map((s) => clubDay(s.signedInAt)),
  );
  return runLength(clubDays, mine);
}

/** The longest unbroken run through `orderedDays` that `attended` contains. */
function runLength(orderedDays: string[], attended: Set<string>): number {
  let best = 0;
  let run = 0;
  for (const day of orderedDays) {
    run = attended.has(day) ? run + 1 : 0;
    if (run > best) best = run;
  }
  return best;
}

/* --------------------------------------------------------------- the set */

/* No 10-hour mark: that is three evenings, and everyone clears it. */
const HOUR_MILESTONES = [500, 250, 100, 50, 25];
const VISIT_MILESTONES = [100, 50, 25];
/*
 * Fives, upward, with no floor at three: three club days in a row is a normal
 * fortnight for anyone who simply attends, and a badge for it says nothing.
 */
const STREAK_MILESTONES = [30, 25, 20, 15, 10, 5];

/* Longest first, so only the higher of the two is worn. */
const LONG_SITTINGS = [
  { hours: 8, id: "ultramarathon", label: "Ultramarathon", weight: 48 },
  { hours: 4, id: "marathon", label: "Marathon", weight: 45 },
];

/**
 * Every badge a member holds, most prestigious first.
 *
 * Milestones report only the highest reached — a member on 260 hours wears the
 * 250 badge, not six badges counting up to it.
 */
export function badgesFor(member: Member, sessions: Session[], now: number): Badge[] {
  return badgeBook([member], sessions, now).get(member.id) ?? [];
}

type Context = {
  mine: Session[];
  myDays: Set<string>;
  orderedDays: string[];
  seasons: string[];
  seasonRanks: Map<string, { memberId: string; ms: number }[]>;
  allTime: { memberId: string; ms: number }[];
  now: number;
};

function assemble(member: Member, ctx: Context): Badge[] {
  const badges: Badge[] = [];
  const { mine, now } = ctx;
  if (mine.length === 0) return badges;

  /* Season podiums. The season in progress counts, and can change hands. */
  for (const season of ctx.seasons) {
    const standings = ctx.seasonRanks.get(season) ?? [];
    const place = standings.findIndex((r) => r.memberId === member.id);
    if (place === -1 || place > 2) continue;
    const spec = PODIUM[place];
    badges.push({
      id: `season-${season}`,
      label: seasonLabel(season),
      detail: `${spec.name} place · ${hours(standings[place].ms)}`,
      shape: "medal",
      place: place + 1,
      tier: spec.tier,
      // A season win outranks any milestone, and recent seasons outrank old.
      weight: spec.weight + Number(season) / 1000,
    });
  }

  /* All time, and changeable — the one that rewards coming back year on year. */
  const allTime = ctx.allTime;
  const overall = allTime.findIndex((r) => r.memberId === member.id);
  if (overall !== -1 && overall < 3) {
    const spec = PODIUM[overall];
    badges.push({
      id: "all-time",
      label: "All time",
      detail: `${spec.name} overall · ${hours(allTime[overall].ms)}`,
      shape: "star",
      tier: spec.tier,
      weight: 200 - overall,
    });
  }

  /* Total hours across every season. The reason a returning member returns. */
  const totalMs = mine.reduce((sum, s) => sum + sessionMs(s, now), 0);
  const hourMark = HOUR_MILESTONES.find((h) => totalMs >= h * 3_600_000);
  if (hourMark) {
    badges.push({
      id: `hours-${hourMark}`,
      label: `${hourMark} hours`,
      detail: `${hours(totalMs)} in the room, all time`,
      shape: "gem",
      tier: "milestone",
      weight: 70 + HOUR_MILESTONES.indexOf(hourMark) * -1 + hourMark / 1000,
    });
  }

  const visitMark = VISIT_MILESTONES.find((v) => mine.length >= v);
  if (visitMark) {
    badges.push({
      id: `visits-${visitMark}`,
      label: `${visitMark} visits`,
      detail: `${mine.length} visits recorded`,
      shape: "layers",
      tier: "milestone",
      weight: 40 + visitMark / 1000,
    });
  }

  const streak = runLength(ctx.orderedDays, ctx.myDays);
  const streakMark = STREAK_MILESTONES.find((s) => streak >= s);
  if (streakMark) {
    badges.push({
      id: `streak-${streakMark}`,
      label: `${streakMark} in a row`,
      detail: `${streak} club days running`,
      shape: "flame",
      tier: "streak",
      weight: 50 + streakMark / 100,
    });
  }

  /*
   * Seasons attended. The club turned over almost completely between 2024-25
   * and 2025-26, so staying across a boundary is genuinely uncommon and worth
   * marking on its own.
   */
  const mySeasons = new Set(mine.map((s) => seasonOf(s.signedInAt)));
  if (mySeasons.size >= 2) {
    badges.push({
      id: `veteran-${mySeasons.size}`,
      label: mySeasons.size >= 3 ? "Founder" : "Returned",
      detail: `Came back across ${mySeasons.size} seasons`,
      shape: "laurel",
      tier: "special",
      weight: 75 + mySeasons.size,
    });
  }

  /* One long sitting. Build nights and competition prep look like this. */
  const longest = mine.reduce((max, s) => Math.max(max, sessionMs(s, now)), 0);
  const sitting = LONG_SITTINGS.find((m) => longest >= m.hours * 3_600_000);
  if (sitting) {
    badges.push({
      id: sitting.id,
      label: sitting.label,
      detail: `A single visit of ${hours(longest)}`,
      shape: "clock",
      tier: "special",
      weight: sitting.weight,
    });
  }

  return badges.sort((a, b) => b.weight - a.weight);
}

/**
 * Every badge that exists, and how it is earned, for the awards screen.
 *
 * Built from the same constants the awarding uses, so the page cannot promise
 * a hundred hours while the code wants two hundred. A new milestone appears
 * here the moment it is added above.
 */
/**
 * Which award a badge is an instance of.
 *
 * A member holds "season-2025" or "hours-100"; the awards page documents the
 * kind. One function owns this mapping because three places need it — the
 * page's anchors, its "how many hold it" counts, and the links from the
 * leaderboard — and when they each had their own the counts silently drifted:
 * every medal counted as one award, and Returned read as unclaimed while five
 * members wore it.
 */
export function awardKind(badge: Pick<Badge, "id" | "place">): string {
  if (badge.id.startsWith("season-")) return `season-${badge.place ?? 1}`;
  if (badge.id.startsWith("hours-")) return "hours";
  if (badge.id.startsWith("visits-")) return "visits";
  if (badge.id.startsWith("streak-")) return "streak";
  if (badge.id.startsWith("veteran-")) return "returned";
  return badge.id;
}

export type BadgeGuideEntry = {
  badge: Badge;
  how: string;
};

export const BADGE_GUIDE: { heading: string; entries: BadgeGuideEntry[] }[] = [
  {
    heading: "Placing",
    entries: [
      {
        badge: { id: "season-1", label: "Season gold", detail: "1st place in a season", shape: "medal", place: 1, tier: "gold", weight: 0 },
        how: "Most hours in a season. The club's year runs May 1st to April 30th.",
      },
      {
        badge: { id: "season-2", label: "Season silver", detail: "2nd place in a season", shape: "medal", place: 2, tier: "silver", weight: 0 },
        how: "Second most hours in a season.",
      },
      {
        badge: { id: "season-3", label: "Season bronze", detail: "3rd place in a season", shape: "medal", place: 3, tier: "bronze", weight: 0 },
        how: "Third most hours in a season.",
      },
      {
        badge: { id: "all-time", label: "All time", detail: "Top three ever", shape: "star", tier: "gold", weight: 0 },
        how: "Top three for total hours across every season. This one can change hands at any moment.",
      },
    ],
  },
  {
    heading: "Milestones",
    entries: [
      {
        badge: { id: "hours", label: "Hours", detail: "Total time in the room", shape: "gem", tier: "milestone", weight: 0 },
        how: `Total hours across every season: ${[...HOUR_MILESTONES].reverse().join(", ")}. Only the highest reached is worn.`,
      },
      {
        badge: { id: "visits", label: "Visits", detail: "Times you came", shape: "layers", tier: "milestone", weight: 0 },
        how: `Number of visits recorded: ${[...VISIT_MILESTONES].reverse().join(", ")}.`,
      },
    ],
  },
  {
    heading: "Turning up",
    entries: [
      {
        badge: { id: "streak", label: "Streak", detail: "Club days in a row", shape: "flame", tier: "streak", weight: 0 },
        how: `Club days in a row without missing one: ${[...STREAK_MILESTONES].reverse().join(", ")}. Days the club was closed do not break it.`,
      },
      {
        badge: { id: "returned", label: "Returned", detail: "Two seasons", shape: "laurel", tier: "special", weight: 0 },
        how: "Came back for a second season. Becomes Founder at three.",
      },
      {
        badge: { id: "marathon", label: "Marathon", detail: "One long visit", shape: "clock", tier: "special", weight: 0 },
        how: "A single visit lasting more than four hours.",
      },
      {
        badge: { id: "ultramarathon", label: "Ultramarathon", detail: "One very long visit", shape: "clock", tier: "gold", weight: 0 },
        how: "A single visit lasting more than eight hours. Replaces Marathon.",
      },
    ],
  },
];

/** The three a tile has room for. */
export function topBadges(badges: Badge[], limit = 3): Badge[] {
  return badges.slice(0, limit);
}

/**
 * Every member's badges, computed in one pass over the sessions.
 *
 * badgesFor on its own re-ranks every season and rebuilds the club's calendar
 * for each member it is asked about. That is fine for one member and quadratic
 * for a roster — the kiosk draws 37 tiles and rebuilds them on a ten-second
 * clock. This shares the ranking and the calendar across the whole roster, so
 * the work is done once however many tiles are on screen.
 */
export function badgeBook(
  members: Member[],
  sessions: Session[],
  now: number,
): Map<string, Badge[]> {
  const book = new Map<string, Badge[]>();
  if (sessions.length === 0) {
    for (const m of members) book.set(m.id, []);
    return book;
  }

  const bySeason = new Map<string, Session[]>();
  const byMember = new Map<string, Session[]>();
  const clubDays = new Set<string>();
  const daysByMember = new Map<string, Set<string>>();

  for (const s of sessions) {
    const season = seasonOf(s.signedInAt);
    const day = clubDay(s.signedInAt);
    clubDays.add(day);
    (bySeason.get(season) ?? bySeason.set(season, []).get(season)!).push(s);
    (byMember.get(s.memberId) ?? byMember.set(s.memberId, []).get(s.memberId)!).push(s);
    (daysByMember.get(s.memberId) ?? daysByMember.set(s.memberId, new Set()).get(s.memberId)!).add(day);
  }

  const orderedDays = [...clubDays].sort();
  const seasonRanks = new Map<string, ReturnType<typeof rank>>();
  for (const [season, rows] of bySeason) seasonRanks.set(season, rank(rows, now));
  const allTime = rank(sessions, now);
  const seasons = [...bySeason.keys()].sort().reverse();

  for (const member of members) {
    book.set(
      member.id,
      assemble(member, {
        mine: byMember.get(member.id) ?? [],
        myDays: daysByMember.get(member.id) ?? new Set(),
        orderedDays,
        seasons,
        seasonRanks,
        allTime,
        now,
      }),
    );
  }
  return book;
}
