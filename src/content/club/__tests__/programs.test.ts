import { describe, expect, it } from "vitest";
import {
  getProgram,
  programSlugs,
  programs,
  programsByTrack,
  TRACK_LABELS,
} from "@/content/club/programs";

describe("programs", () => {
  it("has the four programs the club runs", () => {
    expect(programs).toHaveLength(4);
  });

  it("uses unique slugs", () => {
    expect(new Set(programSlugs()).size).toBe(4);
  });

  /*
   * The summer camp was withdrawn. It is asserted gone rather than merely
   * absent from the count, so re-adding it has to be a deliberate act.
   */
  it("no longer offers the summer camp", () => {
    expect(getProgram("summer-camp")).toBeUndefined();
    expect(programs.every((p) => p.track !== ("camp" as never))).toBe(true);
  });

  it("finds a program by slug", () => {
    const p = getProgram("vex-iq-foundation");
    expect(p?.title).toBe("VEX IQ Foundation Class");
    expect(p?.gradeLabel).toBe("Grades 3–5, older beginners welcome");
  });

  /*
   * Grades 1 and 2 were dropped as too young for the kit, and the four
   * per-grade foundation bands collapsed into one class.
   */
  it("starts at Grade 3 and offers a single foundation class", () => {
    expect(programsByTrack("iq-foundation")).toHaveLength(1);
    expect(getProgram("vex-iq-foundation-g1-2")).toBeUndefined();
    for (const p of programs) {
      expect(p.gradeMin === null || p.gradeMin >= 3).toBe(true);
    }
  });

  it("returns undefined for an unknown slug", () => {
    expect(getProgram("not-a-program")).toBeUndefined();
  });

  it("groups the two IQ competition teams onto one track", () => {
    expect(programsByTrack("iq-competition")).toHaveLength(2);
  });

  it("labels every track", () => {
    for (const p of programs) {
      expect(TRACK_LABELS[p.track]).toBeTruthy();
    }
  });

  it("gives every program a summary and at least three learning outcomes", () => {
    for (const p of programs) {
      expect(p.summary.length).toBeGreaterThan(20);
      expect(p.learn.length).toBeGreaterThanOrEqual(3);
    }
  });

  /* No Google Forms remain, so nothing can send a family off-site. */
  it("carries no external signup links", () => {
    for (const p of programs) {
      expect("legacyFormUrl" in p).toBe(false);
    }
  });
});
