import { describe, it, expect } from "vitest";
import { badgesFor, clubDay, longestStreak, seasonLabel, seasonOf, topBadges } from "./badges";
import type { Member, Session } from "./types";

const NOW = Date.parse("2026-08-16T19:00:00.000Z");

function member(id: string, firstName = "A", lastName = "B"): Member {
  return {
    id,
    firstName,
    lastName,
    photoUrl: null,
    active: true,
    groupIds: [],
    faceEmbedding: null,
    createdAt: "2024-01-01T00:00:00.000Z",
  };
}

/** A visit of `hours` starting at 6pm club time on the given day. */
function visit(id: string, memberId: string, day: string, hours = 2): Session {
  const start = `${day}T18:00:00.000-06:00`;
  return {
    id,
    memberId,
    signedInAt: new Date(start).toISOString(),
    signedOutAt: new Date(Date.parse(start) + hours * 3_600_000).toISOString(),
    autoClosed: false,
    verified: false,
    note: null,
  };
}

describe("seasons", () => {
  it("names a season by the year it began", () => {
    expect(seasonOf("2025-09-21T18:00:00.000-06:00")).toBe("2025");
    expect(seasonOf("2026-03-01T18:00:00.000-06:00")).toBe("2025");
    expect(seasonOf("2026-05-01T18:00:00.000-06:00")).toBe("2026");
  });

  it("reads the boundary in club time, not UTC", () => {
    // 03:00 UTC on May 1st is 9pm on April 30th in Edmonton.
    expect(seasonOf("2026-05-01T03:00:00.000Z")).toBe("2025");
  });

  it("labels a season the way a club writes it", () => {
    expect(seasonLabel("2025")).toBe("2025–26");
  });

  it("reads a club day in club time", () => {
    expect(clubDay("2026-05-01T03:00:00.000Z")).toBe("2026-04-30");
  });
});

describe("longestStreak", () => {
  it("counts consecutive days the club was open, not calendar days", () => {
    // The club met Mon, Wed, Fri. m1 came to all three.
    const s = [
      visit("a", "m1", "2026-06-01"),
      visit("b", "m1", "2026-06-03"),
      visit("c", "m1", "2026-06-05"),
    ];
    expect(longestStreak(s, "m1")).toBe(3);
  });

  it("breaks the run on a club day the member missed", () => {
    const s = [
      visit("a", "m1", "2026-06-01"),
      visit("b", "m2", "2026-06-03"),
      visit("c", "m1", "2026-06-05"),
    ];
    expect(longestStreak(s, "m1")).toBe(1);
  });

  it("keeps the longest run, not the latest", () => {
    const s = [
      visit("a", "m1", "2026-06-01"),
      visit("b", "m1", "2026-06-03"),
      visit("c", "m1", "2026-06-05"),
      visit("d", "m2", "2026-06-08"),
      visit("e", "m1", "2026-06-10"),
    ];
    expect(longestStreak(s, "m1")).toBe(3);
  });

  it("is zero for somebody who never came", () => {
    expect(longestStreak([visit("a", "m2", "2026-06-01")], "m1")).toBe(0);
  });
});

describe("badgesFor", () => {
  const m1 = member("m1");

  it("gives nothing to a member with no sessions", () => {
    expect(badgesFor(m1, [], NOW)).toEqual([]);
  });

  it("awards a season podium place", () => {
    const s = [visit("a", "m1", "2026-06-01", 5), visit("b", "m2", "2026-06-01", 1)];
    const season = badgesFor(m1, s, NOW).find((b) => b.id === "season-2026");
    expect(season?.tier).toBe("gold");
    expect(season?.label).toBe("2026–27");
  });

  it("awards a podium three deep and no further", () => {
    const day = "2026-06-01";
    // m1 sits fourth of four: ahead of nobody, behind three.
    const s = [
      visit("a", "m1", day, 1),
      visit("b", "m2", day, 4),
      visit("c", "m3", day, 3),
      visit("d", "m4", day, 2),
    ];
    expect(badgesFor(m1, s, NOW).some((b) => b.id.startsWith("season-"))).toBe(false);
    expect(badgesFor(member("m4"), s, NOW).find((b) => b.id.startsWith("season-"))?.tier).toBe(
      "bronze",
    );
  });

  it("strikes the placing into the medal", () => {
    const day = "2026-06-01";
    const s = [visit("a", "m1", day, 4), visit("b", "m2", day, 1)];
    const medal = badgesFor(m1, s, NOW).find((b) => b.shape === "medal");
    expect(medal?.place).toBe(1);
  });

  it("marks a member who came back across seasons", () => {
    const s = [visit("a", "m1", "2025-09-21"), visit("b", "m1", "2026-06-01")];
    const veteran = badgesFor(m1, s, NOW).find((b) => b.id.startsWith("veteran-"));
    expect(veteran?.label).toBe("Returned");
  });

  it("calls three seasons Running it back", () => {
    const s = [
      visit("a", "m1", "2024-12-30"),
      visit("b", "m1", "2025-09-21"),
      visit("c", "m1", "2026-06-01"),
    ];
    expect(badgesFor(m1, s, NOW).find((b) => b.id.startsWith("veteran-"))?.label).toBe(
      "Running it back",
    );
  });

  it("reports only the highest hour milestone reached", () => {
    const s = Array.from({ length: 30 }, (_, i) =>
      visit(`v${i}`, "m1", `2026-06-${String(i + 1).padStart(2, "0")}`, 2),
    );
    const marks = badgesFor(m1, s, NOW).filter((b) => b.id.startsWith("hours-"));
    expect(marks).toHaveLength(1);
    expect(marks[0].id).toBe("hours-50");
  });

  it("awards a marathon for one long sitting", () => {
    const s = [visit("a", "m1", "2026-06-01", 5)];
    expect(badgesFor(m1, s, NOW).some((b) => b.id === "marathon")).toBe(true);
  });

  it("does not award a marathon for the same hours spread over visits", () => {
    const s = [visit("a", "m1", "2026-06-01", 2), visit("b", "m1", "2026-06-02", 3)];
    expect(badgesFor(m1, s, NOW).some((b) => b.id === "marathon")).toBe(false);
  });

  it("puts the all-time podium above a season place", () => {
    const s = [visit("a", "m1", "2026-06-01", 5), visit("b", "m2", "2026-06-01", 1)];
    expect(badgesFor(m1, s, NOW)[0].id).toBe("all-time");
  });

  it("caps a tile at three badges", () => {
    const s = [
      visit("a", "m1", "2024-12-30", 5),
      visit("b", "m1", "2025-09-21", 5),
      visit("c", "m1", "2026-06-01", 5),
    ];
    const all = badgesFor(m1, s, NOW);
    expect(all.length).toBeGreaterThan(3);
    expect(topBadges(all)).toHaveLength(3);
  });
});

describe("secret achievements", () => {
  const m1 = member("m1");

  /** A visit on `day`, starting at `startHour` club time, lasting `hours`. */
  function at(id: string, memberId: string, day: string, startHour: number, hours = 2): Session {
    const start = `${day}T${String(startHour).padStart(2, "0")}:00:00.000-06:00`;
    return {
      id,
      memberId,
      signedInAt: new Date(start).toISOString(),
      signedOutAt: new Date(Date.parse(start) + hours * 3_600_000).toISOString(),
      autoClosed: false,
      verified: false,
      note: null,
    };
  }
  const has = (s: Session[], id: string) => badgesFor(m1, s, NOW).some((b) => b.id === id);






  it("gives Dawn Patrol only before 8am", () => {
    expect(has([at("a", "m1", "2026-06-01", 7)], "dawn-patrol")).toBe(true);
    expect(has([at("b", "m1", "2026-06-01", 9)], "dawn-patrol")).toBe(false);
  });

  it("gives All Nighter when the sign-out lands on the next day", () => {
    const s = [at("a", "m1", "2026-06-01", 20, 6)];
    expect(has(s, "all-nighter")).toBe(true);
    expect(has([at("b", "m1", "2026-06-01", 18, 2)], "all-nighter")).toBe(false);
  });

  it("gives the longest sittings the diamond rung, above gold", () => {
    const badges = badgesFor(m1, [at("a", "m1", "2026-06-01", 6, 15)], NOW);
    const sitting = badges.find((b) => b.shape === "clock");
    expect(sitting?.label).toBe("Super Ultramarathon");
    expect(sitting?.tier).toBe("diamond");
  });

  it("gives Ironclad only for hours and a streak together", () => {
    // 120 hours, but every visit on the same day: no streak.
    const heavy = Array.from({ length: 30 }, (_, i) => at(`h${i}`, "m1", "2026-06-01", 8, 4));
    expect(has(heavy, "ironclad")).toBe(false);
  });

  it("keeps secrets out of the podium weighting", () => {
    const s = [at("a", "m1", "2026-06-01", 8, 4), at("b", "m2", "2026-06-01", 8, 1)];
    const badges = badgesFor(m1, s, NOW);
    // The season medal still leads; a secret never outranks a placing.
    expect(badges[0].shape).not.toBe("sun");
  });
});

describe("Founder", () => {
  it("goes to the club's founder and nobody else", () => {
    const s = [
      {
        id: "s1",
        memberId: "m9",
        signedInAt: "2026-06-01T18:00:00.000-06:00",
        signedOutAt: "2026-06-01T20:00:00.000-06:00",
        autoClosed: false,
        verified: false,
        note: null,
      },
    ];
    const eli = { ...member("m9"), firstName: "Eli", lastName: "Seeliger" };
    expect(badgesFor(eli, s, NOW).some((b) => b.id === "founder")).toBe(true);
    expect(badgesFor(member("m9"), s, NOW).some((b) => b.id === "founder")).toBe(false);
  });
});
