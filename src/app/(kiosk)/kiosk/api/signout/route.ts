import { NextResponse } from "next/server";
import { getState, signOutMember } from "@/lib/kiosk/store";
import { rosterVersion } from "@/lib/kiosk/hours";

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
  let memberId: unknown;
  try {
    ({ memberId } = await request.json());
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (typeof memberId !== "string" || memberId.length === 0) {
    return NextResponse.json({ error: "memberId is required." }, { status: 400 });
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
