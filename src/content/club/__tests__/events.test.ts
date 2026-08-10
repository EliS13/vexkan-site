import { describe, expect, it } from "vitest";
import { achievements, clubAwards, events, inspireAward, teams } from "@/content/club/events";
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
  it("lists the club's four competition teams", () => {
    expect(teams.map((t) => t.number).sort()).toEqual(["16688A", "36467E", "595C", "595Y"]);
  });

  it("puts both 595 teams in VEX IQ and 16688A in V5RC", () => {
    expect(teams.find((t) => t.number === "595C")?.program).toBe("VEX IQ");
    expect(teams.find((t) => t.number === "595Y")?.program).toBe("VEX IQ");
    expect(teams.find((t) => t.number === "16688A")?.program).toBe("V5RC");
  });

  it("marks 36467E as the only past team", () => {
    expect(teams.find((t) => t.number === "36467E")?.status).toBe("past");
    expect(teams.filter((t) => t.status === "active")).toHaveLength(3);
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
  it("records the Worlds results and the U.S. Open invitations", () => {
    const joined = achievements.join(" ");
    expect(joined).toContain("World Championship");
    expect(joined).toContain("U.S. Open");
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

  it("states each team's real Worlds placing", () => {
    const joined = achievements.join(" ");
    expect(joined).toContain("7th out of 84");
    expect(joined).toContain("18th");
    expect(joined).toContain("31st");
    expect(joined).toContain("Inspire Award");
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
