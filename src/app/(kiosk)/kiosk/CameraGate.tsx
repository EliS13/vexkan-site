"use client";

import type { CameraStatus } from "@/lib/kiosk/useCamera";

/**
 * The screen shown before the camera is asked for.
 *
 * Two jobs. It supplies the user gesture iOS requires, and it says what the
 * camera is for before the browser's own permission sheet appears — a sheet
 * that arrives with no context gets refused, and on iOS a refusal is sticky
 * enough that recovering it means a trip into Settings.
 */
export function CameraGate({
  status,
  message,
  onStart,
  purpose,
  onCancel,
}: {
  status: CameraStatus;
  message: string | null;
  onStart: () => void;
  purpose: string;
  onCancel?: () => void;
}) {
  const blocked = status === "denied" || status === "unavailable" || status === "insecure";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center gap-2 overflow-y-auto p-3 text-center sm:gap-4">
      <div
        aria-hidden
        className="mx-auto grid size-12 place-items-center rounded-xl border-2 border-[#ffb100] text-2xl sm:size-20 sm:rounded-2xl sm:text-4xl"
      >
        📷
      </div>

      <h2 className="font-serif text-xl font-bold sm:text-2xl">
        {blocked ? "The camera is not available" : "Turn on the camera"}
      </h2>

      <p className="text-[13px] leading-snug text-[#9aa4ae] sm:text-[15px] sm:leading-relaxed">
        {blocked ? message : purpose}
      </p>

      {!blocked && (
        <p className="hidden font-mono text-[11px] leading-relaxed text-[#8b949e] sm:block">
          Your browser will ask permission next. Nothing is recorded and no
          picture leaves this device.
        </p>
      )}

      {!blocked && (
        <button
          onClick={onStart}
          disabled={status === "starting"}
          className="min-h-[60px] rounded-2xl bg-[#ffb100] font-serif text-lg font-bold text-[#14171a] disabled:opacity-40 sm:min-h-[72px] sm:text-xl"
        >
          {status === "starting" ? "Asking…" : "Allow the camera"}
        </button>
      )}

      {blocked && status !== "insecure" && (
        <button
          onClick={onStart}
          className="min-h-[64px] rounded-2xl border-2 border-[#ffb100] font-serif text-lg font-bold text-[#ffb100]"
        >
          Try again
        </button>
      )}

      {onCancel && (
        <button
          onClick={onCancel}
          className="min-h-[56px] font-mono text-xs tracking-widest text-[#8b949e] uppercase"
        >
          Not now
        </button>
      )}
    </div>
  );
}
