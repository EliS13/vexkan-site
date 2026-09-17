import { NextResponse } from "next/server";
import { addMember } from "@/lib/kiosk/store";
import { checkPasscode, isAdminGateConfigured } from "@/lib/kiosk/admin";

export const dynamic = "force-dynamic";

/**
 * Signs a new member up. Organizer-gated, because this writes to the roster.
 *
 * Only the photo crop and the name arrive here. The face descriptors computed
 * during enrollment stay in the iPad's own storage and are never posted.
 */
export async function POST(request: Request) {
  if (!isAdminGateConfigured()) {
    return NextResponse.json(
      { error: "KIOSK_ADMIN_PASSCODE is not set, so enrollment is closed." },
      { status: 503 },
    );
  }

  let body: { passcode?: unknown; firstName?: unknown; lastName?: unknown; photoUrl?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (!checkPasscode(body.passcode)) {
    return NextResponse.json({ error: "That passcode is not right." }, { status: 401 });
  }

  const { firstName, lastName, photoUrl } = body;
  if (typeof firstName !== "string" || typeof lastName !== "string") {
    return NextResponse.json({ error: "A first and last name are required." }, { status: 400 });
  }
  /*
   * A photo is optional.
   *
   * It was required because sign-up is a camera flow and a tile with no face is
   * harder to find across a room. But that shut out the people most likely to
   * need signing up quickly — somebody whose parents have not consented to a
   * photograph, a visitor, or anybody on an evening the camera will not open.
   * They get initials on a coloured tile, the same as the members imported from
   * the old system, and a photo can be added later from the roster screen.
   */
  if (photoUrl !== null && photoUrl !== undefined) {
    if (typeof photoUrl !== "string" || !photoUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "That photo is not an image." }, { status: 400 });
    }
  }

  try {
    const member = await addMember({
      firstName,
      lastName,
      photoUrl: typeof photoUrl === "string" ? photoUrl : null,
    });
    // The new member only. The sign-up screen redirects to the kiosk, which
    // loads a fresh roster anyway.
    return NextResponse.json({ member });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add that member.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
