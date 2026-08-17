import { cookies, headers } from "next/headers";
import { checkNetwork } from "./network";

/**
 * Who may look at the kiosk at all.
 *
 * On the club's network the room is the credential and nothing is asked. From
 * anywhere else the roster is a list of children's names, faces and movements,
 * so the club code is asked once and remembered for the session.
 *
 * Remembered in a cookie rather than in React state, for two reasons the first
 * version got wrong. State is lost on every full navigation, so the gate
 * reappeared constantly; and it only ever guarded the roster, leaving /awards,
 * /board and /member wide open to anyone who typed the path. A cookie the
 * server can read fixes both, because every page can ask the same question.
 *
 * Grants reading only. Signing in and out still checks the network for itself
 * on every request — a code thirty-seven students know is not presence.
 */
export const VISIT_COOKIE = "kiosk_visit";

/**
 * Deliberately no Max-Age or Expires, which makes it a session cookie: the
 * browser drops it when it closes. httpOnly so a script cannot read or forge
 * it, sameSite lax so following a link into the kiosk keeps it.
 */
export const visitCookie = {
  name: VISIT_COOKIE,
  value: "1",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/** True when this request may see the roster, hours and awards. */
export async function mayView(): Promise<boolean> {
  if (checkNetwork(await headers()).allowed) return true;
  return (await cookies()).get(VISIT_COOKIE)?.value === "1";
}
