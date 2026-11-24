"use client";

import { useCallback, useRef, useState } from "react";

/**
 * One tap, one run — and the button visibly greys out before the work starts.
 *
 * Two things made the camera buttons feel dead. Face detection begins in the
 * same task as the tap, and its GPU work holds the main thread, so React never
 * got to paint the disabled state: the button looked untouched until the answer
 * arrived. And every tap made during that freeze sat in the browser's queue and
 * fired the moment it ended, so somebody tapping again "because nothing
 * happened" ran the whole check a second and third time.
 *
 * So: lock synchronously, wait for a paint so the grey actually reaches the
 * screen, run the work, then wait one more paint before unlocking. Taps queued
 * during the freeze are dispatched before that paint and meet the lock.
 */

/** Resolves after the browser has painted at least once. */
export function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame !== "function") {
      setTimeout(resolve, 0);
      return;
    }
    /*
     * Two frames: the first callback runs before that frame paints, the second
     * after it has. The timeout covers a hidden tab, where rAF never fires.
     */
    const fallback = setTimeout(resolve, 100);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      clearTimeout(fallback);
      resolve();
    }));
  });
}

/**
 * Shortest time the button stays grey. A check that fails fast ("no face in
 * frame") otherwise flickers the button for a single frame, which looks like
 * nothing happened — and leaves a double-tap free to start a second run.
 */
export const MIN_PENDING_MS = 400;

/** The lock itself, without React, so it can be tested on its own. */
export function createTapGuard(
  onPending: (pending: boolean) => void,
  paint: () => Promise<void> = nextPaint,
  minPendingMs: number = MIN_PENDING_MS,
) {
  let locked = false;
  return async function run(work: () => Promise<void> | void): Promise<boolean> {
    if (locked) return false;
    locked = true;
    onPending(true);
    const started = Date.now();
    try {
      await paint();
      await work();
    } finally {
      const left = minPendingMs - (Date.now() - started);
      if (left > 0) await new Promise((r) => setTimeout(r, left));
      await paint();
      locked = false;
      onPending(false);
    }
    return true;
  };
}

/** `pending` greys the button; `run` wraps its onClick. */
export function useTapGuard(): {
  pending: boolean;
  run: (work: () => Promise<void> | void) => Promise<boolean>;
} {
  const [pending, setPending] = useState(false);
  const guard = useRef<ReturnType<typeof createTapGuard> | null>(null);
  const run = useCallback((work: () => Promise<void> | void) => {
    guard.current ??= createTapGuard(setPending);
    return guard.current(work);
  }, []);
  return { pending, run };
}
