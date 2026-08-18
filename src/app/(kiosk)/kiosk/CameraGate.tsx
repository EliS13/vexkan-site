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
    <div className="mx-auto flex w-full max-w-md flex-col justify-center gap-4 p-2 text-center">
      <div
        aria-hidden
        className="mx-auto grid size-20 place-items-center rounded-2xl border-2 border-k-bolt text-4xl"
      >
        📷
      </div>

      <h2 className="font-serif text-2xl font-bold">
        {blocked ? "The camera is not available" : "Turn on the camera"}
      </h2>

      <p className="text-[15px] leading-relaxed text-k-sketch">
        {blocked ? message : purpose}
      </p>

      {!blocked && (
        <p className="font-mono text-[11px] leading-relaxed text-k-sketch">
          Your browser will ask permission next. Nothing is recorded and no
          picture leaves this device.
        </p>
      )}

      {!blocked && (
        <button
          onClick={onStart}
          disabled={status === "starting"}
          className="min-h-[72px] rounded-2xl bg-k-bolt font-serif text-xl font-bold text-k-ink disabled:opacity-40"
        >
          {status === "starting" ? "Asking…" : "Allow the camera"}
        </button>
      )}

      {blocked && status !== "insecure" && (
        <button
          onClick={onStart}
          className="min-h-[64px] rounded-2xl border-2 border-k-bolt font-serif text-lg font-bold text-k-bolt-ink"
        >
          Try again
        </button>
      )}

      {onCancel && (
        <button
          onClick={onCancel}
          className="min-h-[56px] font-mono text-xs tracking-widest text-k-sketch uppercase"
        >
          Not now
        </button>
      )}
    </div>
  );
}
