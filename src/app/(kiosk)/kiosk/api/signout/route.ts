import { NextResponse } from "next/server";
import { getState, signOutMember } from "@/lib/kiosk/store";
import { rosterVersion } from "@/lib/kiosk/hours";
import { checkPasscode } from "@/lib/kiosk/admin";
import { checkNetwork } from "@/lib/kiosk/network";

export const dynamic = "force-dynamic";

/*
 * Returns sessions, not the roster.
 *
 * The member list is 97% base64 photographs and changes only when somebody is
 * signed up, so re-sending it on every tap shipped ~68KB per member to re-learn
 * pictures the iPad already had — 1.6MB a tap at 24 members, on club wifi the
 * brief warns is unreliable. The client keeps its own roster and merges these
 * sessions into it.
 */
/**
 * A tap on a signed-in tile. Sign-out is the only thing a plain tap can do;
 * signing in goes through /api/signin behind a face match or a organizer passcode.
 */
export async function POST(request: Request) {
  /*
   * Signing out is pinned to the club's network for the same reason signing in
   * is. It was not, which left the weaker half of a pair: somebody could not
   * add hours from home but could end somebody else's session from anywhere,
   * and a session ended early is a quieter kind of wrong than one invented.
   */
  const network = checkNetwork(request.headers);

  let memberId: unknown;
  let passcode: unknown;
  try {
    ({ memberId, passcode } = await request.json());
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (typeof memberId !== "string" || memberId.length === 0) {
    return NextResponse.json({ error: "memberId is required." }, { status: 400 });
  }

  if (!network.allowed && !checkPasscode(passcode)) {
    return NextResponse.json(
      {
        error:
          "Sign-out only works on the club's network. Hours, awards and the " +
          "leaderboard are readable from anywhere.",
      },
      { status: 403 },
    );
  }

  try {
    const result = await signOutMember(memberId);
    const { sessions, now, members } = await getState();
    return NextResponse.json({
      action: result.action,
      member: result.member,
      sessions,
      now,
      rosterVersion: rosterVersion(members),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not record that tap.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
