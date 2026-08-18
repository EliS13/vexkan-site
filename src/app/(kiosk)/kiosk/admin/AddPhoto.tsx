"use client";

import { useCallback, useEffect, useState } from "react";
import { cropFace, detectOne, grabFrame, loadFaceEngine } from "@/lib/kiosk/face";
import { saveDescriptors } from "@/lib/kiosk/faceStore";
import { useCamera } from "@/lib/kiosk/useCamera";
import { CameraGate } from "../CameraGate";
import type { Member } from "@/lib/kiosk/types";

/** Same five angles sign-up uses; matching is only as good as its enrollment. */
const CAPTURES = 5;

const PROMPTS = [
  "Look straight at the camera.",
  "Turn your head slightly left.",
  "Turn your head slightly right.",
  "Tilt your chin down a little.",
  "Smile.",
];

/**
 * Gives a member brought in from the old system their photograph.
 *
 * Deliberately the same capture as sign-up rather than a single snapshot: the
 * five angles are what make recognition survive a real room, and a member
 * photographed once here would match far worse than one signed up properly. The
 * only difference is that this attaches to somebody who already exists, instead
 * of creating them.
 */
export function AddPhoto({
  member,
  onSave,
  onClose,
  busy,
}: {
  member: Member;
  onSave: (photoUrl: string) => Promise<void>;
  onClose: () => void;
  busy: boolean;
}) {
  const { attach, getVideo, status: camStatus, message: camMessage, start, resume, facing, flip } =
    useCamera();
  const [shots, setShots] = useState<{ descriptor: number[]; photo: string }[]>([]);
  const [note, setNote] = useState("Loading the face models…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadFaceEngine();
        if (cancelled) return;
        void resume();
        setNote(PROMPTS[0]);
      } catch {
        setError("The face models could not load.");
      }
    })();
    return () => { cancelled = true; };
  }, [resume]);

  const capture = useCallback(async () => {
    const el = getVideo();
    if (!el) return;
    setError(null);
    try {
      const frame = grabFrame(el);
      const { face, extraFaces } = await detectOne(frame, { allowEdge: true });
      if (!face) return setError("No face in frame. Move closer and try again.");
      if (extraFaces > 0) return setError("More than one person is in shot.");
      if (!face.quality.ok) return setError(`${face.quality.reason}. Try again.`);

      const next = [...shots, { descriptor: face.descriptor, photo: cropFace(frame, face.box) }];
      setShots(next);
      setNote(next.length >= CAPTURES ? "That's all five. Save it." : PROMPTS[next.length]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That capture failed.");
    }
  }, [shots, getVideo]);

  const save = useCallback(async () => {
    try {
      // The last capture is the one taken on "Smile", same as sign-up.
      await onSave(shots[shots.length - 1].photo);
      /*
       * Templates land on this iPad only once the save succeeded, so a failed
       * write never leaves a face matching a member whose photo was not stored.
       */
      saveDescriptors(member, shots.map((s) => s.descriptor));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  }, [onSave, onClose, shots, member]);

  const complete = shots.length >= CAPTURES;

  return (
    <div className="fixed inset-0 z-50 flex flex-col gap-3 bg-[#14171a]/97 p-5">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#ffb100] uppercase">
            Photo for
          </p>
          <p className="font-serif text-2xl font-bold">
            {member.firstName} {member.lastName}
          </p>
        </div>
        <div className="flex gap-2">
          {camStatus === "live" && (
            <button
              onClick={() => void flip()}
              className="min-h-[56px] rounded-lg border-2 border-[#2e343b] px-4 font-mono text-xs tracking-widest text-[#8b949e] uppercase"
            >
              {facing === "user" ? "Back camera" : "Front camera"}
            </button>
          )}
          <button
            onClick={onClose}
            className="min-h-[56px] rounded-lg border-2 border-[#2e343b] px-4 font-mono text-xs tracking-widest text-[#8b949e] uppercase"
          >
            Close
          </button>
        </div>
      </header>

      {error && (
        <p role="alert" className="rounded-lg border-2 border-[#e04f4f] bg-[#e04f4f]/15 px-4 py-3 text-sm text-[#ffb4b4]">
          {error}
        </p>
      )}

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-black">
        <video
          ref={attach}
          muted
          playsInline
          className={`absolute inset-0 size-full object-cover ${facing === "user" ? "-scale-x-100" : ""} ${
            camStatus === "live" ? "" : "hidden"
          }`}
        />
        {camStatus !== "live" && (
          <div className="absolute inset-0 grid place-items-center">
            <CameraGate
              status={camStatus}
              message={camMessage}
              onStart={start}
              purpose={`Five photos of ${member.firstName}, taken here. They stay on this device.`}
              onCancel={onClose}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: CAPTURES }, (_, i) => (
          <div
            key={i}
            className={`aspect-square overflow-hidden rounded-lg border-2 ${
              shots[i] ? "border-[#35c17a]" : "border-dashed border-[#2e343b]"
            }`}
          >
            {shots[i] && (
              // eslint-disable-next-line @next/next/no-img-element -- in-memory crop
              <img src={shots[i].photo} alt="" className="size-full object-cover" />
            )}
          </div>
        ))}
      </div>

      <p className="font-serif text-xl font-semibold">{note}</p>

      <div className="flex gap-3">
        <button
          onClick={capture}
          disabled={camStatus !== "live" || complete || busy}
          className="min-h-[80px] flex-1 rounded-2xl bg-[#ffb100] font-serif text-xl font-bold text-[#14171a] disabled:opacity-40"
        >
          {complete ? "Got all five" : `Capture ${shots.length + 1} of ${CAPTURES}`}
        </button>
        <button
          onClick={save}
          disabled={!complete || busy}
          className="min-h-[80px] flex-1 rounded-2xl bg-[#35c17a] font-serif text-xl font-bold text-[#14171a] disabled:opacity-40"
        >
          {busy ? "Saving…" : "Save photo"}
        </button>
      </div>
    </div>
  );
}
