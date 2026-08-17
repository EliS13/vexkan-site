import { headers } from "next/headers";
import { getState } from "@/lib/kiosk/store";
import { rosterVersion } from "@/lib/kiosk/hours";
import { checkNetwork } from "@/lib/kiosk/network";
import { KioskShell } from "./KioskShell";

/** Presence is live by definition, so nothing on this route is prerendered. */
export const dynamic = "force-dynamic";

export default async function KioskPage() {
  const { now, ...state } = await getState();
  /*
   * Decided on the server so the first paint is already right. Deciding in the
   * browser would show a full kiosk for a moment and then take the buttons
   * away, which reads as a fault rather than as a rule.
   */
  const canSign = checkNetwork(await headers()).allowed;
  return (
    <KioskShell
      initial={state}
      initialNow={now}
      initialRosterVersion={rosterVersion(state.members)}
      canSign={canSign}
    />
  );
}
