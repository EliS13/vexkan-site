import { NextResponse } from "next/server";
import { getState } from "@/lib/kiosk/store";
import { rosterVersion } from "@/lib/kiosk/hours";

/** Never cached: the whole point is who is in the room right now. */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const state = await getState();
  const version = rosterVersion(state.members);

  /*
   * ?slim=1 leaves out the roster, which is almost entirely base64 photographs.
   * The kiosk polls this to stay in step with other devices — sessions signed
   * elsewhere, and the fingerprint that tells it whether the roster it holds is
   * still current — without redownloading every picture every few seconds.
   */
  if (new URL(request.url).searchParams.get("slim") === "1") {
    return NextResponse.json({
      sessions: state.sessions,
      groups: state.groups,
      now: state.now,
      rosterVersion: version,
    });
  }

  // `now` travels with the state so every iPad measures durations against the
  // server's clock, whatever their own is set to.
  return NextResponse.json({ ...state, rosterVersion: version });
}
