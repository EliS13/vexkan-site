import { getState } from "@/lib/kiosk/store";
import { Kiosk } from "./Kiosk";

/** Presence is live by definition, so nothing on this route is prerendered. */
export const dynamic = "force-dynamic";

export default async function KioskPage() {
  const { now, ...state } = await getState();
  return <Kiosk initial={state} initialNow={now} />;
}
