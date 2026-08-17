"use client";

/*
 * Plain anchors, not next/link, for every link that crosses the subdomain
 * rewrite. Client-side navigation resolves the literal href against the app's
 * own route tree without applying rewrites, so on signin.vexkan.ca a <Link
 * href="/"> walked into the club site's routes instead of the kiosk and the
 * button appeared to do nothing. A full navigation lets the server rewrite it.
 */

import { useCallback, useEffect, useState } from "react";
import { cropFace, detectOne, grabFrame, loadFaceEngine } from "@/lib/kiosk/face";
import { saveDescriptors } from "@/lib/kiosk/faceStore";
import { useCamera } from "@/lib/kiosk/useCamera";
import { CameraGate } from "../CameraGate";
import type { KioskState } from "@/lib/kiosk/types";

/**
 * How many angles each member is enrolled from. This is the single biggest
 * lever on camera accuracy: matching runs against a member's closest stored
 * angle, so five captures of a turning head tolerate far more of a real room
 * than one straight-on portrait ever will.
 */
const CAPTURES = 5;

const PROMPTS = [
  "Look straight at the camera.",
  "Turn your head slightly left.",
  "Turn your head slightly right.",
  "Tilt your chin down a little.",
  "Smile.",
];

type Shot = { descriptor: number[]; photo: string };

export function Enroll({ initial }: { initial: KioskState }) {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [shots, setShots] = useState<Shot[]>([]);
  const [status, setStatus] = useState("Loading the face models…");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [roster, setRoster] = useState(initial.members.length);

  /*
   * Destructured at the call site. Held as one object, the React compiler infers
   * the whole thing is ref-bearing (getVideo closes over a ref) and rejects
   * every read of it during render.
   */
  const { attach, getVideo, status: camStatus, message: camMessage, start: camStart, resume: camResume, facing, flip } =
    useCamera();

  /*
   * Models load up front; the camera waits for the tap on CameraGate. iOS
   * Safari rejects getUserMedia outside a user gesture, so opening it from this
   * effect would fail before the permission sheet appeared.
   */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadFaceEngine();
        if (cancelled) return;
        // Already allowed on this device: skip the gate entirely.
        void camResume();
        setStatus(PROMPTS[0]);
      } catch {
        setError("The face models could not load. Check the connection and try again.");
      }
    })();
    return () => { cancelled = true; };
  }, [camResume]);

  /**
   * One capture. Refuses when a second face is in shot: enrolling from a frame
   * with a bystander risks storing the wrong person's template under this
   * member's name, and nothing downstream would ever reveal that.
   */
  const capture = useCallback(async () => {
    const el = getVideo();
    if (!el) return;
    setBusy(true);
    setError(null);
    try {
      const frame = grabFrame(el);
      const { face, extraFaces } = await detectOne(frame, { allowEdge: true });

      if (!face) {
        setError("No face in frame. Move closer and try again.");
        return;
      }
      if (extraFaces > 0) {
        setError("More than one person is in shot. Sign members up one at a time.");
        return;
      }
      if (!face.quality.ok) {
        setError(`${face.quality.reason}. Try again.`);
        return;
      }

      const next = [...shots, { descriptor: face.descriptor, photo: cropFace(frame, face.box) }];
      setShots(next);
      setStatus(
        next.length >= CAPTURES
          ? "All captures done. Add a name and save."
          : PROMPTS[next.length] ?? "One more.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "That capture failed.");
    } finally {
      setBusy(false);
    }
  }, [shots, getVideo]);

  const save = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          // The first capture is the straight-on one, so it makes the tile.
          photoUrl: shots[0].photo,
          passcode,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not save.");

      /*
       * Templates are written to this iPad only, once the member row exists and
       * we have its id. They are never posted to the server: members.face_embedding
       * stays null until written parent consent is actually in place.
       */
      saveDescriptors(body.member.id, shots.map((s) => s.descriptor));

      setSaved(`${body.member.firstName} ${body.member.lastName}`);
      setRoster((n) => n + 1);
      setShots([]);
      setStatus("Saved. Taking you back…");

      /*
       * Back to the kiosk, where the new member's tile is the proof it worked.
       * Staying here after a save left no way to tell a successful sign-up from
       * a silent failure.
       *
       * A full navigation rather than a router push: client-side routing
       * resolves the path without applying the subdomain rewrite, so on
       * signin.vexkan.ca a push to "/" lands in the club site instead of the
       * kiosk. `busy` stays true through the wait so the save cannot be fired
       * twice while the page is on its way out.
       */
      setTimeout(() => window.location.assign("/"), 1200);
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
      setBusy(false);
    }
  }, [firstName, lastName, passcode, shots]);

  const complete = shots.length >= CAPTURES;
  const canSave = complete && firstName.trim() && lastName.trim() && passcode.length > 0;

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col p-5">
      <header className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#ffb100] uppercase">
            {roster} on the roster
          </p>
          <h1 className="font-serif text-3xl font-bold">Sign up a member</h1>
        </div>
        <div className="flex gap-2">
          {/* An organizer holding the iPad photographs someone facing them, so
              the rear camera is the useful one here as well. */}
          {flip && camStatus === "live" && (
            <button
              onClick={() => void flip()}
              className="rounded-lg border-2 border-[#2e343b] px-4 py-3 font-mono text-xs tracking-widest text-[#8b949e] uppercase"
            >
              {facing === "user" ? "Back camera" : "Front camera"}
            </button>
          )}
          <a
            href="/"
            className="grid place-items-center rounded-lg border-2 border-[#2e343b] px-4 font-mono text-xs tracking-widest text-[#8b949e] uppercase"
          >
            Back
          </a>
        </div>
      </header>

      {saved && (
        <p className="mb-3 rounded-lg border-2 border-[#35c17a] bg-[#35c17a]/15 px-4 py-3 text-sm text-[#a7e9c6]">
          {saved} is signed up and enrolled on this iPad.
        </p>
      )}
      {error && (
        <p role="alert" className="mb-3 rounded-lg border-2 border-[#e04f4f] bg-[#e04f4f]/15 px-4 py-3 text-sm text-[#ffb4b4]">
          {error}
        </p>
      )}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="relative min-h-[40vh] flex-1 overflow-hidden rounded-2xl bg-black">
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
                onStart={camStart}
                purpose="Signing someone up needs five photos of their face, taken here. They stay on this device."
              />
              </div>
            )}
          </div>
          <p className="font-serif text-2xl font-semibold">{status}</p>
          <button
            onClick={capture}
            disabled={camStatus !== "live" || busy || complete}
            className="min-h-[88px] rounded-2xl bg-[#ffb100] font-serif text-2xl font-bold text-[#14171a] disabled:opacity-40"
          >
            {complete ? "Got all five" : `Capture ${shots.length + 1} of ${CAPTURES}`}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: CAPTURES }, (_, i) => (
              <div
                key={i}
                className={`aspect-square overflow-hidden rounded-lg border-2 ${
                  shots[i] ? "border-[#35c17a]" : "border-dashed border-[#2e343b]"
                }`}
              >
                {shots[i] && (
                  // eslint-disable-next-line @next/next/no-img-element -- local data URL
                  <img src={shots[i].photo} alt="" className="size-full object-cover" />
                )}
              </div>
            ))}
          </div>

          <label className="font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
            First name
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 min-h-[56px] w-full rounded-lg border-2 border-[#2e343b] bg-[#1d2126] px-3 font-serif text-xl text-[#e8eaed]"
            />
          </label>
          <label className="font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
            Last name
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 min-h-[56px] w-full rounded-lg border-2 border-[#2e343b] bg-[#1d2126] px-3 font-serif text-xl text-[#e8eaed]"
            />
          </label>
          <label className="font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
            Organizer passcode
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="mt-1 min-h-[56px] w-full rounded-lg border-2 border-[#2e343b] bg-[#1d2126] px-3 font-mono text-lg text-[#e8eaed]"
            />
          </label>

          <button
            onClick={save}
            disabled={!canSave || busy}
            className="min-h-[88px] rounded-2xl bg-[#35c17a] font-serif text-2xl font-bold text-[#14171a] disabled:opacity-40"
          >
            Save member
          </button>

          <p className="font-mono text-[11px] leading-relaxed text-[#8b949e]">
            Face templates stay on this iPad and are never uploaded. Clearing this
            site&rsquo;s data deletes them. Written parent consent is required before
            enrolling a member under 18.
          </p>
        </div>
      </div>
    </div>
  );
}
