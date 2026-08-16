import { NextResponse } from "next/server";
import { addMember, getState } from "@/lib/kiosk/store";
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
  if (typeof photoUrl !== "string" || !photoUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "A photo is required." }, { status: 400 });
  }

  try {
    const member = await addMember({ firstName, lastName, photoUrl });
    return NextResponse.json({ member, ...(await getState()) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add that member.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
