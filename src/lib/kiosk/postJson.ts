"use client";

import type { Group, KioskState, Member, Session } from "./types";

/**
 * POSTs JSON and returns the parsed reply, or throws something readable.
 *
 * Every caller used to do `await res.json()` before checking res.ok. That works
 * right up until the server answers with something that is not JSON — a
 * platform error page, a gateway timeout, an empty body — at which point
 * res.json() throws a SyntaxError, and Safari words that as "the string did not
 * match the expected pattern". The real status never surfaced, so a 500 and a
 * 504 and a crashed function all looked like one baffling string error.
 *
 * Reading the body as text first means a failure can say what actually came
 * back.
 */
export async function postJson<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // fetch only rejects for a transport failure, never for an HTTP status.
    throw new Error("no connection — check the wifi and try again");
  }

  const text = await res.text();

  let parsed: unknown = null;
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text);
    } catch {
      /*
       * Not JSON. Almost always an HTML error page, whose first line is far
       * more use than "unexpected token <".
       */
      const summary = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
      throw new Error(
        res.ok
          ? `the server sent something unreadable (${summary || "empty reply"})`
          : `server error ${res.status}${summary ? ` — ${summary}` : ""}`,
      );
    }
  }

  if (!res.ok) {
    const message =
      parsed && typeof parsed === "object" && "error" in parsed
        ? String((parsed as { error: unknown }).error)
        : `server error ${res.status}`;
    throw new Error(message);
  }

  return parsed as T;
}

/* ------------------------------------------------- what each route replies */

/** Sessions rather than the roster: the client already holds the members. */
export type SessionsReply = {
  sessions: Session[];
  now: number;
  rosterVersion: string;
};

export type SignOutReply = SessionsReply & { action: "in" | "out"; member: Member };
export type SignInReply = SessionsReply & { signedIn: Member[]; alreadyIn: Member[] };
export type EnrollReply = { member: Member };
/** Admin writes are rare and change the roster, so they return all of it. */
export type AdminReply = KioskState & { now: number; groups: Group[] };
