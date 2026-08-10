/**
 * Live Alberta competitions from the Public VEX Events API.
 *
 * events.vex.com is the only source now: the old RobotEvents API refuses
 * connections since VEX and the REC Foundation separated, so anything built
 * against api.robotevents.com is already dead.
 *
 * The token is a credential and is read from a server-only environment
 * variable. It must never be prefixed NEXT_PUBLIC_, which would ship it to the
 * browser in the page source.
 */

/**
 * Overridable so this can be pointed at a fixture or a staging API. Without it
 * the only way to see the rendered result is to hold a real token, which meant
 * shipping the markup unverified.
 */
const API = `${process.env.VEX_API_BASE ?? "https://events.vex.com/api/v2"}/events`;

/** One day. Competition calendars move over weeks, not minutes. */
export const REVALIDATE_SECONDS = 86400;

/** Shape of the pieces of the API's Event object that this site renders. */
type VexApiEvent = {
  id: number;
  sku: string;
  name: string;
  start?: string;
  end?: string;
  program?: { name?: string; code?: string };
  location?: { venue?: string; city?: string; region?: string; country?: string };
  event_type?: string;
};

export type LiveEvent = {
  id: string;
  name: string;
  program: string;
  /** Already formatted for display, since only this module knows the raw shape. */
  dates: string;
  location: string;
  /**
   * City and country. Signature Events run worldwide, and whether one is in
   * Calgary or Beijing is the first thing a club deciding whether to travel
   * needs to see.
   */
  place: string;
  url: string;
  startsAt: string;
};

export type LiveEventsResult =
  | { ok: true; events: LiveEvent[] }
  | { ok: false; reason: "unconfigured" | "unavailable" };

/**
 * "13 to 14 February 2027" for a range, a single date otherwise. Dates come
 * back as RFC3339, and are rendered in the event's own local terms rather than
 * the reader's, because a competition happens where it happens.
 */
export function formatDateRange(start?: string, end?: string): string {
  if (!start) return "Dates to be confirmed";

  const from = new Date(start);
  if (Number.isNaN(from.getTime())) return "Dates to be confirmed";

  const day = (d: Date) => d.getUTCDate();
  const monthYear = (d: Date) =>
    `${d.toLocaleString("en-CA", { month: "long", timeZone: "UTC" })} ${d.getUTCFullYear()}`;

  const to = end ? new Date(end) : null;

  /*
   * Compared by calendar day, not by timestamp. A one-day competition still
   * reports a start of 09:00 and an end of 18:00, which are different strings,
   * and comparing those rendered "13 to 13 February".
   */
  const sameDay =
    !to ||
    Number.isNaN(to.getTime()) ||
    from.toISOString().slice(0, 10) === to.toISOString().slice(0, 10);

  if (sameDay) return `${day(from)} ${monthYear(from)}`;

  if (monthYear(from) === monthYear(to)) return `${day(from)} to ${day(to)} ${monthYear(from)}`;
  return `${day(from)} ${monthYear(from)} to ${day(to)} ${monthYear(to)}`;
}

/** "BMO Centre, Calgary". Venue and city only, since full addresses are noise here. */
export function formatLocation(location?: VexApiEvent["location"]): string {
  const parts = [location?.venue, location?.city].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location to be confirmed";
}

/** "Calgary, Canada". How far away it is, which is what decides a trip. */
export function formatPlace(location?: VexApiEvent["location"]): string {
  const parts = [location?.city, location?.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location to be confirmed";
}

export function mapVexEvent(raw: VexApiEvent): LiveEvent {
  return {
    id: raw.sku || String(raw.id),
    name: raw.name,
    program: raw.program?.code || raw.program?.name || "VEX",
    dates: formatDateRange(raw.start, raw.end),
    location: formatLocation(raw.location),
    place: formatPlace(raw.location),
    url: `https://events.vex.com/robot-competitions/event/${raw.sku}.html`,
    startsAt: raw.start ?? "",
  };
}

/**
 * Drops anything that finished before today and orders soonest first, so the
 * page never opens on a competition that has already happened.
 */
export function upcomingFirst(events: LiveEvent[], now: Date = new Date()): LiveEvent[] {
  const today = now.toISOString().slice(0, 10);
  return events
    .filter((e) => !e.startsAt || e.startsAt.slice(0, 10) >= today)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/**
 * Which competition family a program code belongs to. VEX IQ codes carry "IQ";
 * everything else (V5RC, VURC, VAIRC) is the metal-robot side.
 */
export function programFamily(program: string): "iq" | "v5" {
  return /iq/i.test(program) ? "iq" : "v5";
}

/**
 * Picks the events to feature so both VEX IQ and V5RC appear when both exist.
 *
 * Straight chronology could show two V5RC events and leave a VEX IQ family
 * thinking the club only travels for the older students. This takes the soonest
 * of each family first, then fills any remaining slots in date order.
 */
export function featureBothPrograms(events: LiveEvent[], count = 2): LiveEvent[] {
  const picked: LiveEvent[] = [];
  const seen = new Set<string>();

  for (const family of ["iq", "v5"] as const) {
    const first = events.find((e) => programFamily(e.program) === family);
    if (first && !seen.has(first.id)) {
      picked.push(first);
      seen.add(first.id);
    }
  }

  for (const e of events) {
    if (picked.length >= count) break;
    if (!seen.has(e.id)) {
      picked.push(e);
      seen.add(e.id);
    }
  }

  return picked.slice(0, count).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/** Everything not featured, still in date order. */
export function remainingAfterFeature(events: LiveEvent[], featured: LiveEvent[]): LiveEvent[] {
  const ids = new Set(featured.map((e) => e.id));
  return events.filter((e) => !ids.has(e.id));
}

async function fetchEvents(query: string): Promise<LiveEventsResult> {
  const token = process.env.VEX_API_TOKEN;
  if (!token) return { ok: false, reason: "unconfigured" };

  const url = `${API}?${query}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      // Literal on purpose: Next requires this value to be statically analysable.
      next: { revalidate: 86400 },
    });

    if (!res.ok) return { ok: false, reason: "unavailable" };

    const body = (await res.json()) as { data?: VexApiEvent[] };
    if (!Array.isArray(body?.data)) return { ok: false, reason: "unavailable" };

    return { ok: true, events: upcomingFirst(body.data.map(mapVexEvent)) };
  } catch {
    /*
     * A failed fetch must never read as "no competitions this season". The
     * caller falls back to the hand-listed events and says the live list could
     * not be loaded.
     */
    return { ok: false, reason: "unavailable" };
  }
}

/** Competitions in Alberta, which is where the club's teams actually compete. */
export function fetchAlbertaEvents(): Promise<LiveEventsResult> {
  return fetchEvents("region=Alberta&per_page=50");
}

/**
 * Signature Events, worldwide. These are the invitational-scale events a club
 * travels for, so they are deliberately not filtered to Alberta: narrowing them
 * to one province would repeat the section above and hide the point.
 */
export function fetchSignatureEvents(): Promise<LiveEventsResult> {
  return fetchEvents("level%5B%5D=Signature&per_page=50");
}

/* ------------------------------------------------------------------ awards */

type VexApiAward = {
  id: number;
  title?: string;
  event?: { id?: number; name?: string };
};

type VexApiTeam = {
  id: number;
  number?: string;
};

export type LiveAward = {
  team: string;
  award: string;
  event: string;
};

export type LiveAwardsResult =
  | { ok: true; awards: LiveAward[] }
  | { ok: false; reason: "unconfigured" | "unavailable" };

/**
 * Award titles arrive with the program bolted on, like
 * "Excellence Award (VRC/VEXU)". The suffix is noise on a club page where the
 * team number already says which program it is.
 */
export function cleanAwardTitle(title: string): string {
  return title.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

/**
 * Newest first, then by team, so a reader scanning the table sees this season
 * before results from three years ago.
 */
export function sortAwards(awards: LiveAward[]): LiveAward[] {
  return [...awards].sort(
    (a, b) => b.event.localeCompare(a.event) || a.team.localeCompare(b.team)
  );
}

/** Same award listed twice, once per division, collapses to one row. */
export function dedupeAwards(awards: LiveAward[]): LiveAward[] {
  const seen = new Set<string>();
  return awards.filter((a) => {
    const key = `${a.team}|${a.award}|${a.event}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function mapAward(raw: VexApiAward, team: string): LiveAward | null {
  const title = raw.title ? cleanAwardTitle(raw.title) : "";
  const event = raw.event?.name ?? "";
  /* An award with no title or no event teaches a reader nothing, so it is
   * dropped rather than rendered as a blank row. */
  if (!title || !event) return null;
  return { team, award: title, event };
}

async function getJson<T>(url: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Every award the club's teams have won, straight from VEX.
 *
 * Two round trips per team per day, which is why it sits behind the same daily
 * cache as everything else. Any team that cannot be resolved is skipped rather
 * than failing the whole table.
 */
export async function fetchClubAwards(teamNumbers: string[]): Promise<LiveAwardsResult> {
  const token = process.env.VEX_API_TOKEN;
  if (!token) return { ok: false, reason: "unconfigured" };

  const base = process.env.VEX_API_BASE ?? "https://events.vex.com/api/v2";
  const query = teamNumbers.map((n) => `number%5B%5D=${encodeURIComponent(n)}`).join("&");

  const teams = await getJson<{ data?: VexApiTeam[] }>(`${base}/teams?${query}&per_page=50`, token);
  if (!teams || !Array.isArray(teams.data)) return { ok: false, reason: "unavailable" };

  const found = teams.data.filter((t) => t.number);
  if (found.length === 0) return { ok: false, reason: "unavailable" };

  const perTeam = await Promise.all(
    found.map(async (t) => {
      const res = await getJson<{ data?: VexApiAward[] }>(
        `${base}/teams/${t.id}/awards?per_page=250`,
        token
      );
      if (!res || !Array.isArray(res.data)) return [];
      return res.data
        .map((a) => mapAward(a, t.number as string))
        .filter((a): a is LiveAward => a !== null);
    })
  );

  return { ok: true, awards: sortAwards(dedupeAwards(perTeam.flat())) };
}
