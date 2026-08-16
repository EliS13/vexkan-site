import { timingSafeEqual } from "node:crypto";

/**
 * The organizer gate. Not an auth system — one shared passcode in an
 * environment variable, enough that a student cannot wander into the admin screen,
 * sign someone up, or override a failed face match.
 *
 * Server-side only. The passcode is never sent to the browser; the browser
 * sends a candidate and gets back yes or no.
 */
export function adminPasscode(): string | null {
  const value = process.env.KIOSK_ADMIN_PASSCODE;
  return value && value.length > 0 ? value : null;
}

export function isAdminGateConfigured(): boolean {
  return adminPasscode() !== null;
}

/** Constant-time compare, so the response time cannot be used to guess the code. */
export function checkPasscode(candidate: unknown): boolean {
  const expected = adminPasscode();
  if (expected === null) return false;
  if (typeof candidate !== "string" || candidate.length === 0) return false;

  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
