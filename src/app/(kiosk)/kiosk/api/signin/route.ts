import { NextResponse } from "next/server";
import { getState, signInMembers } from "@/lib/kiosk/store";
import { checkPasscode } from "@/lib/kiosk/admin";

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
  let body: { memberIds?: unknown; verified?: unknown; passcode?: unknown };
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

  const verified = body.verified === true;
  if (!verified && !checkPasscode(body.passcode)) {
    // An unverified sign-in is an organizer override, and needs the passcode.
    return NextResponse.json(
      { error: "A organizer passcode is needed to sign someone in without a face match." },
      { status: 401 },
    );
  }

  const { signedIn, alreadyIn } = await signInMembers(memberIds as string[], {
    verified,
    note: verified ? null : "Signed in by organizer override, no face match.",
  });

  return NextResponse.json({
    signedIn,
    alreadyIn,
    ...(await getState()),
  });
}
