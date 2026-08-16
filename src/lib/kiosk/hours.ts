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
  return members
    .filter((m) => m.active)
    .map((m) => standingFor(m, sessions, now))
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
  return members
    .filter((m) => m.active)
    .map((m) => standingFor(m, sessions, now))
    .sort((a, b) => b.totalMs - a.totalMs || byName(a, b));
}

export function countSignedIn(members: Member[], sessions: Session[]): number {
  return members.filter((m) => m.active && isSignedIn(sessions, m.id)).length;
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
