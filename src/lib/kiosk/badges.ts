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

export type BadgeTier =
  | "gold" | "silver" | "bronze" | "milestone" | "streak" | "special" | "secret";

/** Which drawing to use. The renderer owns the artwork; this owns the meaning. */
export type BadgeShape =
  | "medal" | "star" | "gem" | "flame" | "laurel" | "clock" | "layers"
  | "shield" | "crown" | "anvil" | "sun" | "moon";

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

const PART_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: CLUB_TIMEZONE,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const partCache = new Map<string, { weekday: number; minutes: number }>();
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Club-local weekday (0 = Sunday) and minutes past midnight. */
export function clubParts(iso: string): { weekday: number; minutes: number } {
  const hit = partCache.get(iso);
  if (hit) return hit;
  const parts = Object.fromEntries(
    PART_FORMAT.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  );
  const value = {
    weekday: WEEKDAYS.indexOf(String(parts.weekday)),
    minutes: (Number(parts.hour) % 24) * 60 + Number(parts.minute),
  };
  partCache.set(iso, value);
  return value;
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

/*
 * The people who started the club. Named rather than derived: nothing in the
 * session rows says who founded anything, and inferring it from the earliest
 * attendance would hand the badge to whoever signed the first sheet.
 */
const FOUNDERS = ["Eli Seeliger"];

/* No 10-hour mark: that is three evenings, and everyone clears it. */
const HOUR_MILESTONES = [500, 250, 100, 50, 25];
const VISIT_MILESTONES = [100, 50, 25];
/*
 * Fives, upward, with no floor at three: three club days in a row is a normal
 * fortnight for anyone who simply attends, and a badge for it says nothing.
 */
const STREAK_MILESTONES = [30, 25, 20, 15, 10, 5];

/*
 * Secret achievements.
 *
 * Each returns the detail line when earned and null when not, so the test and
 * the wording it produces live together — a rule that changes cannot leave a
 * description behind describing the old one.
 */
type Secret = {
  id: string;
  label: string;
  shape: BadgeShape;
  weight: number;
  test: (member: Member, ctx: Context) => string | null;
};

const SECRETS: Secret[] = [
  {
    id: "early-bird",
    label: "Early Bird",
    shape: "sun",
    weight: 30,
    test: (_m, ctx) => {
      const early = ctx.mine.filter((s) => clubParts(s.signedInAt).minutes < 9 * 60);
      return early.length ? `Signed in before 9am, ${early.length} time${early.length === 1 ? "" : "s"}` : null;
    },
  },
  {
    id: "night-owl",
    label: "Night Owl",
    shape: "moon",
    weight: 31,
    test: (_m, ctx) => {
      const late = ctx.mine.filter(
        (s) => s.signedOutAt && clubParts(s.signedOutAt).minutes >= 21 * 60,
      );
      return late.length >= 5 ? `Still here after 9pm on ${late.length} nights` : null;
    },
  },
  {
    id: "weekender",
    label: "Weekender",
    shape: "sun",
    weight: 29,
    test: (_m, ctx) => {
      const weekend = new Set(
        ctx.mine
          .filter((s) => [0, 6].includes(clubParts(s.signedInAt).weekday))
          .map((s) => clubDay(s.signedInAt)),
      );
      return weekend.size >= 20 ? `${weekend.size} weekend days at the club` : null;
    },
  },
  {
    id: "double-dip",
    label: "Double Dip",
    shape: "layers",
    weight: 28,
    test: (_m, ctx) => {
      const perDay = new Map<string, number>();
      for (const s of ctx.mine) {
        const d = clubDay(s.signedInAt);
        perDay.set(d, (perDay.get(d) ?? 0) + 1);
      }
      const most = Math.max(0, ...perDay.values());
      return most >= 3 ? `${most} separate visits in a single day` : null;
    },
  },
  {
    id: "opening-act",
    label: "Opening Act",
    shape: "sun",
    weight: 34,
    test: (m, ctx) => {
      const n = [...ctx.firstInByDay.values()].filter((id) => id === m.id).length;
      return n >= 15 ? `First through the door on ${n} club days` : null;
    },
  },
  {
    id: "last-one-out",
    label: "Last One Out",
    shape: "moon",
    weight: 34,
    test: (m, ctx) => {
      const n = [...ctx.lastOutByDay.values()].filter((id) => id === m.id).length;
      return n >= 15 ? `Last to leave on ${n} club days` : null;
    },
  },
  {
    id: "big-week",
    label: "Big Week",
    shape: "flame",
    weight: 36,
    test: (_m, ctx) => {
      const byDay = new Map<string, number>();
      for (const s of ctx.mine) {
        const d = clubDay(s.signedInAt);
        byDay.set(d, (byDay.get(d) ?? 0) + sessionMs(s, ctx.now));
      }
      const days = [...byDay.keys()].sort();
      let best = 0;
      for (let i = 0; i < days.length; i++) {
        let sum = 0;
        const start = Date.parse(days[i]);
        for (let j = i; j < days.length && Date.parse(days[j]) - start < 7 * 86_400_000; j++) {
          sum += byDay.get(days[j]) ?? 0;
        }
        best = Math.max(best, sum);
      }
      return best >= 20 * 3_600_000 ? `${hours(best)} inside a single week` : null;
    },
  },
  {
    id: "comeback",
    label: "Comeback",
    shape: "laurel",
    weight: 33,
    test: (_m, ctx) => {
      const days = [...new Set(ctx.mine.map((s) => clubDay(s.signedInAt)))].sort();
      let gap = 0;
      for (let i = 1; i < days.length; i++) {
        gap = Math.max(gap, (Date.parse(days[i]) - Date.parse(days[i - 1])) / 86_400_000);
      }
      return gap >= 90 ? `Came back after ${Math.round(gap)} days away` : null;
    },
  },
  {
    id: "dawn-patrol",
    label: "Dawn Patrol",
    shape: "sun",
    weight: 37,
    test: (_m, ctx) =>
      ctx.mine.some((s) => clubParts(s.signedInAt).minutes < 8 * 60)
        ? "Signed in before 8am"
        : null,
  },
  {
    id: "midnight-oil",
    label: "Midnight Oil",
    shape: "moon",
    weight: 38,
    test: (_m, ctx) =>
      ctx.mine.some((s) => s.signedOutAt && clubParts(s.signedOutAt).minutes >= 23 * 60)
        ? "Still here after 11pm"
        : null,
  },
  {
    id: "seven-days",
    label: "Seven Days",
    shape: "crown",
    weight: 39,
    test: (_m, ctx) => {
      const days = new Set(ctx.mine.map((s) => clubParts(s.signedInAt).weekday));
      return days.size === 7 ? "Came on every day of the week" : null;
    },
  },
  {
    id: "solo-session",
    label: "Solo Session",
    shape: "moon",
    weight: 30,
    test: (_m, ctx) => {
      const alone = [...new Set(ctx.mine.map((s) => clubDay(s.signedInAt)))].filter(
        (d) => ctx.headcountByDay.get(d) === 1,
      );
      return alone.length ? `The only one here, ${alone.length} time${alone.length === 1 ? "" : "s"}` : null;
    },
  },
  {
    id: "anniversary",
    label: "Anniversary",
    shape: "laurel",
    weight: 33,
    test: (_m, ctx) => {
      const byDate = new Map<string, Set<string>>();
      for (const s of ctx.mine) {
        const [year, month, day] = clubDay(s.signedInAt).split("-");
        const key = `${month}-${day}`;
        (byDate.get(key) ?? byDate.set(key, new Set()).get(key)!).add(year);
      }
      const hit = [...byDate.entries()].find(([, years]) => years.size >= 2);
      return hit ? `Here on the same date in ${hit[1].size} different years` : null;
    },
  },
  {
    id: "lunch-club",
    label: "Lunch Club",
    shape: "sun",
    weight: 27,
    test: (_m, ctx) =>
      ctx.mine.some(
        (s) =>
          s.signedOutAt &&
          clubParts(s.signedInAt).minutes >= 11 * 60 &&
          clubParts(s.signedOutAt).minutes <= 14 * 60,
      )
        ? "A whole visit inside the lunch hour"
        : null,
  },
  {
    id: "marathon-day",
    label: "Marathon Day",
    shape: "flame",
    weight: 40,
    test: (_m, ctx) => {
      const byDay = new Map<string, number>();
      for (const s of ctx.mine) {
        const d = clubDay(s.signedInAt);
        byDay.set(d, (byDay.get(d) ?? 0) + sessionMs(s, ctx.now));
      }
      const best = Math.max(0, ...byDay.values());
      return best >= 8 * 3_600_000 ? `${hours(best)} in a single day` : null;
    },
  },
  {
    id: "summer-school",
    label: "Summer School",
    shape: "sun",
    weight: 26,
    test: (_m, ctx) =>
      ctx.mine.some((s) => ["07", "08"].includes(clubDay(s.signedInAt).slice(5, 7)))
        ? "Came in the summer holidays"
        : null,
  },
  {
    id: "new-year",
    label: "New Year",
    shape: "star",
    weight: 26,
    test: (_m, ctx) => {
      const years = new Set(
        ctx.mine
          .filter((s) => clubDay(s.signedInAt).slice(5, 7) === "01")
          .map((s) => clubDay(s.signedInAt).slice(0, 4)),
      );
      return years.size >= 2 ? `Back in January of ${years.size} different years` : null;
    },
  },
  {
    id: "four-seasons",
    label: "Rain or Shine",
    shape: "sun",
    weight: 34,
    test: (_m, ctx) => {
      /* Winter, spring, summer, autumn — by the months the club runs in. */
      const quarters = new Set(
        ctx.mine.map((s) => Math.floor((Number(clubDay(s.signedInAt).slice(5, 7)) - 1) / 3)),
      );
      return quarters.size === 4 ? "Came in all four seasons of the year" : null;
    },
  },
  {
    id: "bookends",
    label: "Bookends",
    shape: "shield",
    weight: 41,
    test: (m, ctx) => {
      const days = [...ctx.firstInByDay.entries()]
        .filter(([day, id]) => id === m.id && ctx.lastOutByDay.get(day) === m.id)
        .length;
      return days >= 3 ? `Opened and closed the club on ${days} days` : null;
    },
  },
  {
    id: "ten-months",
    label: "Eight Months",
    shape: "layers",
    weight: 32,
    test: (_m, ctx) => {
      const months = new Set(ctx.mine.map((s) => clubDay(s.signedInAt).slice(0, 7)));
      return months.size >= 8 ? `Turned up in ${months.size} different months` : null;
    },
  },
  {
    id: "clockwork",
    label: "Clockwork",
    shape: "clock",
    weight: 35,
    test: (_m, ctx) => {
      const counts = new Map<number, number>();
      for (const s of ctx.mine) {
        const slot = Math.floor(clubParts(s.signedInAt).minutes / 5);
        counts.set(slot, (counts.get(slot) ?? 0) + 1);
      }
      const most = Math.max(0, ...counts.values());
      return most >= 15 ? `Arrived in the same five minutes ${most} times` : null;
    },
  },
];

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
  /** Who was first in and last out on each club day, for the secret awards. */
  firstInByDay: Map<string, string>;
  lastOutByDay: Map<string, string>;
  headcountByDay: Map<string, number>;
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
   * and 2025-26, so staying across a boundary is genuinely uncommon.
   */
  const mySeasons = new Set(mine.map((s) => seasonOf(s.signedInAt)));

  if (mySeasons.size >= 2) {
    badges.push({
      id: `veteran-${mySeasons.size}`,
      label: mySeasons.size >= 3 ? "Running it back" : "Returned",
      detail: `Came back across ${mySeasons.size} seasons`,
      shape: "laurel",
      tier: "special",
      weight: 75 + mySeasons.size,
    });
  }

  if (FOUNDERS.includes(`${member.firstName} ${member.lastName}`)) {
    badges.push({
      id: "founder",
      label: "Founder",
      detail: "Started the club",
      shape: "crown",
      tier: "gold",
      weight: 300,
    });
  }

  /*
   * Combinations. These are the interesting ones: no single number gets you
   * here, so they say something a milestone cannot. Volume without turning up
   * regularly earns nothing; so does turning up without ever staying.
   */
  const streakAll = runLength(ctx.orderedDays, ctx.myDays);
  const totalHours = totalMs / 3_600_000;
  const averageMs = mine.length > 0 ? totalMs / mine.length : 0;

  if (totalHours >= 100 && streakAll >= 10) {
    badges.push({
      id: "ironclad",
      label: "Ironclad",
      detail: `${Math.round(totalHours)} hours and a ${streakAll}-day run`,
      shape: "shield",
      tier: "gold",
      weight: 86,
    });
  }


  if (mine.length >= 25 && averageMs >= 3 * 3_600_000) {
    badges.push({
      id: "workhorse",
      label: "Workhorse",
      detail: `${mine.length} visits averaging ${hours(averageMs)}`,
      shape: "anvil",
      tier: "special",
      weight: 66,
    });
  }


  /*
   * The secret ones. Nothing here is announced in advance — they are found by
   * doing something, which is the point of them. Each is a fact about the
   * sessions, so nobody has to remember to award one.
   */
  for (const secret of SECRETS) {
    const earned = secret.test(member, ctx);
    if (earned) {
      badges.push({
        id: secret.id,
        label: secret.label,
        detail: earned,
        shape: secret.shape,
        tier: "secret",
        weight: secret.weight,
      });
    }
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
  /** Hidden on the awards page until somebody in the club has earned it. */
  secret?: boolean;
};

/* Written out rather than derived: the test says when, this says what. */
const SECRET_HINTS: Record<string, string> = {
  "early-bird": "Sign in before 9am.",
  "night-owl": "Still signed in after 9pm, five nights.",
  weekender: "Twenty weekend days at the club.",
  "double-dip": "Three separate visits in a single day.",
  "opening-act": "First through the door on fifteen club days.",
  "last-one-out": "Last to leave on fifteen club days.",
  "big-week": "Twenty hours inside a single week.",
  comeback: "Return after ninety days away.",
  clockwork: "Arrive in the same five-minute window fifteen times.",
  "dawn-patrol": "Sign in before 8am.",
  "midnight-oil": "Still signed in after 11pm.",
  "seven-days": "Come on all seven days of the week, across your time here.",
  "solo-session": "Be the only member in the room on a club day.",
  anniversary: "Be here on the same calendar date in two different years.",
  "lunch-club": "A whole visit inside the lunch hour.",
  "marathon-day": "Eight hours in one day, across as many visits as it takes.",
  "summer-school": "Come during the summer holidays.",
  "new-year": "Come in January, in two different years.",
  "four-seasons": "Come in all four seasons of the calendar year.",
  bookends: "First in and last out on the same day, three times.",
  "ten-months": "Turn up in eight different calendar months.",
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
    heading: "Secret",
    entries: SECRETS.map((s) => ({
      badge: {
        id: s.id,
        label: s.label,
        detail: "Secret",
        shape: s.shape,
        tier: "secret" as const,
        weight: 0,
      },
      how: SECRET_HINTS[s.id] ?? "Found by doing something.",
      secret: true,
    })),
  },
  {
    heading: "Combinations",
    entries: [
      {
        badge: { id: "ironclad", label: "Ironclad", detail: "Hours and consistency", shape: "shield", tier: "gold", weight: 0 },
        how: "100 hours or more, and a streak of at least 10 club days. Volume alone will not do it.",
      },
      {
        badge: { id: "workhorse", label: "Workhorse", detail: "Long visits, often", shape: "anvil", tier: "special", weight: 0 },
        how: "At least 25 visits averaging over three hours each.",
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
        how: "Came back for a second season. Becomes Running it back at three.",
      },
      {
        badge: { id: "founder", label: "Founder", detail: "Started the club", shape: "crown", tier: "gold", weight: 0 },
        how: "Founded VexKan. Not something attendance can earn.",
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

  /* Who opened and closed each club day, and how many came. */
  const firstInByDay = new Map<string, string>();
  const lastOutByDay = new Map<string, string>();
  const seenByDay = new Map<string, Set<string>>();
  const earliest = new Map<string, number>();
  const latest = new Map<string, number>();
  for (const s of sessions) {
    const day = clubDay(s.signedInAt);
    const inAt = Date.parse(s.signedInAt);
    if (!earliest.has(day) || inAt < earliest.get(day)!) {
      earliest.set(day, inAt);
      firstInByDay.set(day, s.memberId);
    }
    if (s.signedOutAt) {
      const outAt = Date.parse(s.signedOutAt);
      if (!latest.has(day) || outAt > latest.get(day)!) {
        latest.set(day, outAt);
        lastOutByDay.set(day, s.memberId);
      }
    }
    (seenByDay.get(day) ?? seenByDay.set(day, new Set()).get(day)!).add(s.memberId);
  }
  const headcountByDay = new Map([...seenByDay].map(([day, who]) => [day, who.size]));
  const seasonRanks = new Map<string, ReturnType<typeof rank>>();
  for (const [season, rows] of bySeason) seasonRanks.set(season, rank(rows, now));
  const allTime = rank(sessions, now);
  const seasons = [...bySeason.keys()].sort().reverse();

  for (const member of members) {
    book.set(
      member.id,
      assemble(member, {
        mine: byMember.get(member.id) ?? [],
        firstInByDay,
        lastOutByDay,
        headcountByDay,
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


/* ---------------------------------------------------------- club awards */

/**
 * Goals the club chases together.
 *
 * These belong to nobody, so they never appear on a tile or a profile — only
 * on the awards page, with how far along the club is. A member cannot earn
 * "two thousand hours logged"; the club can, and seeing it two hundred short
 * is the part that makes it a goal rather than a statistic.
 */
export type ClubAward = {
  id: string;
  label: string;
  detail: string;
  shape: BadgeShape;
  /** Where the club is now, and what it is reaching for. */
  current: number;
  target: number;
  unit: string;
  done: boolean;
};

/** The next unmet rung, or the last one when they are all met. */
function nextRung(value: number, rungs: number[]): number {
  return rungs.find((r) => value < r) ?? rungs[rungs.length - 1];
}

export function clubAwards(members: Member[], sessions: Session[], now: number): ClubAward[] {
  const totalHours = sessions.reduce((sum, s) => sum + sessionMs(s, now), 0) / 3_600_000;

  const byDay = new Map<string, Set<string>>();
  const hoursByDay = new Map<string, number>();
  for (const s of sessions) {
    const day = clubDay(s.signedInAt);
    (byDay.get(day) ?? byDay.set(day, new Set()).get(day)!).add(s.memberId);
    hoursByDay.set(day, (hoursByDay.get(day) ?? 0) + sessionMs(s, now) / 3_600_000);
  }
  const fullest = Math.max(0, ...[...byDay.values()].map((who) => who.size));
  const longestNight = Math.max(0, ...hoursByDay.values());
  const seasons = new Set(sessions.map((s) => seasonOf(s.signedInAt))).size;
  const active = members.filter((m) => m.active).length;

  const rows: [string, string, BadgeShape, number, number[], string][] = [
    ["club-hours", "Hours logged", "gem", Math.round(totalHours), [500, 1000, 2500, 5000, 10000], "hours"],
    ["club-sessions", "Visits recorded", "layers", sessions.length, [250, 500, 1000, 2500, 5000], "visits"],
    ["club-members", "Members on the roster", "crown", active, [10, 25, 50, 100], "members"],
    ["club-full-house", "Full House", "sun", fullest, [10, 15, 20, 30], "in one night"],
    ["club-long-night", "Longest night", "moon", Math.round(longestNight), [20, 40, 60, 100], "hours in a day"],
    ["club-seasons", "Seasons run", "laurel", seasons, [2, 3, 5, 10], "seasons"],
  ];

  return rows.map(([id, label, shape, current, rungs, unit]) => {
    const target = nextRung(current, rungs);
    return {
      id,
      label,
      detail: `${current.toLocaleString()} of ${target.toLocaleString()} ${unit}`,
      shape,
      current,
      target,
      unit,
      done: current >= rungs[rungs.length - 1],
    };
  });
}
