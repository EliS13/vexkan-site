import { headers } from "next/headers";
import { getState } from "@/lib/kiosk/store";
import { rosterVersion } from "@/lib/kiosk/hours";
import { checkNetwork } from "@/lib/kiosk/network";
import { TEAMS } from "@/lib/kiosk/teams";
import { awardsForTeams } from "@/lib/kiosk/vexAwards";
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
  /*
   * Fetched here rather than in the overlay. The profile is a client component
   * and cannot reach the VEX API itself, which is why tapping a tile showed a
   * profile with no awards on it while the same member's own page had them all.
   * Thirty-two rows of text is a rounding error next to the photographs.
   */
  const vex = await awardsForTeams([...new Set(TEAMS.map((t) => t.number))]);
  return (
    <KioskShell
      initial={state}
      initialNow={now}
      initialRosterVersion={rosterVersion(state.members)}
      canSign={canSign}
      vexAwards={vex.ok ? vex.awards : []}
    />
  );
}
