import { NextResponse } from "next/server";
import { getState, signOutMember } from "@/lib/kiosk/store";

export const dynamic = "force-dynamic";

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
    return NextResponse.json({
      action: result.action,
      member: result.member,
      ...(await getState()),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not record that tap.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
