import { NextResponse } from "next/server";
import { getState } from "@/lib/kiosk/store";
import { rosterVersion } from "@/lib/kiosk/hours";
import { checkNetwork } from "@/lib/kiosk/network";

/** Never cached: the whole point is who is in the room right now. */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    return await respond(request);
  } catch (error) {
    // An empty 500 from here leaves the kiosk with no roster and no reason.
    const detail = error instanceof Error ? error.message : "unknown";
    return NextResponse.json({ error: `Could not load the roster — ${detail}` }, { status: 500 });
  }
}

async function respond(request: Request) {
  const state = await getState();
  const version = rosterVersion(state.members);
  /*
   * Whether this device may change the record. The kiosk uses it to hide the
   * buttons rather than let somebody tap one and be refused — a control that
   * cannot work should not be offered.
   */
  const canSign = checkNetwork(request.headers).allowed;

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
      canSign,
    });
  }

  // `now` travels with the state so every iPad measures durations against the
  // server's clock, whatever their own is set to.
  return NextResponse.json({ ...state, rosterVersion: version, canSign });
}
