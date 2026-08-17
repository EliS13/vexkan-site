import { CLUB_TIMEZONE } from "./schedule";
import type { Member, Session } from "./types";

/**
 * Every question the kiosk and the leaderboard ask about time, answered from
 * the session rows alone. Pure functions with `now` passed in rather than read
 * from the clock, so the arithmetic is testable and the same call gives the
 * same answer on the server and in the browser.
 */

/** The one open session for a member, if they are in the room. */
export function openSessionFor(sessions: Session[], memberId: string): Session | undefined {
  return sessions.find((s) => s.memberId === memberId && s.signedOutAt === null);
}

export function isSignedIn(sessions: Session[], memberId: string): boolean {
  return openSessionFor(sessions, memberId) !== undefined;
}

/**
 * How long one session lasted. An open session is measured to `now`.
 *
 * Clamped at zero: a session can read as negative when an iPad's clock is
 * behind the server's, and a negative slice would quietly eat real hours out of
 * a member's total rather than showing up as an obvious error.
 */
export function sessionMs(session: Session, now: number): number {
  const start = Date.parse(session.signedInAt);
  const end = session.signedOutAt === null ? now : Date.parse(session.signedOutAt);
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, end - start);
}

/** Total time in the room across every session, including the open one. */
export function totalMsFor(sessions: Session[], memberId: string, now: number): number {
  return sessions
    .filter((s) => s.memberId === memberId)
    .reduce((sum, s) => sum + sessionMs(s, now), 0);
}

export type MemberStanding = {
  member: Member;
  totalMs: number;
  /** Elapsed time in the current visit, or null when they are not in. */
  currentMs: number | null;
  visits: number;
  signedIn: boolean;
};

export function standingFor(
  member: Member,
  sessions: Session[],
  now: number,
): MemberStanding {
  const open = openSessionFor(sessions, member.id);
  return {
    member,
    totalMs: totalMsFor(sessions, member.id, now),
    currentMs: open ? sessionMs(open, now) : null,
    visits: sessions.filter((s) => s.memberId === member.id).length,
    signedIn: open !== undefined,
  };
}

/**
 * Sessions bucketed by member, built once per pass.
 *
 * standingFor walks the whole session list three times for every member, so a
 * roster of 24 with a season of 2,000 sessions did ~144,000 comparisons on each
 * render — and the clock re-renders every ten seconds. Bucketing first makes it
 * one pass over the sessions plus one pass over each member's own.
 *
 * Every function below returns exactly what the per-member version did; the
 * tests are unchanged and still pass.
 */
function bucketByMember(sessions: Session[]): Map<string, Session[]> {
  const byMember = new Map<string, Session[]>();
  for (const session of sessions) {
    const bucket = byMember.get(session.memberId);
    if (bucket) bucket.push(session);
    else byMember.set(session.memberId, [session]);
  }
  return byMember;
}

function standingFrom(member: Member, mine: Session[], now: number): MemberStanding {
  let totalMs = 0;
  let open: Session | undefined;
  for (const session of mine) {
    totalMs += sessionMs(session, now);
    if (session.signedOutAt === null) open = session;
  }
  return {
    member,
    totalMs,
    currentMs: open ? sessionMs(open, now) : null,
    visits: mine.length,
    signedIn: open !== undefined,
  };
}

const EMPTY: Session[] = [];

/**
 * By first name, not surname. Tiles read "Ben C.", so a member hunting for
 * their own tile is scanning first names; ordering by surname would send them
 * looking in the wrong place.
 */
const byName = (a: MemberStanding, b: MemberStanding) =>
  `${a.member.firstName} ${a.member.lastName}`.localeCompare(
    `${b.member.firstName} ${b.member.lastName}`,
  );

/**
 * Kiosk order: everyone signed in first, then alphabetical. This is what makes
 * "who is still here" readable without scrolling or counting.
 */
export function rosterOrder(
  members: Member[],
  sessions: Session[],
  now: number,
): MemberStanding[] {
  const byMember = bucketByMember(sessions);
  return members
    .filter((m) => m.active)
    .map((m) => standingFrom(m, byMember.get(m.id) ?? EMPTY, now))
    .sort((a, b) => {
      if (a.signedIn !== b.signedIn) return a.signedIn ? -1 : 1;
      return byName(a, b);
    });
}

/** Leaderboard order: most hours first, ties broken alphabetically so it is stable. */
export function leaderboard(
  members: Member[],
  sessions: Session[],
  now: number,
): MemberStanding[] {
  const byMember = bucketByMember(sessions);
  return members
    .filter((m) => m.active)
    .map((m) => standingFrom(m, byMember.get(m.id) ?? EMPTY, now))
    .sort((a, b) => b.totalMs - a.totalMs || byName(a, b));
}

/*
 * The club's year runs May 1st to April 30th, and rolls over on its own.
 *
 * All-time hours stopped being a live ranking once three years of paper went
 * in: the order barely moves, and somebody who joined in June reads their name
 * at the bottom of a list they cannot climb. Season hours reset with the club's
 * own year, so a member who keeps showing up rises.
 */
const SEASON_START_MONTH = 5; // May, 1-indexed as Intl reports it.

/** Club-local calendar date for an instant, as { year, month, day }. */
function clubDate(now: number, timeZone: string = CLUB_TIMEZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(now));
  const value = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  return { year: value("year"), month: value("month"), day: value("day") };
}

/**
 * The instant the current season began, as an ISO string to compare against
 * `signedInAt` directly. String comparison rather than parsing every row: the
 * timestamps are ISO and sort lexicographically, and this runs over thousands
 * of sessions on every kiosk render.
 */
export function seasonStart(now: number, timeZone: string = CLUB_TIMEZONE): string {
  const { year, month } = clubDate(now, timeZone);
  const startYear = month >= SEASON_START_MONTH ? year : year - 1;
  return `${startYear}-05-01`;
}

/** Only the sessions that began in the season containing `now`. */
export function seasonSessions(sessions: Session[], now: number): Session[] {
  const start = seasonStart(now);
  return sessions.filter((s) => s.signedInAt >= start);
}

/**
 * The board shown when somebody signs out: this season only, whole active
 * roster. Members who have not come yet sit at the bottom on zero rather than
 * being hidden, so the list is the club rather than a subset of it.
 */
export function seasonLeaderboard(
  members: Member[],
  sessions: Session[],
  now: number,
): MemberStanding[] {
  return leaderboard(members, seasonSessions(sessions, now), now);
}

/**
 * Where a member stands, 1-indexed, with ties sharing a place. Two members on
 * 12 hours are both 3rd and the next is 5th — the ordinary way a scoreboard
 * reads, and the alternative would tell one of them they beat somebody they
 * did not.
 */
export function placeOf(standings: MemberStanding[], memberId: string): number | null {
  const index = standings.findIndex((s) => s.member.id === memberId);
  if (index === -1) return null;
  const mine = standings[index].totalMs;
  return standings.findIndex((s) => s.totalMs === mine) + 1;
}

/**
 * A member's most recent visits, newest first, for the roster's expanded row.
 * Open sessions are included: "here now" is the most recent visit there is.
 */
export function recentVisits(sessions: Session[], memberId: string, limit = 5): Session[] {
  return sessions
    .filter((s) => s.memberId === memberId)
    .sort((a, b) => b.signedInAt.localeCompare(a.signedInAt))
    .slice(0, limit);
}

export function countSignedIn(members: Member[], sessions: Session[]): number {
  // One pass over the open sessions instead of a scan per member.
  const open = new Set<string>();
  for (const s of sessions) if (s.signedOutAt === null) open.add(s.memberId);
  return members.filter((m) => m.active && open.has(m.id)).length;
}

/**
 * Durations read at arm's length, so hours and minutes only — no seconds
 * ticking on a wall display, and no "0h" prefix to decode.
 */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 1) return "just now";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Decimal hours, the unit a coach reports. */
export function formatHours(ms: number): string {
  return (ms / 3_600_000).toFixed(1);
}

export type ClubTotals = {
  /** Every recorded minute, including visits still in progress. */
  totalMs: number;
  /** Members who have attended at least once. */
  attendees: number;
  /** Members on the roster who have never signed in. */
  neverAttended: number;
  sessions: number;
  /** Sessions still open right now. */
  openSessions: number;
  /** Sessions a job closed rather than a real sign-out, so hours are estimates. */
  autoClosed: number;
  averageSessionMs: number;
};

/**
 * The numbers a coach reports at the end of a season.
 *
 * Deactivated members are counted here even though the kiosk hides them: their
 * hours happened, and dropping them would make the club total disagree with the
 * sum of the per-member rows below it.
 */
export function clubTotals(
  members: Member[],
  sessions: Session[],
  now: number,
): ClubTotals {
  const attended = new Set(sessions.map((s) => s.memberId));
  const totalMs = sessions.reduce((sum, s) => sum + sessionMs(s, now), 0);
  return {
    totalMs,
    attendees: attended.size,
    neverAttended: members.filter((m) => !attended.has(m.id)).length,
    sessions: sessions.length,
    openSessions: sessions.filter((s) => s.signedOutAt === null).length,
    autoClosed: sessions.filter((s) => s.autoClosed).length,
    averageSessionMs: sessions.length === 0 ? 0 : Math.round(totalMs / sessions.length),
  };
}

/**
 * Every member by name, for the analytics table. Unlike the kiosk roster this
 * keeps deactivated members, so a season's report still accounts for someone
 * who left in March.
 */
export function alphabetical(
  members: Member[],
  sessions: Session[],
  now: number,
): MemberStanding[] {
  const byMember = bucketByMember(sessions);
  return members
    .map((m) => standingFrom(m, byMember.get(m.id) ?? EMPTY, now))
    .sort(byName);
}

/**
 * A fingerprint covering everything a tile draws: who exists, their name, their
 * photograph, their groups, and whether they are active. Any change to those
 * changes this, so a kiosk holding a stale roster notices on the next tap.
 */
export function rosterVersion(members: Member[]): string {
  let hash = 2166136261;
  const feed = (text: string) => {
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
  };
  for (const m of [...members].sort((a, b) => a.id.localeCompare(b.id))) {
    feed(m.id);
    feed(m.firstName);
    feed(m.lastName);
    feed(m.active ? "1" : "0");
    feed(m.groupIds.join(","));
    // The photo itself is large; its length moves whenever it is replaced.
    feed(String(m.photoUrl?.length ?? 0));
  }
  return `${members.length}-${(hash >>> 0).toString(36)}`;
}
