import { describe, expect, it } from "vitest";
import { achievements, events, teams } from "@/content/club/events";
import { people } from "@/content/club/people";

describe("people", () => {
  it("lists the three club leaders", () => {
    expect(people.map((p) => p.name)).toEqual(["Eli Seeliger", "Alex Han", "Michael Li"]);
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
  it("records the Worlds and U.S. Open invitations", () => {
    const joined = achievements.join(" ");
    expect(joined).toContain("World Championship");
    expect(joined).toContain("U.S. Open");
  });
});
