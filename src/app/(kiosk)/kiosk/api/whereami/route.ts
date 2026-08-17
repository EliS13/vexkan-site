import { NextResponse } from "next/server";
import { allowedNetworks, checkNetwork, clientIp } from "@/lib/kiosk/network";

export const dynamic = "force-dynamic";

/**
 * The address this request arrived from, and whether it counts as the club.
 *
 * Pinning sign-in to the club's wifi needs the club's public address, and
 * there is no way to look that up from a laptop somewhere else. Open this on
 * the club's network and it says what to put in KIOSK_ALLOWED_IPS.
 *
 * It reveals nothing the caller does not already know — their own IP address,
 * and whether they are on the list. The list itself is returned as a count
 * rather than its contents.
 */
export function GET(request: Request) {
  const verdict = checkNetwork(request.headers);
  return NextResponse.json({
    yourIp: clientIp(request.headers),
    canSign: verdict.allowed,
    reason: verdict.reason,
    rulesConfigured: allowedNetworks().length,
    hint:
      allowedNetworks().length === 0
        ? "KIOSK_ALLOWED_IPS is unset, so sign-in works from anywhere. Set it to the address above, on the club's wifi, to pin it."
        : "Sign-in is limited to the configured addresses.",
  });
}
