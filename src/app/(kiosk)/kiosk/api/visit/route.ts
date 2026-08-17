import { NextResponse } from "next/server";
import { checkMemberCode, isMemberCodeRequired } from "@/lib/kiosk/admin";

export const dynamic = "force-dynamic";

/**
 * Checks the club code for somebody looking from outside the room.
 *
 * Grants nothing on its own — the caller uses it to decide whether to render
 * the roster, and every route that changes the record still checks the network
 * for itself. So a stolen code buys a read of what the leaderboard already
 * shows, and no way to write.
 *
 * The name is deliberately not stored. It exists to make opening somebody
 * else's club roster a thing you did on purpose rather than a thing you
 * wandered into, and keeping a list of who peeked would be a worse record to
 * hold than the one it protects.
 */
export async function POST(request: Request) {
  let body: { name?: unknown; code?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }

  /*
   * With no code configured there is nothing to check, and refusing everyone
   * would hide the kiosk from the club before anybody had been told a code.
   */
  if (!isMemberCodeRequired()) return NextResponse.json({ ok: true });

  if (!checkMemberCode(body.code)) {
    return NextResponse.json(
      { error: "That club code is not right. Ask an organizer for it." },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true });
}
