import { getState } from "@/lib/kiosk/store";
import { isAdminGateConfigured } from "@/lib/kiosk/admin";
import { Enroll } from "./Enroll";

export const dynamic = "force-dynamic";

export default async function EnrollPage() {
  const state = await getState();

  if (!isAdminGateConfigured()) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 p-8">
        <h1 className="font-serif text-3xl font-bold">Enrollment is closed</h1>
        <p className="text-[#9aa4ae]">
          Set <code className="text-[#ffb100]">KIOSK_ADMIN_PASSCODE</code> in the
          environment and restart, so signing members up needs an organizer.
        </p>
      </div>
    );
  }

  return <Enroll initial={state} />;
}
