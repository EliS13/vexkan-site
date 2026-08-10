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
  it("lists all nine teams the club runs", () => {
    expect(teams.map((t) => t.number).sort()).toEqual(
      ["16688A", "16688K", "36467E", "565A", "565D", "595A", "595B", "595C", "595Y"]
    );
  });

  /*
   * Team numbers repeat across programs: 595B, 16688A and 16688K each also
   * exist as another club's team in the other program. The name is what makes
   * ours identifiable, so every team must carry one.
   */
  it("names every team, so it cannot be confused with another club's", () => {
    for (const t of teams) expect(t.name.length).toBeGreaterThan(2);
  });

  it("puts both 595 teams in VEX IQ and 16688A in V5RC", () => {
    expect(teams.find((t) => t.number === "595C")?.program).toBe("VEX IQ");
    expect(teams.find((t) => t.number === "595Y")?.program).toBe("VEX IQ");
    expect(teams.find((t) => t.number === "16688A")?.program).toBe("V5RC");
  });

  it("assigns every team a grade level", () => {
    for (const t of teams) expect(["ES", "MS", "HS"]).toContain(t.grade);
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

  /*
   * A deliberate floor, not a tally. The list holds what could be evidenced
   * from VEX's records and the club's certificates; the club has won more
   * across the teams it has mentored than that list can prove.
   */
  it("states the award count as a floor", () => {
    expect(achievements[0]).toBe("30+ awards");
    expect(clubAwards.count).toMatch(/\+$/);
  });

  it("has at least as many recorded awards as it claims", () => {
    expect(awards.length).toBeGreaterThanOrEqual(30);
  });

  /*
   * "30+" is a floor the club can stand behind. An exact number would need
   * recounting every season, and would be wrong the moment a team won again.
   */

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

  /* Read from the VEX API, so these are the club's real record, not a claim. */
  it("carries the awards VEX has on record for our teams", () => {
    const has = (team: string, award: string) =>
      awards.some((a) => a.team === team && a.award === award);
    expect(has("16688A", "Inspire Award")).toBe(true);
    expect(has("595Y", "Excellence Award")).toBe(true);
    expect(has("595C", "Design Award")).toBe(true);
    expect(has("36467E", "Judges Award")).toBe(true);
  });

  it("only credits awards to teams the club actually runs", () => {
    const ours = new Set(teams.map((t) => t.number));
    for (const a of awards) expect(ours.has(a.team)).toBe(true);
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
