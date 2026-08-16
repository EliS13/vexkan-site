import type { KioskState } from "./types";

/**
 * A new kiosk starts empty — no members, no groups, no invented history.
 *
 * There was fake seed data here while the screens were being built, and it made
 * every screenshot look finished when nothing had been entered yet. Worse, real
 * sign-ins would have landed alongside invented hours and the leaderboard would
 * have been quietly wrong from day one. Groups get created in the admin screen
 * and members through sign-up, which is also the only path that captures the
 * photo and the face templates.
 */
export function seedState(): KioskState {
  return { members: [], sessions: [], groups: [] };
}
