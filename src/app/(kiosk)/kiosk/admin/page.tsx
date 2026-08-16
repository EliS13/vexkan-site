import { getState } from "@/lib/kiosk/store";
import { isAdminGateConfigured } from "@/lib/kiosk/admin";
import { Admin } from "./Admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { now, ...state } = await getState();

  if (!isAdminGateConfigured()) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 p-8">
        <h1 className="font-serif text-3xl font-bold">Admin is closed</h1>
        <p className="text-[#9aa4ae]">
          Set <code className="text-[#ffb100]">KIOSK_ADMIN_PASSCODE</code> in the
          environment and restart, so organizing groups needs an administrator.
        </p>
      </div>
    );
  }

  return <Admin initial={state} initialNow={now} />;
}
