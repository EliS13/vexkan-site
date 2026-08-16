import { describe, it, expect } from "vitest";
import {
  countSignedIn,
  formatDuration,
  formatHours,
  isSignedIn,
  leaderboard,
  openSessionFor,
  rosterOrder,
  sessionMs,
  totalMsFor,
} from "./hours";
import type { Member, Session } from "./types";

const HOUR = 3_600_000;
const NOW = Date.parse("2026-08-16T19:00:00.000Z");

function member(id: string, firstName: string, lastName: string, active = true): Member {
  return {
    id,
    firstName,
    lastName,
    photoUrl: null,
    active,
    faceEmbedding: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

function session(
  id: string,
  memberId: string,
  inAt: string,
  outAt: string | null = null,
): Session {
  return {
    id,
    memberId,
    signedInAt: inAt,
    signedOutAt: outAt,
    autoClosed: false,
    verified: false,
    note: null,
  };
}

describe("presence", () => {
  it("reads a member with an open session as signed in", () => {
    const s = [session("s1", "m1", "2026-08-16T17:00:00.000Z")];
    expect(isSignedIn(s, "m1")).toBe(true);
    expect(openSessionFor(s, "m1")?.id).toBe("s1");
  });

  it("reads a member whose sessions are all closed as signed out", () => {
    const s = [session("s1", "m1", "2026-08-16T15:00:00.000Z", "2026-08-16T17:00:00.000Z")];
    expect(isSignedIn(s, "m1")).toBe(false);
    expect(openSessionFor(s, "m1")).toBeUndefined();
  });

  it("reads a member with no sessions at all as signed out", () => {
    expect(isSignedIn([], "m1")).toBe(false);
  });

  it("does not let one member's open session mark another present", () => {
    const s = [session("s1", "m1", "2026-08-16T17:00:00.000Z")];
    expect(isSignedIn(s, "m2")).toBe(false);
  });
});

describe("sessionMs", () => {
  it("measures a closed session between its own stamps", () => {
    const s = session("s1", "m1", "2026-08-16T15:00:00.000Z", "2026-08-16T17:30:00.000Z");
    expect(sessionMs(s, NOW)).toBe(2.5 * HOUR);
  });

  it("measures an open session up to now, not to the end of time", () => {
    const s = session("s1", "m1", "2026-08-16T17:00:00.000Z");
    expect(sessionMs(s, NOW)).toBe(2 * HOUR);
  });

  it("clamps a backwards session to zero rather than subtracting hours", () => {
    const s = session("s1", "m1", "2026-08-16T18:00:00.000Z", "2026-08-16T17:00:00.000Z");
    expect(sessionMs(s, NOW)).toBe(0);
  });

  it("returns zero for an unparseable stamp instead of NaN", () => {
    const s = session("s1", "m1", "not a date");
    expect(sessionMs(s, NOW)).toBe(0);
  });
});

describe("totalMsFor", () => {
  it("sums every session a member has", () => {
    const s = [
      session("s1", "m1", "2026-08-10T15:00:00.000Z", "2026-08-10T17:00:00.000Z"),
      session("s2", "m1", "2026-08-12T15:00:00.000Z", "2026-08-12T18:00:00.000Z"),
    ];
    expect(totalMsFor(s, "m1", NOW)).toBe(5 * HOUR);
  });

  it("counts the open session's elapsed time in the running total", () => {
    const s = [
      session("s1", "m1", "2026-08-10T15:00:00.000Z", "2026-08-10T17:00:00.000Z"),
      session("s2", "m1", "2026-08-16T18:00:00.000Z"),
    ];
    expect(totalMsFor(s, "m1", NOW)).toBe(3 * HOUR);
  });

  it("ignores other members' sessions", () => {
    const s = [
      session("s1", "m1", "2026-08-10T15:00:00.000Z", "2026-08-10T17:00:00.000Z"),
      session("s2", "m2", "2026-08-10T15:00:00.000Z", "2026-08-10T20:00:00.000Z"),
    ];
    expect(totalMsFor(s, "m1", NOW)).toBe(2 * HOUR);
  });

  it("is zero for a member who has never signed in", () => {
    expect(totalMsFor([], "m1", NOW)).toBe(0);
  });
});

describe("rosterOrder", () => {
  const members = [
    member("m1", "Priya", "Anand"),
    member("m2", "Ben", "Cardoso"),
    member("m3", "Zoë", "Whitfield"),
  ];

  it("puts signed-in members first, then sorts the rest by name", () => {
    const s = [session("s1", "m3", "2026-08-16T18:00:00.000Z")];
    expect(rosterOrder(members, s, NOW).map((r) => r.member.id)).toEqual(["m3", "m2", "m1"]);
  });

  it("sorts alphabetically when nobody is in", () => {
    expect(rosterOrder(members, [], NOW).map((r) => r.member.id)).toEqual(["m2", "m1", "m3"]);
  });

  /*
   * Fixture surnames run A, C, W while the first names run P, B, Z, so this
   * only passes under first-name ordering. Tiles show "Ben C.", and that is
   * what a member scans for.
   */
  it("orders by first name rather than surname", () => {
    const order = rosterOrder(members, [], NOW).map((r) => r.member.firstName);
    expect(order).toEqual(["Ben", "Priya", "Zoë"]);
  });

  it("sorts signed-in members among themselves by name", () => {
    const s = [
      session("s1", "m3", "2026-08-16T18:00:00.000Z"),
      session("s2", "m2", "2026-08-16T18:30:00.000Z"),
    ];
    expect(rosterOrder(members, s, NOW).map((r) => r.member.id)).toEqual(["m2", "m3", "m1"]);
  });

  it("leaves deactivated members off the kiosk entirely", () => {
    const withGone = [...members, member("m4", "Gone", "Away", false)];
    expect(rosterOrder(withGone, [], NOW).map((r) => r.member.id)).not.toContain("m4");
  });
});

describe("leaderboard", () => {
  const members = [member("m1", "Priya", "Anand"), member("m2", "Ben", "Cardoso")];

  it("ranks by total hours, most first", () => {
    const s = [
      session("s1", "m1", "2026-08-10T15:00:00.000Z", "2026-08-10T16:00:00.000Z"),
      session("s2", "m2", "2026-08-10T15:00:00.000Z", "2026-08-10T20:00:00.000Z"),
    ];
    expect(leaderboard(members, s, NOW).map((r) => r.member.id)).toEqual(["m2", "m1"]);
  });

  it("breaks ties alphabetically so the order does not jitter between renders", () => {
    const s = [
      session("s1", "m1", "2026-08-10T15:00:00.000Z", "2026-08-10T17:00:00.000Z"),
      session("s2", "m2", "2026-08-10T15:00:00.000Z", "2026-08-10T17:00:00.000Z"),
    ];
    expect(leaderboard(members, s, NOW).map((r) => r.member.id)).toEqual(["m2", "m1"]);
  });

  it("reports visit counts and current elapsed time alongside the total", () => {
    const s = [
      session("s1", "m1", "2026-08-10T15:00:00.000Z", "2026-08-10T17:00:00.000Z"),
      session("s2", "m1", "2026-08-16T18:00:00.000Z"),
    ];
    const top = leaderboard(members, s, NOW)[0];
    expect(top.member.id).toBe("m1");
    expect(top.visits).toBe(2);
    expect(top.currentMs).toBe(HOUR);
    expect(top.totalMs).toBe(3 * HOUR);
  });

  it("reports null current time for a member who is not in the room", () => {
    const s = [session("s1", "m1", "2026-08-10T15:00:00.000Z", "2026-08-10T17:00:00.000Z")];
    expect(leaderboard(members, s, NOW)[0].currentMs).toBeNull();
  });
});

describe("countSignedIn", () => {
  it("counts only active members holding an open session", () => {
    const members = [member("m1", "A", "A"), member("m2", "B", "B"), member("m3", "C", "C", false)];
    const s = [
      session("s1", "m1", "2026-08-16T18:00:00.000Z"),
      session("s2", "m3", "2026-08-16T18:00:00.000Z"),
      session("s3", "m2", "2026-08-10T15:00:00.000Z", "2026-08-10T17:00:00.000Z"),
    ];
    expect(countSignedIn(members, s)).toBe(1);
  });
});

describe("formatting", () => {
  it.each([
    [0, "just now"],
    [30_000, "just now"],
    [60_000, "1m"],
    [45 * 60_000, "45m"],
    [HOUR, "1h"],
    [HOUR + 60_000, "1h 1m"],
    [2 * HOUR + 14 * 60_000, "2h 14m"],
  ])("formats %ims as %s", (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected);
  });

  it("reports decimal hours for the coach's column", () => {
    expect(formatHours(2.5 * HOUR)).toBe("2.5");
    expect(formatHours(0)).toBe("0.0");
  });
});
