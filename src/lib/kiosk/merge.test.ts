import { describe, expect, it } from "vitest";
import { chooseMergeTarget, mergedFields } from "./merge";
import type { Member, Session } from "./types";

const member = (id: string, createdAt: string, extra: Partial<Member> = {}): Member => ({
  id, firstName: "Ethan", lastName: "Han", photoUrl: null, active: true, groupIds: [],
  faceEmbedding: null, createdAt, ...extra,
});
const visit = (id: string, memberId: string, from: string, to: string): Session => ({
  id, memberId, signedInAt: from, signedOutAt: to, autoClosed: false, verified: false, note: null,
});
const NOW = Date.parse("2026-11-26T12:00:00Z");

describe("chooseMergeTarget", () => {
  const a = member("a", "2026-08-17T00:00:00Z");
  const b = member("b", "2026-09-20T00:00:00Z");

  it("keeps the record with more hours, whichever was picked first", () => {
    const sessions = [
      visit("1", "a", "2026-10-01T20:00:00Z", "2026-10-01T22:00:00Z"),
      visit("2", "b", "2026-10-02T20:00:00Z", "2026-10-03T01:00:00Z"),
    ];
    expect(chooseMergeTarget(a, b, sessions, NOW).keep.id).toBe("b");
    expect(chooseMergeTarget(b, a, sessions, NOW).keep.id).toBe("b");
  });

  it("keeps the older record on a tie", () => {
    expect(chooseMergeTarget(b, a, [], NOW)).toEqual({ keep: a, fold: b });
  });
});

describe("mergedFields", () => {
  it("keeps its own photo and face, borrowing only what it lacks, and joins the groups", () => {
    const keep = member("a", "x", { photoUrl: "keep.jpg", groupIds: ["g1"] });
    const fold = member("b", "y", { photoUrl: "fold.jpg", faceEmbedding: [1, 2], groupIds: ["g1", "g2"] });
    expect(mergedFields(keep, fold)).toEqual({ photoUrl: "keep.jpg", faceEmbedding: [1, 2], groupIds: ["g1", "g2"] });
  });
});
