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

/**
 * VEX U is a university competition. The club runs elementary through high
 * school, so those events are noise on every page here.
 *
 * The program code alone is not enough: some VEX U divisions come back tagged
 * V5RC with "VEX U" only in the name, so the name is checked too.
 */
export function isVexU(raw: { name?: string; program?: { code?: string; name?: string } }): boolean {
  const code = raw.program?.code ?? "";
  if (/^VURC$/i.test(code)) return true;
  return /\bVEX ?U\b/i.test(raw.name ?? "");
}

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
  /** Kept so Signature Events can be filtered to the ones worth travelling to. */
  region: string;
  country: string;
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
    region: raw.location?.region ?? "",
    country: raw.location?.country ?? "",
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

    const usable = body.data.filter((e) => !isVexU(e));
    return { ok: true, events: upcomingFirst(usable.map(mapVexEvent)) };
  } catch {
    /*
     * A failed fetch must never read as "no competitions this season". The
     * caller falls back to the hand-listed events and says the live list could
     * not be loaded.
     */
    return { ok: false, reason: "unavailable" };
  }
}

/**
 * Today, as an RFC3339 date. The API needs this: it returns a region's whole
 * history oldest-first, so without it the first page is events from 2014 and
 * the upcoming filter leaves the section empty.
 */
function fromToday(): string {
  return `${new Date().toISOString().slice(0, 10)}T00:00:00Z`;
}

/** Competitions in Alberta, which is where the club's teams actually compete. */
export function fetchAlbertaEvents(): Promise<LiveEventsResult> {
  return fetchEvents(`region=Alberta&start=${encodeURIComponent(fromToday())}&per_page=50`);
}

/**
 * Signature Events the club could realistically travel to.
 *
 * Alberta's own Signature Event is excluded because it already appears in the
 * section above, and the rest of the world is excluded because a Calgary club
 * is not flying to Hong Kong or Bangkok for a weekend. What is left is the US
 * and the rest of Canada, which is the honest answer to "where could we go".
 */
export function isWithinReach(e: LiveEvent): boolean {
  const nearby = ["United States", "Canada"];
  if (!nearby.includes(e.country)) return false;
  return e.region !== "Alberta";
}

export async function fetchSignatureEvents(): Promise<LiveEventsResult> {
  const res = await fetchEvents(
    `level%5B%5D=Signature&start=${encodeURIComponent(fromToday())}&per_page=100`
  );
  if (!res.ok) return res;
  return { ok: true, events: res.events.filter(isWithinReach) };
}
