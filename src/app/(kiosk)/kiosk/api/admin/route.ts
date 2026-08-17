import { NextResponse } from "next/server";
import {
  createGroup,
  deleteGroup,
  getState,
  setMemberActive,
  setMemberGroups,
  setMemberPhoto,
} from "@/lib/kiosk/store";
import { checkPasscode, isAdminGateConfigured } from "@/lib/kiosk/admin";

export const dynamic = "force-dynamic";

/**
 * Admin writes. Every action goes through the one organizer passcode check
 * below rather than each branch remembering to do it for itself.
 */
export async function POST(request: Request) {
  if (!isAdminGateConfigured()) {
    return NextResponse.json(
      { error: "KIOSK_ADMIN_PASSCODE is not set, so the admin screen is closed." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (!checkPasscode(body.passcode)) {
    return NextResponse.json({ error: "That passcode is not right." }, { status: 401 });
  }

  try {
    switch (body.action) {
      /*
       * Unlocking the admin screen. Reaching here means the passcode already
       * passed the check above, so this only needs to hand back the state the
       * menu renders. The server stays stateless — every later write carries
       * the passcode again — so a stolen unlock cannot be replayed on its own.
       */
      case "unlock":
        break;
      case "createGroup": {
        const { name, meetsOn, startsAt, endsAt } = body;
        if (typeof name !== "string") throw new Error("A group needs a name.");
        await createGroup({
          name,
          meetsOn: Array.isArray(meetsOn) ? (meetsOn as number[]) : [],
          startsAt: typeof startsAt === "string" ? startsAt : "16:30",
          endsAt: typeof endsAt === "string" ? endsAt : "18:00",
        });
        break;
      }
      case "deleteGroup": {
        if (typeof body.groupId !== "string") throw new Error("Which group?");
        await deleteGroup(body.groupId);
        break;
      }
      case "setMemberGroups": {
        if (typeof body.memberId !== "string") throw new Error("Which member?");
        const ids = Array.isArray(body.groupIds) ? (body.groupIds as string[]) : [];
        await setMemberGroups(body.memberId, ids);
        break;
      }
      case "setMemberPhoto": {
        if (typeof body.memberId !== "string") throw new Error("Which member?");
        if (typeof body.photoUrl !== "string" || !body.photoUrl.startsWith("data:image/")) {
          throw new Error("That photo did not arrive.");
        }
        await setMemberPhoto(body.memberId, body.photoUrl);
        break;
      }
      case "setMemberActive": {
        if (typeof body.memberId !== "string") throw new Error("Which member?");
        await setMemberActive(body.memberId, body.active === true);
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }

    return NextResponse.json(await getState());
  } catch (error) {
    const message = error instanceof Error ? error.message : "That did not save.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
