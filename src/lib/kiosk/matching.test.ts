import { describe, it, expect } from "vitest";
import {
  checkQuality,
  distanceToMember,
  euclidean,
  identify,
  voteAcrossFrames,
  IDENTIFY_DISTANCE,
  MIN_MARGIN,
  type EnrolledFace,
  type MatchResult,
} from "./matching";

/**
 * Descriptors here are short vectors rather than the real 128 dimensions. The
 * matcher is dimension-agnostic and the arithmetic is identical, so short
 * vectors make the intended distances legible in the test itself.
 */
const at = (x: number, y = 0): number[] => [x, y];

function face(memberId: string, ...descriptors: number[][]): EnrolledFace {
  return { memberId, descriptors };
}

describe("euclidean", () => {
  it("is zero for identical descriptors", () => {
    expect(euclidean([1, 2, 3], [1, 2, 3])).toBe(0);
  });

  it("measures straight-line distance", () => {
    expect(euclidean([0, 0], [3, 4])).toBe(5);
  });

  it("refuses to compare descriptors of different lengths", () => {
    expect(() => euclidean([1, 2], [1, 2, 3])).toThrow(/lengths differ/);
  });
});

describe("distanceToMember", () => {
  it("uses the closest enrolled angle, not the first or the average", () => {
    const enrolled = face("m1", at(0), at(10), at(0.9));
    expect(distanceToMember(at(1), enrolled)).toBeCloseTo(0.1, 5);
  });

  it("is Infinity when a member has no enrolled descriptors", () => {
    expect(distanceToMember(at(1), face("m1"))).toBe(Infinity);
  });
});

describe("identify", () => {
  it("accepts a clear winner well inside the threshold", () => {
    const roster = [face("m1", at(0)), face("m2", at(5))];
    const result = identify(at(0.1), roster);
    expect(result.decision).toBe("accept");
    expect(result.memberId).toBe("m1");
  });

  it("returns unknown when the closest member is beyond the threshold", () => {
    const roster = [face("m1", at(0)), face("m2", at(5))];
    const result = identify(at(2), roster);
    expect(result.decision).toBe("unknown");
    expect(result.memberId).toBeNull();
    // The distance is still reported, so a coach can see how near it got.
    expect(result.distance).toBe(2);
  });

  it("refuses a match when two members are nearly equally close", () => {
    // Both within the threshold, separated by less than the required margin.
    const roster = [face("m1", at(0.2)), face("m2", at(0.26))];
    const result = identify(at(0), roster);
    expect(result.decision).toBe("ambiguous");
    expect(result.runnerUpMemberId).toBe("m2");
  });

  it("accepts once the runner-up is clear of the margin", () => {
    const roster = [face("m1", at(0.2)), face("m2", at(0.45))];
    const result = identify(at(0), roster);
    expect(result.decision).toBe("accept");
    expect(result.memberId).toBe("m1");
  });

  it("uses a stricter threshold than one-to-one verification", () => {
    // 0.55 would pass a 0.6 verification check but must not identify.
    const roster = [face("m1", at(0.55))];
    expect(identify(at(0), roster).decision).toBe("unknown");
    expect(IDENTIFY_DISTANCE).toBeLessThan(0.6);
  });

  it("handles an empty roster without matching anything", () => {
    const result = identify(at(0), []);
    expect(result.decision).toBe("unknown");
    expect(result.memberId).toBeNull();
  });

  it("ignores members who have no descriptors enrolled", () => {
    const roster = [face("m1"), face("m2", at(0.1))];
    const result = identify(at(0), roster);
    expect(result.memberId).toBe("m2");
    expect(result.decision).toBe("accept");
  });

  it("accepts a lone candidate with no runner-up to compare against", () => {
    const result = identify(at(0), [face("m1", at(0.1))]);
    expect(result.decision).toBe("accept");
    expect(result.runnerUp).toBeNull();
  });

  it("honours a caller-supplied threshold and margin", () => {
    const roster = [face("m1", at(0.55))];
    expect(identify(at(0), roster, { threshold: 0.6 }).decision).toBe("accept");
    expect(MIN_MARGIN).toBeGreaterThan(0);
  });

  it("matches against the closest angle when a member has several", () => {
    // m1's nearest angle beats m2 outright even though m1's first is far.
    const roster = [face("m1", at(9), at(0.05)), face("m2", at(0.4))];
    const result = identify(at(0), roster);
    expect(result.memberId).toBe("m1");
    expect(result.decision).toBe("accept");
  });
});

describe("checkQuality", () => {
  const frame = { width: 640, height: 480 };
  const good = { score: 0.95, box: { x: 100, y: 100, width: 160, height: 180 } };

  it("passes a large, confident, fully visible face", () => {
    expect(checkQuality(good, frame)).toEqual({ ok: true });
  });

  it("rejects a low-confidence detection", () => {
    const verdict = checkQuality({ ...good, score: 0.4 }, frame);
    expect(verdict).toMatchObject({ ok: false, reason: "Not clearly a face" });
  });

  it("rejects a face too small to describe reliably", () => {
    const verdict = checkQuality(
      { ...good, box: { x: 10, y: 10, width: 40, height: 40 } },
      frame,
    );
    expect(verdict).toMatchObject({ ok: false, reason: "Too far from the camera" });
  });

  it("rejects a face running off the edge of the frame", () => {
    const verdict = checkQuality(
      { ...good, box: { x: 560, y: 100, width: 160, height: 180 } },
      frame,
    );
    expect(verdict).toMatchObject({ ok: false, reason: "Partly out of frame" });
  });

  it("rejects a face starting above the top of the frame", () => {
    const verdict = checkQuality(
      { ...good, box: { x: 100, y: -5, width: 160, height: 180 } },
      frame,
    );
    expect(verdict).toMatchObject({ ok: false, reason: "Partly out of frame" });
  });
});

describe("voteAcrossFrames", () => {
  const accept = (memberId: string): MatchResult => ({
    memberId,
    distance: 0.2,
    runnerUp: 0.5,
    runnerUpMemberId: "other",
    decision: "accept",
  });
  const unknown = (): MatchResult => ({
    memberId: null,
    distance: 0.9,
    runnerUp: null,
    runnerUpMemberId: null,
    decision: "unknown",
  });
  const ambiguous = (memberId: string): MatchResult => ({
    memberId,
    distance: 0.2,
    runnerUp: 0.24,
    runnerUpMemberId: "other",
    decision: "ambiguous",
  });

  it("accepts when enough frames agree on the same member", () => {
    const vote = voteAcrossFrames([accept("m1"), accept("m1"), unknown()]);
    expect(vote).toMatchObject({ memberId: "m1", decision: "accept", agreeing: 2 });
  });

  it("does not accept on a single agreeing frame", () => {
    const vote = voteAcrossFrames([accept("m1"), unknown(), unknown()]);
    expect(vote.decision).toBe("ambiguous");
    expect(vote.agreeing).toBe(1);
  });

  it("refuses when frames confidently disagree about who it is", () => {
    const vote = voteAcrossFrames([accept("m1"), accept("m2")]);
    expect(vote).toMatchObject({ memberId: null, decision: "ambiguous" });
  });

  it("reports unknown when no frame matched anyone", () => {
    expect(voteAcrossFrames([unknown(), unknown()])).toMatchObject({
      memberId: null,
      decision: "unknown",
    });
  });

  it("reports ambiguous rather than unknown when frames were merely too close", () => {
    expect(voteAcrossFrames([ambiguous("m1"), unknown()])).toMatchObject({
      memberId: null,
      decision: "ambiguous",
    });
  });

  it("takes a clear majority over a single dissenting frame", () => {
    const vote = voteAcrossFrames([accept("m1"), accept("m1"), accept("m2")]);
    expect(vote).toMatchObject({ memberId: "m1", decision: "accept", agreeing: 2 });
  });
});

describe("checkQuality edge tolerance", () => {
  const frame = { width: 640, height: 480 };
  const overEdge = { score: 0.95, box: { x: 560, y: 100, width: 160, height: 180 } };

  it("still rejects an edge face for group identification", () => {
    expect(checkQuality(overEdge, frame)).toMatchObject({ ok: false });
  });

  it("allows a face filling the frame when one person confirms their own tile", () => {
    expect(checkQuality(overEdge, frame, undefined, { allowEdge: true })).toEqual({ ok: true });
  });

  it("still enforces size and confidence even with edges allowed", () => {
    const tiny = { score: 0.95, box: { x: 0, y: 0, width: 30, height: 30 } };
    expect(checkQuality(tiny, frame, undefined, { allowEdge: true })).toMatchObject({ ok: false });
  });
});
