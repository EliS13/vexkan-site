import { describe, it, expect } from "vitest";
import { personKey, relink } from "./faceStore";

const ada = { id: "new-1", firstName: "Ada", lastName: "Lovelace" };
const grace = { id: "new-2", firstName: "Grace", lastName: "Hopper" };

/** Descriptors are opaque here; only which member they end up under matters. */
const face = (n: number) => [[n, n, n]];

describe("relinking the iPad's faces to the roster", () => {
  it("leaves a template alone when its member is still there", () => {
    const { result, changed } = relink(
      { "new-1": { name: personKey(ada), descriptors: face(1) } },
      [ada],
    );
    expect(result.enrolled).toEqual([{ memberId: "new-1", descriptors: face(1) }]);
    expect(result.orphaned).toEqual([]);
    expect(changed).toBe(false);
  });

  it("follows a member whose id changed when the roster was rebuilt", () => {
    const { next, result, changed } = relink(
      { "old-1": { name: personKey(ada), descriptors: face(1) } },
      [ada],
    );
    expect(result.enrolled).toEqual([{ memberId: "new-1", descriptors: face(1) }]);
    expect(result.orphaned).toEqual([]);
    expect(next["old-1"]).toBeUndefined();
    expect(next["new-1"].descriptors).toEqual(face(1));
    expect(changed).toBe(true);
  });

  it("stamps the name on a version 1 row so the next id change repairs itself", () => {
    const { next, changed } = relink({ "new-1": { name: "", descriptors: face(1) } }, [ada]);
    expect(next["new-1"].name).toBe("ada lovelace");
    expect(changed).toBe(true);
  });

  it("cannot repair a version 1 row whose id has already gone", () => {
    const { result } = relink({ "old-1": { name: "", descriptors: face(1) } }, [ada]);
    expect(result.enrolled).toEqual([]);
    expect(result.orphaned).toEqual([{ memberId: "old-1", descriptors: face(1) }]);
  });

  it("refuses to guess between two members with the same name", () => {
    const twin = { id: "new-3", firstName: "Ada", lastName: "Lovelace" };
    const { result } = relink(
      { "old-1": { name: personKey(ada), descriptors: face(1) } },
      [ada, twin],
    );
    expect(result.enrolled).toEqual([]);
    expect(result.orphaned).toEqual([{ memberId: "old-1", descriptors: face(1) }]);
  });

  it("keeps templates rather than deleting them when the roster fails to load", () => {
    const stored = {
      "new-1": { name: personKey(ada), descriptors: face(1) },
      "new-2": { name: personKey(grace), descriptors: face(2) },
    };
    const { next, result, changed } = relink(stored, []);
    expect(result.enrolled).toEqual([]);
    expect(result.orphaned).toHaveLength(2);
    expect(next).toEqual(stored);
    expect(changed).toBe(false);
  });

  it("matches a name however it was spaced or capitalised", () => {
    const { result } = relink(
      { "old-1": { name: "ada lovelace", descriptors: face(1) } },
      [{ id: "new-1", firstName: "  Ada ", lastName: " Lovelace  " }],
    );
    expect(result.enrolled).toEqual([{ memberId: "new-1", descriptors: face(1) }]);
  });
});
