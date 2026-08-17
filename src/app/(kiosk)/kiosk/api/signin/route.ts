import { NextResponse } from "next/server";
import { getState, signInMembers } from "@/lib/kiosk/store";
import { rosterVersion } from "@/lib/kiosk/hours";
import { checkMemberCode } from "@/lib/kiosk/admin";
import { checkNetwork } from "@/lib/kiosk/network";

export const dynamic = "force-dynamic";

/**
 * Signs in a batch of members.
 *
 * Two ways in, and the difference is recorded on every session:
 *
 *  - `verified: true`  — the camera matched these faces confidently.
 *  - `verified: false` — an organizer entered the passcode to sign someone in the
 *    camera could not place, which is the fallback that stops a bad-light
 *    evening or a broken camera from locking the club out.
 *
 * The matching itself happens in the browser, against templates that never
 * leave the iPad, so this route is told *who* rather than shown any faces.
 */
export async function POST(request: Request) {
  /*
   * Sign-in is pinned to the club's network so a member cannot mark themselves
   * present from home. An organizer with the passcode is still allowed through
   * from anywhere, because a coach fixing a bad record should not have to be
   * standing in the room to do it.
   */
  const network = checkNetwork(request.headers);

  let body: {
    memberIds?: unknown;
    verified?: unknown;
    passcode?: unknown;
    code?: unknown;
    typedName?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const { memberIds } = body;
  if (!Array.isArray(memberIds) || memberIds.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "memberIds must be a list of ids." }, { status: 400 });
  }
  if (memberIds.length === 0) {
    return NextResponse.json({ error: "No one was selected." }, { status: 400 });
  }

  /*
   * Postgres rejects a non-uuid outright, and its complaint about invalid input
   * syntax reaches the kiosk as an unreadable error about a string. Members
   * enrolled before the move to Postgres are the source: their face templates
   * are still on the iPad, keyed by ids the database has never seen.
   */
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if ((memberIds as string[]).some((id) => !UUID.test(id))) {
    return NextResponse.json(
      {
        error:
          "Some of this iPad's saved faces are from before the roster moved. " +
          "Sign those members up again on this device.",
      },
      { status: 400 },
    );
  }

  const verified = body.verified === true;

  if (!network.allowed && verified) {
    return NextResponse.json(
      {
        error:
          network.reason === "no-ip"
            ? "Could not tell which network this is. The club code still signs people in."
            : "Sign-in only works on the club's wifi. Join it and try again.",
      },
      { status: 403 },
    );
  }
  if (!verified && !checkMemberCode(body.passcode)) {
    /*
     * A sign-in the camera could not confirm falls back to the members' code
     * rather than the organizer passcode. Bad light and a broken lens are
     * ordinary evenings, and making every one of them wait for a coach put the
     * club's own attendance behind a person rather than behind a check.
     */
    return NextResponse.json(
      { error: "The club code is needed to sign someone in without a face match." },
      { status: 401 },
    );
  }

  /*
   * Wrapped, unlike before. Anything thrown past this point — a database that
   * refused the write, a unique index catching a session that was already open
   * — left the platform to answer with an empty 500, which tells the kiosk
   * nothing and the person standing at it less. Sign-out has always done this;
   * sign-in was the one route that did not.
   */
  try {
    const { signedIn, alreadyIn } = await signInMembers(memberIds as string[], {
      verified,
      note: verified ? null : "Signed in by organizer override, no face match.",
    });

    const { sessions, now, members } = await getState();
    return NextResponse.json({
      signedIn,
      alreadyIn,
      sessions,
      now,
      rosterVersion: rosterVersion(members),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown";
    return NextResponse.json(
      { error: `Could not record that sign-in — ${detail}` },
      { status: 500 },
    );
  }
}
