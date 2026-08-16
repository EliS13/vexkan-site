import type { Group } from "./types";

/**
 * Ordering groups by how relevant they are right now.
 *
 * At 4:28pm on a Tuesday the group that meets Tuesdays at 4:30 should be at the
 * top of the kiosk, because those are the members about to walk through the
 * door. Twenty minutes later the same group is mid-session and still the answer;
 * by 7pm it is not.
 *
 * All reasoning happens in the club's timezone, not the iPad's. A tablet left
 * on the wrong timezone would otherwise sort the room wrongly, and nobody would
 * think to check it.
 */

export const CLUB_TIMEZONE = "America/Edmonton";

/** Minutes before a group starts that it begins rising up the list. */
export const STARTING_SOON_MINUTES = 45;
/** Minutes after a group ends that it stays up, for stragglers signing out. */
export const JUST_ENDED_MINUTES = 30;

const MINUTES_PER_DAY = 1440;

export type Phase = "in-session" | "starting-soon" | "just-ended" | "later-today" | "scheduled";

export type GroupStanding = {
  group: Group;
  phase: Phase;
  /** Minutes until this group next starts. Negative while it is running. */
  minutesUntilStart: number;
  rank: number;
};

/** "16:30" to 990 minutes past midnight. */
export function parseClockTime(value: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return NaN;
  return hours * 60 + minutes;
}

export function formatClockTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const suffix = h < 12 ? "am" : "pm";
  const display = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${display}${suffix}` : `${display}:${String(m).padStart(2, "0")}${suffix}`;
}

/**
 * Weekday and minutes-past-midnight for an instant, read in the club's
 * timezone. Intl does the heavy lifting so daylight saving is handled by the
 * platform rather than by arithmetic here.
 */
export function clubTimeParts(
  now: number,
  timeZone: string = CLUB_TIMEZONE,
): { weekday: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(now));

  const lookup = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekday = days.indexOf(lookup("weekday"));
  // Midnight comes back as 24 in some ICU versions.
  const hour = Number(lookup("hour")) % 24;
  const minute = Number(lookup("minute"));

  return { weekday, minutes: hour * 60 + minute };
}

/**
 * Minutes from now until this group next begins. Negative while it is running,
 * so a group that started ten minutes ago reads as -10.
 */
export function minutesUntilStart(
  group: Group,
  now: number,
  timeZone: string = CLUB_TIMEZONE,
): number {
  const { weekday, minutes } = clubTimeParts(now, timeZone);
  const start = parseClockTime(group.startsAt);
  const end = parseClockTime(group.endsAt);
  if (Number.isNaN(start) || group.meetsOn.length === 0) return Infinity;

  // Running right now takes priority over any future occurrence.
  if (group.meetsOn.includes(weekday) && minutes >= start && minutes <= end) {
    return minutes - start === 0 ? 0 : -(minutes - start);
  }

  let best = Infinity;
  for (const day of group.meetsOn) {
    let dayOffset = (day - weekday + 7) % 7;
    // Today's slot has already been and gone, so look to next week's.
    if (dayOffset === 0 && start < minutes) dayOffset = 7;
    const until = dayOffset * MINUTES_PER_DAY + start - minutes;
    if (until < best) best = until;
  }
  return best;
}

export function phaseFor(
  group: Group,
  now: number,
  timeZone: string = CLUB_TIMEZONE,
): Phase {
  const { weekday, minutes } = clubTimeParts(now, timeZone);
  const start = parseClockTime(group.startsAt);
  const end = parseClockTime(group.endsAt);
  if (Number.isNaN(start) || Number.isNaN(end) || group.meetsOn.length === 0) return "scheduled";

  const meetsToday = group.meetsOn.includes(weekday);
  if (meetsToday && minutes >= start && minutes <= end) return "in-session";
  if (meetsToday && minutes > end && minutes - end <= JUST_ENDED_MINUTES) return "just-ended";

  const until = minutesUntilStart(group, now, timeZone);
  if (until > 0 && until <= STARTING_SOON_MINUTES) return "starting-soon";
  if (meetsToday && start > minutes) return "later-today";
  return "scheduled";
}

const PHASE_RANK: Record<Phase, number> = {
  "in-session": 0,
  "starting-soon": 1,
  "just-ended": 2,
  "later-today": 3,
  scheduled: 4,
};

/**
 * Groups in the order the kiosk should show them: whoever is in the room now,
 * then whoever is about to arrive, then the rest by how soon they next meet.
 */
export function orderGroups(
  groups: Group[],
  now: number,
  timeZone: string = CLUB_TIMEZONE,
): GroupStanding[] {
  return groups
    .filter((g) => g.active)
    .map((group) => {
      const phase = phaseFor(group, now, timeZone);
      return {
        group,
        phase,
        minutesUntilStart: minutesUntilStart(group, now, timeZone),
        rank: PHASE_RANK[phase],
      };
    })
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      // Within a phase, soonest first; ties fall back to name so it is stable.
      if (a.minutesUntilStart !== b.minutesUntilStart) {
        return a.minutesUntilStart - b.minutesUntilStart;
      }
      return a.group.name.localeCompare(b.group.name);
    });
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function describeSchedule(group: Group): string {
  if (group.meetsOn.length === 0) return "No set time";
  const days = [...group.meetsOn].sort((a, b) => a - b).map((d) => DAY_LABELS[d]).join(", ");
  const start = parseClockTime(group.startsAt);
  const end = parseClockTime(group.endsAt);
  if (Number.isNaN(start) || Number.isNaN(end)) return days;
  return `${days} ${formatClockTime(start)}–${formatClockTime(end)}`;
}

/** Plain-language phase, for the heading above each section on the kiosk. */
export function describePhase(standing: GroupStanding): string {
  switch (standing.phase) {
    case "in-session":
      return "On now";
    case "starting-soon":
      return `Starts in ${standing.minutesUntilStart}m`;
    case "just-ended":
      return "Just finished";
    case "later-today":
      return `Later today, ${formatClockTime(parseClockTime(standing.group.startsAt))}`;
    default:
      return describeSchedule(standing.group);
  }
}
