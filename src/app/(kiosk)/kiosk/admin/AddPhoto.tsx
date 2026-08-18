"use client";

import { useCallback, useEffect, useState } from "react";
import { cropFace, detectOne, grabFrame, loadFaceEngine } from "@/lib/kiosk/face";
import { saveDescriptors } from "@/lib/kiosk/faceStore";
import { useCamera } from "@/lib/kiosk/useCamera";
import { CameraGate } from "../CameraGate";
import { CaptureStack } from "../CaptureStack";
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
    <div className="fixed inset-0 z-50 flex flex-col gap-3 bg-k-paper/97 p-5">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-k-bolt-ink uppercase">
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
              className="min-h-[56px] rounded-lg border-2 border-k-rule px-4 font-mono text-xs tracking-widest text-k-sketch uppercase"
            >
              {facing === "user" ? "Back camera" : "Front camera"}
            </button>
          )}
          <button
            onClick={onClose}
            className="min-h-[56px] rounded-lg border-2 border-k-rule px-4 font-mono text-xs tracking-widest text-k-sketch uppercase"
          >
            Close
          </button>
        </div>
      </header>

      {error && (
        <p role="alert" className="rounded-lg border-2 border-k-berry bg-k-berry/15 px-4 py-3 text-sm text-k-berry-ink">
          {error}
        </p>
      )}

      {/*
        * Laid out like sign-up, because it is the same job: five angles of one
        * person, taken by somebody holding an iPad in front of them. Two
        * columns from tablet width so the picture is not a letterbox strip,
        * and the captures stack over it rather than taking a row of their own.
        */}
      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[1.6fr_1fr]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="relative min-h-[45vh] flex-1 overflow-hidden rounded-2xl bg-black md:min-h-0">
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
            <CaptureStack photos={shots.map((s) => s.photo)} of={CAPTURES} />
          </div>

          <p className="font-serif text-2xl font-semibold">{note}</p>

          <button
            onClick={capture}
            disabled={camStatus !== "live" || complete || busy}
            className="min-h-[88px] rounded-2xl bg-k-bolt font-serif text-2xl font-bold text-k-ink disabled:opacity-40"
          >
            {complete ? "Got all five" : `Capture ${shots.length + 1} of ${CAPTURES}`}
          </button>
        </div>

        {/* Scrolls only once it is a column of its own; on a phone this is
            part of the one page scroll and a nested one would fight it. */}
        <div className="flex min-h-0 flex-col gap-3 md:overflow-y-auto">
          <button
            onClick={save}
            disabled={!complete || busy}
            className="min-h-[88px] rounded-2xl bg-k-grass font-serif text-2xl font-bold text-k-ink disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save photo"}
          </button>

          <p className="font-mono text-[11px] leading-relaxed text-k-sketch">
            The last of the five becomes {member.firstName}&rsquo;s tile photo. The face
            templates stay on this iPad and are never uploaded.
          </p>
        </div>
      </div>
    </div>
  );
}
