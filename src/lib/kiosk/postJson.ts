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
/**
 * A failure worth trying again.
 *
 * A 5xx or a dropped connection is the server or the wifi having a moment; the
 * same request a second later usually works. A 4xx is not — a wrong passcode
 * or a malformed id will be just as wrong on the third attempt, and retrying it
 * only makes the person wait longer to be told.
 */
const RETRY_DELAYS_MS = [300, 900];

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await attemptPost<T>(url, body);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("unknown");
      // Deliberate refusals are final; only transient ones are worth repeating.
      if (!(err instanceof TransientError)) throw lastError;
      const wait = RETRY_DELAYS_MS[attempt];
      if (wait === undefined) break;
      await new Promise((r) => setTimeout(r, wait));
    }
  }

  throw lastError ?? new Error("could not reach the server");
}

/** Marks a failure the caller should try again rather than report. */
class TransientError extends Error {}

async function attemptPost<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // fetch only rejects for a transport failure, never for an HTTP status.
    throw new TransientError("no connection — check the wifi and try again");
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
      const message = res.ok
        ? `the server sent something unreadable (${summary || "empty reply"})`
        : `server error ${res.status}${summary ? ` — ${summary}` : ""}`;
      // An unreadable reply is the platform answering for a crashed function,
      // which is exactly the intermittent case worth repeating.
      throw new TransientError(message);
    }
  }

  if (!res.ok) {
    const message =
      parsed && typeof parsed === "object" && "error" in parsed
        ? String((parsed as { error: unknown }).error)
        : `server error ${res.status}`;
    throw res.status >= 500 ? new TransientError(message) : new Error(message);
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
