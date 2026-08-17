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

/**
 * The members' code, which is not the organizers' passcode.
 *
 * Administration hands this one to every student. It is a weaker secret by
 * design — everybody in the club knows it — so it gates signing yourself in
 * and nothing else. The admin passcode still opens the roster, enrollment and
 * the override, and a student knowing the member code learns nothing about it.
 */
export function memberCode(): string | null {
  const value = process.env.KIOSK_MEMBER_CODE;
  return value && value.length > 0 ? value : null;
}

export function isMemberCodeRequired(): boolean {
  return memberCode() !== null;
}

/** Constant-time, same as the passcode. Accepts the admin passcode too. */
export function checkMemberCode(candidate: unknown): boolean {
  if (checkPasscode(candidate)) return true;
  const expected = memberCode();
  if (expected === null) return false;
  if (typeof candidate !== "string" || candidate.length === 0) return false;

  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Whether somebody typed their own name.
 *
 * A tap alone says only that a tile was pressed; typing the name is the member
 * asserting it is them, which is the difference between a record of presence
 * and a record of somebody's thumb. Compared on the first name only, folded to
 * lowercase and trimmed — the point is a deliberate act, not a spelling test,
 * and "MICHAEL " should pass.
 */
export function nameMatches(typed: unknown, firstName: string): boolean {
  if (typeof typed !== "string") return false;
  return typed.trim().toLowerCase() === firstName.trim().toLowerCase();
}
