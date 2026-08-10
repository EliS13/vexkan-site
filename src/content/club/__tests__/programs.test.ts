import { describe, expect, it } from "vitest";
import {
  getProgram,
  programSlugs,
  programs,
  programsByTrack,
  TRACK_LABELS,
} from "@/content/club/programs";

describe("programs", () => {
  it("has the eight programs the club runs", () => {
    expect(programs).toHaveLength(8);
  });

  it("uses unique slugs", () => {
    expect(new Set(programSlugs()).size).toBe(8);
  });

  it("finds a program by slug", () => {
    const p = getProgram("vex-iq-foundation-g1-2");
    expect(p?.title).toBe("VEX IQ Foundation Class");
    expect(p?.gradeLabel).toBe("Grades 1–2");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getProgram("not-a-program")).toBeUndefined();
  });

  it("groups the four foundation classes onto one track", () => {
    expect(programsByTrack("iq-foundation")).toHaveLength(4);
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

  it("orders foundation classes by ascending grade", () => {
    const grades = programsByTrack("iq-foundation").map((p) => p.gradeMin);
    expect(grades).toEqual([1, 3, 5, 7]);
  });
});
