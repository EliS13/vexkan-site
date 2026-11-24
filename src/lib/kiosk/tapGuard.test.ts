import { describe, expect, it } from "vitest";
import { createTapGuard } from "./tapGuard";

const instant = () => Promise.resolve();

describe("createTapGuard", () => {
  it("ignores taps while a run is in progress", async () => {
    let runs = 0;
    let release!: () => void;
    const run = createTapGuard(() => {}, instant, 0);

    const first = run(() => new Promise<void>((r) => { runs++; release = r; }));
    const second = await run(() => { runs++; });
    expect(second).toBe(false);

    await Promise.resolve();
    release();
    expect(await first).toBe(true);
    expect(runs).toBe(1);
  });

  it("reports pending before the work starts and clears it after", async () => {
    const seen: boolean[] = [];
    let duringWork: boolean | undefined;
    const run = createTapGuard((p) => seen.push(p), instant, 0);
    await run(() => { duringWork = seen[seen.length - 1]; });
    expect(duringWork).toBe(true);
    expect(seen).toEqual([true, false]);
  });

  it("waits for a paint before running, so the grey state shows first", async () => {
    const order: string[] = [];
    const paint = () => { order.push("paint"); return Promise.resolve(); };
    const run = createTapGuard(() => {}, paint, 0);
    await run(() => { order.push("work"); });
    expect(order).toEqual(["paint", "work", "paint"]);
  });

  it("unlocks after a failure so the button can be tried again", async () => {
    const run = createTapGuard(() => {}, instant, 0);
    await expect(run(() => { throw new Error("boom"); })).rejects.toThrow("boom");
    expect(await run(() => {})).toBe(true);
  });

  it("swallows a tap that arrives during the closing paint", async () => {
    let releasePaint!: () => void;
    let paints = 0;
    const paint = () => {
      paints++;
      // The closing paint is held open, like a queued tap landing mid-freeze.
      return paints === 2 ? new Promise<void>((r) => { releasePaint = r; }) : Promise.resolve();
    };
    const run = createTapGuard(() => {}, paint, 0);
    const first = run(() => {});
    await new Promise((r) => setTimeout(r, 0));
    expect(await run(() => {})).toBe(false);
    releasePaint();
    await first;
  });

  it("stays grey for a minimum time even when the work is instant", async () => {
    const run = createTapGuard(() => {}, instant, 50);
    const started = Date.now();
    const first = run(() => {});
    expect(await run(() => {})).toBe(false);
    await first;
    expect(Date.now() - started).toBeGreaterThanOrEqual(45);
  });
});
