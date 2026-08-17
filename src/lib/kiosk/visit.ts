import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { adminPasscode, memberCode } from "./admin";
import { checkNetwork } from "./network";

/**
 * Who may look at the kiosk at all.
 *
 * On the club's network the room is the credential and nothing is asked. From
 * anywhere else the roster is a list of children's names, faces and movements,
 * so the club code is asked once and remembered.
 *
 * Remembered in a cookie rather than in React state, for three things the
 * first version got wrong. State was lost on every full navigation, so the
 * gate reappeared constantly. It only ever wrapped the roster, leaving
 * /awards, /board and /member reachable by anyone who typed the path. And it
 * was thrown away with the tab, so a parent checking hours from home answered
 * the same question every evening. A cookie the server can read fixes all
 * three at once, because every page — and the route the pages get their data
 * from — can ask the same question and get the same answer.
 *
 * Grants reading only. Signing in and out still checks the network for itself
 * on every request — a code thirty-seven students know is not presence.
 */
export const VISIT_COOKIE = "kiosk_visit";

/**
 * How long a visitor stays remembered.
 *
 * Long enough that looking on a Tuesday and again on a Thursday is not two
 * codes typed, short enough that a phone lent to somebody, or left in a
 * classroom, stops opening the roster inside the month. Nothing renews it: a
 * page cannot set a cookie in this framework, so the clock starts at the code
 * and does not slide.
 */
const VISIT_DAYS = 30;
export const VISIT_MAX_AGE_S = VISIT_DAYS * 24 * 60 * 60;

/**
 * What the cookie is signed with — the club code itself, which never leaves
 * the server.
 *
 * Using the secret as the key buys one thing worth having: change the code and
 * every cookie minted under the old one stops verifying that minute, so a code
 * that has been passed around too far can be retired without any way to reach
 * the browsers that already answered it.
 */
function signingKey(): string | null {
  return memberCode() ?? adminPasscode();
}

/**
 * A cookie value that cannot be typed by hand.
 *
 * httpOnly stops a script on the page reading it, but it does nothing about
 * somebody opening devtools and setting `kiosk_visit=1` themselves, and a gate
 * walked past that easily is a decoration. So the value carries its own expiry
 * and an HMAC over it: the server can tell its own grant from a guess, and can
 * refuse a stale one even if the browser held on to it.
 */
export function mintVisit(now: number = Date.now()): string {
  const expiresAt = now + VISIT_MAX_AGE_S * 1000;
  return `${expiresAt}.${sign(String(expiresAt))}`;
}

/** True for a grant this server issued, to this browser, that has not run out. */
export function verifyVisit(token: unknown, now: number = Date.now()): boolean {
  if (typeof token !== "string") return false;

  const dot = token.indexOf(".");
  if (dot < 1) return false;

  const stamp = token.slice(0, dot);
  const expiresAt = Number(stamp);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;

  return sameSignature(token.slice(dot + 1), sign(stamp));
}

function sign(stamp: string): string {
  /*
   * With no code configured /api/visit lets everyone through on the strength
   * of a typed name, so there is no secret to forge and nothing a signature
   * would be protecting. Signing with a constant keeps one cookie format
   * rather than growing a second shape for the case with nothing at stake.
   */
  const key = signingKey() ?? "kiosk-no-code";
  return createHmac("sha256", key).update(`v1:${stamp}`).digest("hex");
}

/** Constant-time, like the code check itself. A signature is a secret too. */
function sameSignature(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * The cookie itself.
 *
 * maxAge rather than nothing at all: without it this is a session cookie, and
 * a session on an iPhone often ends the same evening — which was the whole
 * complaint. sameSite lax so following a link into the kiosk keeps it, secure
 * in production because the value is a credential.
 */
export function visitCookie(now: number = Date.now()) {
  return {
    name: VISIT_COOKIE,
    value: mintVisit(now),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: VISIT_MAX_AGE_S,
    path: "/",
  };
}

/** True when this request may see the roster, hours and awards. */
export async function mayView(): Promise<boolean> {
  if (checkNetwork(await headers()).allowed) return true;
  return verifyVisit((await cookies()).get(VISIT_COOKIE)?.value);
}
