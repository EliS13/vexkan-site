"use client";

import { useState } from "react";
import { Kiosk } from "./Kiosk";
import { VisitorGate } from "./VisitorGate";
import type { KioskState } from "@/lib/kiosk/types";
import type { TeamAward } from "@/lib/kiosk/vexAwards";

/**
 * Decides whether the roster is shown at all.
 *
 * A wrapper rather than a branch inside Kiosk: the roster component runs a
 * dozen hooks, and returning early above them breaks the order React relies
 * on. Keeping the decision out here means the gate is a different screen
 * rather than a different mood of the same one.
 */
export function KioskShell({
  initial,
  initialNow,
  initialRosterVersion,
  canSign,
  vexAwards,
}: {
  initial: KioskState;
  initialNow: number;
  initialRosterVersion: string;
  canSign: boolean;
  vexAwards: TeamAward[];
}) {
  /* On the club's network the room is the credential, so this starts open. */
  const [allowed, setAllowed] = useState(canSign);

  if (!allowed) return <VisitorGate onUnlock={() => setAllowed(true)} />;

  return (
    <Kiosk
      initial={initial}
      initialNow={initialNow}
      initialRosterVersion={initialRosterVersion}
      canSign={canSign}
      vexAwards={vexAwards}
    />
  );
}
