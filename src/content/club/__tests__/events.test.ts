import { describe, expect, it } from "vitest";
import {
  achievements,
  awards,
  clubAwards,
  events,
  inspireAward,
  placings,
  teams,
} from "@/content/club/events";
import { people } from "@/content/club/people";

describe("people", () => {
  it("lists the founder and nobody else", () => {
    expect(people.map((p) => p.name)).toEqual(["Eli Seeliger"]);
  });

  it("gives every leader a role and a bio", () => {
    for (const p of people) {
      expect(p.role).toBeTruthy();
      expect(p.bio.length).toBeGreaterThan(20);
    }
  });
});

describe("teams", () => {
  it("lists every team the club has competed under", () => {
    expect(teams.map((t) => t.number).sort()).toEqual(
      ["16688A", "36467E", "565A", "565D", "595B", "595C", "595Y"]
    );
  });

  it("puts both 595 teams in VEX IQ and 16688A in V5RC", () => {
    expect(teams.find((t) => t.number === "595C")?.program).toBe("VEX IQ");
    expect(teams.find((t) => t.number === "595Y")?.program).toBe("VEX IQ");
    expect(teams.find((t) => t.number === "16688A")?.program).toBe("V5RC");
  });

  it("keeps three teams active and the rest retired", () => {
    expect(teams.filter((t) => t.status === "active").map((t) => t.number).sort())
      .toEqual(["16688A", "595C", "595Y"]);
    expect(teams.filter((t) => t.status === "past")).toHaveLength(4);
  });

  /* The retired 595B, 565D and 565A all reached Alberta provincials. */
  it("records the provincial run for the retired IQ teams", () => {
    for (const n of ["595B", "565D", "565A"]) {
      expect(teams.find((t) => t.number === n)?.note).toContain("provincial");
    }
  });
});

describe("events", () => {
  it("lists the regional competitions and the Worlds result", () => {
    expect(events.length).toBeGreaterThanOrEqual(3);
    expect(events.some((e) => e.name.includes("World Championship"))).toBe(true);
  });

  it("gives every event a unique slug", () => {
    const slugs = events.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("achievements", () => {
  it("keeps only the club-wide figure, not a specific team's result", () => {
    expect(achievements).toHaveLength(1);
    /* A team's award belongs to that team, credited by name in `awards`. */
    const joined = achievements.join(" ");
    for (const t of ["16688A", "595C", "595Y", "36467E"]) {
      expect(joined).not.toContain(t);
    }
  });

  /* The U.S. Open invitation is 16688A's, so it moved into the awards table. */
  it("credits the U.S. Open invitation to 16688A", () => {
    const usOpen = awards.find((a) => a.award.includes("U.S. Open"));
    expect(usOpen?.team).toBe("16688A");
  });

  it("leads with the club-wide award count", () => {
    expect(achievements[0]).toBe("30+ awards across the teams we have mentored");
  });

  /*
   * "30+" is a floor the club can stand behind. An exact number would need
   * recounting every season, and would be wrong the moment a team won again.
   */
  it("keeps the award count as a floor rather than an exact figure", () => {
    expect(clubAwards.count).toMatch(/\+$/);
  });

  it("states each team's real Worlds finish", () => {
    const by = (t: string) => placings.find((p) => p.team === t)?.place;
    expect(by("16688A")).toBe("7th of 84");
    expect(by("595C")).toBe("18th");
    expect(by("595Y")).toBe("31st");
  });

  /*
   * The old site said "two invitations" to Worlds. Three teams have since been,
   * so any hard count here would be wrong until the club confirms one.
   */
  it("does not claim a specific number of Worlds invitations", () => {
    const joined = achievements.join(" ");
    expect(joined).not.toMatch(/\b(two|three|2|3) invitations\b/i);
  });
});

describe("awards", () => {
  const by = (t: string) => awards.filter((a) => a.team === t).map((a) => a.award);

  it("credits every award to the team that won it", () => {
    expect(by("16688A")).toContain("Inspire Award");
    expect(by("595Y")).toContain("Excellence Award");
    expect(by("595C")).toContain("Design Award");
    expect(by("36467E")).toContain("Judges Award");
  });

  it("names the event each award came from", () => {
    for (const a of awards) {
      expect(a.event.length).toBeGreaterThan(5);
      expect(a.team).toBeTruthy();
    }
  });

  it("puts the provincial awards at the provincial championship", () => {
    for (const t of ["595Y", "595C", "36467E"]) {
      expect(awards.find((a) => a.team === t)?.event).toContain("Provincial");
    }
  });
});

describe("inspireAward", () => {
  it("credits 16688A at the World Championship", () => {
    expect(inspireAward.team).toBe("16688A");
    expect(inspireAward.event).toContain("World Championship");
  });

  it("lists the four judging criteria", () => {
    expect(inspireAward.criteria).toHaveLength(4);
    for (const c of inspireAward.criteria) {
      expect(c.length).toBeGreaterThan(20);
    }
  });

  /*
   * The criteria are summarised from the REC Foundation rather than quoted, so
   * the page must always be able to point a reader at the official wording.
   */
  it("links to the REC Foundation source", () => {
    expect(inspireAward.sourceUrl).toMatch(/^https:\/\/.*recf\.org/);
    expect(inspireAward.sourceLabel).toBeTruthy();
  });
});
