import { describe, it, expect } from "vitest";
import { planRecovery } from "./faceRecovery";

/*
 * Descriptors are three numbers rather than the real 128, which changes none
 * of the arithmetic: euclidean distance and the accept/ambiguous thresholds
 * behave the same whatever the dimension.
 */
const ada = [0, 0, 0];
const grace = [0, 0, 5];
/** Within the identify threshold of `ada`, and far from everyone else. */
const adaAgain = [0.02, 0, 0];

describe("matching stranded templates to sign-up photos", () => {
  it("puts an orphan back on the member whose photo it matches", () => {
    const { links, contested } = planRecovery(
      [{ memberId: "old-ada", descriptors: [ada] }],
      [{ memberId: "new-ada", descriptor: adaAgain }],
    );
    expect(links).toEqual([{ orphanId: "old-ada", memberId: "new-ada", distance: expect.any(Number) }]);
    expect(contested).toBe(0);
  });

  it("leaves an orphan alone when no photo is close enough", () => {
    const { links } = planRecovery(
      [{ memberId: "old-ada", descriptors: [ada] }],
      [{ memberId: "new-grace", descriptor: grace }],
    );
    expect(links).toEqual([]);
  });

  it("refuses an orphan two different members both claim", () => {
    const { links, contested } = planRecovery(
      [{ memberId: "old-ada", descriptors: [ada] }],
      [
        { memberId: "new-ada", descriptor: adaAgain },
        { memberId: "new-twin", descriptor: ada },
      ],
    );
    expect(links).toEqual([]);
    expect(contested).toBe(1);
  });

  it("refuses when two orphans are too alike to tell apart", () => {
    const { links } = planRecovery(
      [
        { memberId: "old-a", descriptors: [ada] },
        { memberId: "old-b", descriptors: [adaAgain] },
      ],
      [{ memberId: "new-ada", descriptor: ada }],
    );
    expect(links).toEqual([]);
  });

  it("does nothing at all when there are no photos to read", () => {
    const { links, contested } = planRecovery([{ memberId: "old-ada", descriptors: [ada] }], []);
    expect(links).toEqual([]);
    expect(contested).toBe(0);
  });
});
