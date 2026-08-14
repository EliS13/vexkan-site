import { describe, expect, it } from "vitest";
import { MAX_MS, MIN_MS, durationFor, offsetAt } from "./backToTop";

/*
 * This control shipped broken twice. Both times the fault was in when the
 * scroll was considered finished rather than in anything visual, and both times
 * it went unnoticed because an automated browser cannot watch a scroll animate:
 * the tab is backgrounded, so frames never run. These cover the part that can
 * be pinned down exactly.
 */

describe("durationFor", () => {
  it("does not crawl across a very long page", () => {
    /* The home page. A distance-proportional duration would be ~10 seconds. */
    expect(durationFor(41991)).toBe(MAX_MS);
  });

  it("does not dawdle over a short hop", () => {
    expect(durationFor(50)).toBe(MIN_MS);
  });

  it("stays within the bounds at every distance", () => {
    for (const distance of [0, 1, 800, 2500, 6000, 40000, 1_000_000]) {
      const ms = durationFor(distance);
      expect(ms).toBeGreaterThanOrEqual(MIN_MS);
      expect(ms).toBeLessThanOrEqual(MAX_MS);
    }
  });
});

describe("offsetAt", () => {
  const from = 6000;
  const duration = durationFor(from);

  it("starts where the page already is", () => {
    expect(offsetAt(from, 0, duration)).toBe(from);
  });

  it("lands on exactly zero, not near it", () => {
    /* A pixel left behind would leave the header just off screen. */
    expect(offsetAt(from, duration, duration)).toBe(0);
  });

  it("never turns back or overshoots", () => {
    let previous = Infinity;
    for (let elapsed = 0; elapsed <= duration; elapsed += 8) {
      const offset = offsetAt(from, elapsed, duration);
      expect(offset).toBeLessThanOrEqual(previous);
      expect(offset).toBeGreaterThanOrEqual(0);
      previous = offset;
    }
  });

  it("eases out rather than running at a constant speed", () => {
    /* Past the halfway point in time, most of the distance is already done. */
    const halfway = offsetAt(from, duration / 2, duration);
    expect(halfway).toBeLessThan(from / 2);
  });

  it("clamps a frame that arrives late instead of going negative", () => {
    /* A backgrounded tab can hand back a frame long after it was asked for. */
    expect(offsetAt(from, duration * 10, duration)).toBe(0);
  });

  it("clamps a frame timestamped before the start", () => {
    expect(offsetAt(from, -50, duration)).toBe(from);
  });

  it("treats a zero duration as already arrived", () => {
    expect(offsetAt(from, 0, 0)).toBe(0);
  });
});
