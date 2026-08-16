import { NextResponse } from "next/server";
import { getState } from "@/lib/kiosk/store";

/** Never cached: the whole point is who is in the room right now. */
export const dynamic = "force-dynamic";

export async function GET() {
  // `now` travels with the state so every iPad measures durations against the
  // server's clock, whatever their own is set to.
  return NextResponse.json(await getState());
}
