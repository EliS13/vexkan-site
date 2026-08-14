/**
 * The arithmetic behind the back-to-top control's scroll.
 *
 * Split out from the component so it can be tested as plain functions, in
 * keeping with the rule in vitest.config.ts. That is worth the extra file here:
 * the animation itself cannot be observed from an automated browser — the tab
 * is backgrounded, so animation frames never run and timers are clamped to
 * about a second — and this control has already shipped broken twice for want
 * of a way to check it.
 */

/**
 * How long the trip takes, in milliseconds.
 *
 * Deliberately near enough distance-independent. The club's home page is around
 * forty thousand pixels tall, and a duration that tracked the distance would
 * spend the better part of a minute crossing it. What a reader wants from this
 * button is "put me back", at the same speed every time.
 */
export const MIN_MS = 320;
export const MAX_MS = 700;

/** Short hops should not dawdle, and long ones must not crawl. */
export function durationFor(distance: number): number {
  return Math.min(MAX_MS, Math.max(MIN_MS, distance * 0.25));
}

/**
 * Where the page should sit `elapsed` milliseconds into a trip that started at
 * `from`.
 *
 * Eased out — leaves quickly, arrives gently — and clamped at both ends so that
 * a frame delivered late (a slow phone, a tab that just came back) lands on
 * exactly zero rather than overshooting into a negative offset.
 */
export function offsetAt(from: number, elapsed: number, duration: number): number {
  if (duration <= 0) return 0;

  const progress = Math.min(1, Math.max(0, elapsed / duration));
  const eased = 1 - Math.pow(1 - progress, 3);

  return Math.round(from * (1 - eased));
}
