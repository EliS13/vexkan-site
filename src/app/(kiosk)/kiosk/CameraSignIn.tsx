"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { detectAll, detectOne, grabFrame, loadFaceEngine } from "@/lib/kiosk/face";
import { loadEnrolled, descriptorsFor } from "@/lib/kiosk/faceStore";
import {
  identify,
  voteAcrossFrames,
  distanceToMember,
  VERIFY_DISTANCE,
  type MatchResult,
} from "@/lib/kiosk/matching";
import type { KioskState, Member } from "@/lib/kiosk/types";

/** How many frames a group shot samples, and how far apart. */
const FRAMES = 4;
const FRAME_GAP_MS = 350;

type Mode = { kind: "group" } | { kind: "verify"; member: Member };

type Outcome = {
  matched: Member[];
  ambiguous: Member[];
  unknownFaces: number;
  rejected: string[];
};

export function CameraSignIn({
  mode,
  state,
  onDone,
  onClose,
}: {
  mode: Mode;
  state: KioskState;
  onDone: (next: KioskState & { now: number }, signedIn: Member[]) => void;
  onClose: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState("Starting the camera…");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passcode, setPasscode] = useState("");

  const memberById = useCallback(
    (id: string) => state.members.find((m) => m.id === id) ?? null,
    [state.members],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus("Loading the face models…");
        await loadFaceEngine();
        if (cancelled) return;
        setStatus("Starting the camera…");
        const media = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        stream.current = media;
        if (video.current) {
          video.current.srcObject = media;
          await video.current.play();
        }
        setReady(true);
        setStatus(
          mode.kind === "group"
            ? "Get everyone in frame, then take the photo."
            : `Look at the camera, ${mode.kind === "verify" ? mode.member.firstName : ""}.`,
        );
      } catch (err) {
        const name = err instanceof Error ? err.name : "";
        setError(
          name === "NotAllowedError"
            ? "Camera permission was refused. An organizer can sign people in with the passcode instead."
            : "No camera is available. An organizer can sign people in with the passcode instead.",
        );
      }
    })();

    return () => {
      cancelled = true;
      stream.current?.getTracks().forEach((t) => t.stop());
    };
  }, [mode]);

  /** Samples several frames so a blink or a turned head cannot decide anything. */
  const sampleFrames = useCallback(async (): Promise<HTMLCanvasElement[]> => {
    const frames: HTMLCanvasElement[] = [];
    for (let i = 0; i < FRAMES; i++) {
      if (!video.current) break;
      frames.push(grabFrame(video.current));
      if (i < FRAMES - 1) await new Promise((r) => setTimeout(r, FRAME_GAP_MS));
    }
    return frames;
  }, []);

  const runGroup = useCallback(async () => {
    setBusy(true);
    setStatus("Looking…");
    try {
      const enrolled = loadEnrolled();
      if (enrolled.length === 0) {
        setError("Nobody is enrolled on this iPad yet. Sign members up first.");
        return;
      }

      const frames = await sampleFrames();
      /*
       * Votes are tallied per member rather than per face. Pairing the same
       * face across frames is fragile when people move; asking "did this member
       * win a match in this frame" is not, and it is the question that matters.
       */
      const perFrame: MatchResult[][] = [];
      let unknownFaces = 0;
      const rejected = new Set<string>();

      for (const frame of frames) {
        const faces = await detectAll(frame);
        const results: MatchResult[] = [];
        for (const face of faces) {
          if (!face.quality.ok) {
            rejected.add(face.quality.reason);
            continue;
          }
          results.push(identify(face.descriptor, enrolled));
        }
        perFrame.push(results);
      }

      // A face nobody could place, counted from the clearest frame only.
      const best = perFrame.reduce((a, b) => (b.length > a.length ? b : a), [] as MatchResult[]);
      unknownFaces = best.filter((r) => r.decision === "unknown").length;

      const matched: Member[] = [];
      const ambiguous: Member[] = [];
      for (const face of enrolled) {
        const votes = perFrame.map(
          (frame) =>
            frame.find((r) => r.memberId === face.memberId) ?? {
              memberId: null,
              distance: Infinity,
              runnerUp: null,
              runnerUpMemberId: null,
              decision: "unknown" as const,
            },
        );
        const vote = voteAcrossFrames(votes);
        const member = memberById(face.memberId);
        if (!member) continue;
        if (vote.decision === "accept") matched.push(member);
        else if (vote.decision === "ambiguous") ambiguous.push(member);
      }

      setOutcome({ matched, ambiguous, unknownFaces, rejected: [...rejected] });
      setStatus(
        matched.length > 0
          ? `Recognised ${matched.length}.`
          : "Nobody was recognised confidently.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "The camera check failed.");
    } finally {
      setBusy(false);
    }
  }, [memberById, sampleFrames]);

  const runVerify = useCallback(async () => {
    if (mode.kind !== "verify") return;
    setBusy(true);
    setStatus("Checking…");
    try {
      const mine = descriptorsFor(mode.member.id);
      if (mine.length === 0) {
        setError(`${mode.member.firstName} is not enrolled on this iPad yet.`);
        return;
      }

      const frames = await sampleFrames();
      let hits = 0;
      let closest = Infinity;
      for (const frame of frames) {
        const { face } = await detectOne(frame);
        if (!face || !face.quality.ok) continue;
        /*
         * One claimed identity, so this is the 0.6 verification threshold
         * rather than the stricter identification one. Confirming a single
         * person is a far easier question than picking them out of a roster.
         */
        const d = distanceToMember(face.descriptor, {
          memberId: mode.member.id,
          descriptors: mine,
        });
        closest = Math.min(closest, d);
        if (d < VERIFY_DISTANCE) hits++;
      }

      if (hits >= 2) {
        setOutcome({ matched: [mode.member], ambiguous: [], unknownFaces: 0, rejected: [] });
        setStatus("Recognised.");
      } else {
        setOutcome({ matched: [], ambiguous: [mode.member], unknownFaces: 0, rejected: [] });
        setStatus(
          closest === Infinity
            ? "No face was found in frame."
            : `Not a confident match (closest ${closest.toFixed(2)}).`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The camera check failed.");
    } finally {
      setBusy(false);
    }
  }, [mode, sampleFrames]);

  /** Writes the sign-ins. Verified when a face decided it, organizer-gated when not. */
  const commit = useCallback(
    async (members: Member[], verified: boolean) => {
      if (members.length === 0) return;
      setBusy(true);
      try {
        const res = await fetch("/api/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberIds: members.map((m) => m.id),
            verified,
            passcode: verified ? undefined : passcode,
          }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "That did not save.");
        onDone(body, body.signedIn ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "That did not save.");
      } finally {
        setBusy(false);
      }
    },
    [onDone, passcode],
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#14171a]/97 p-5">
      <header className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#ffb100] uppercase">
            {mode.kind === "group" ? "Camera sign in" : `Confirm ${mode.member.firstName}`}
          </p>
          <p className="font-serif text-2xl font-bold">{status}</p>
        </div>
        <button
          onClick={onClose}
          className="min-h-[56px] rounded-lg border-2 border-[#2e343b] px-5 font-mono text-xs tracking-widest text-[#8b949e] uppercase"
        >
          Close
        </button>
      </header>

      {error && (
        <p role="alert" className="mb-3 rounded-lg border-2 border-[#e04f4f] bg-[#e04f4f]/15 px-4 py-3 text-sm text-[#ffb4b4]">
          {error}
        </p>
      )}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative min-h-0 overflow-hidden rounded-2xl bg-black">
          {/* Mirrored for the person standing there; the captured pixels are not. */}
          <video ref={video} muted playsInline className="size-full -scale-x-100 object-contain" />
        </div>

        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          {!outcome && (
            <button
              onClick={mode.kind === "group" ? runGroup : runVerify}
              disabled={!ready || busy}
              className="min-h-[88px] rounded-2xl bg-[#ffb100] px-6 font-serif text-2xl font-bold text-[#14171a] disabled:opacity-40"
            >
              {busy ? "Working…" : mode.kind === "group" ? "Take the photo" : "Check my face"}
            </button>
          )}

          {outcome && <Results outcome={outcome} onCommit={commit} busy={busy} passcode={passcode} setPasscode={setPasscode} onRetry={() => { setOutcome(null); setStatus("Ready."); }} />}
        </div>
      </div>
    </div>
  );
}

function Results({
  outcome,
  onCommit,
  busy,
  passcode,
  setPasscode,
  onRetry,
}: {
  outcome: Outcome;
  onCommit: (members: Member[], verified: boolean) => void;
  busy: boolean;
  passcode: string;
  setPasscode: (v: string) => void;
  onRetry: () => void;
}) {
  const { matched, ambiguous, unknownFaces, rejected } = outcome;

  return (
    <div className="flex flex-col gap-3">
      {matched.length > 0 && (
        <section className="rounded-xl border-2 border-[#35c17a] p-3">
          <h2 className="mb-2 font-mono text-[11px] tracking-widest text-[#35c17a] uppercase">
            Recognised — {matched.length}
          </h2>
          <ul className="mb-3 flex flex-wrap gap-2">
            {matched.map((m) => (
              <li key={m.id} className="rounded-lg bg-[#35c17a]/15 px-3 py-2 font-serif font-semibold">
                {m.firstName} {m.lastName[0]}.
              </li>
            ))}
          </ul>
          <button
            onClick={() => onCommit(matched, true)}
            disabled={busy}
            className="min-h-[64px] w-full rounded-xl bg-[#35c17a] font-serif text-xl font-bold text-[#14171a] disabled:opacity-40"
          >
            Sign {matched.length === 1 ? "them" : "all"} in
          </button>
        </section>
      )}

      {(ambiguous.length > 0 || unknownFaces > 0) && (
        <section className="rounded-xl border-2 border-[#2e343b] p-3">
          <h2 className="mb-2 font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
            Needs an organizer
          </h2>
          {ambiguous.length > 0 && (
            <p className="mb-2 text-sm text-[#9aa4ae]">
              Too close to call for{" "}
              <span className="text-[#e8eaed]">
                {ambiguous.map((m) => `${m.firstName} ${m.lastName[0]}.`).join(", ")}
              </span>
              . The camera would be guessing, so it did not.
            </p>
          )}
          {unknownFaces > 0 && (
            <p className="mb-2 text-sm text-[#9aa4ae]">
              {unknownFaces} {unknownFaces === 1 ? "face was" : "faces were"} not recognised.
            </p>
          )}
          <label className="mb-2 block font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
            Organizer passcode
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="mt-1 min-h-[56px] w-full rounded-lg border-2 border-[#2e343b] bg-[#14171a] px-3 font-mono text-lg text-[#e8eaed]"
            />
          </label>
          {ambiguous.length > 0 && (
            <button
              onClick={() => onCommit(ambiguous, false)}
              disabled={busy || passcode.length === 0}
              className="min-h-[64px] w-full rounded-xl border-2 border-[#ffb100] font-serif text-lg font-bold text-[#ffb100] disabled:opacity-40"
            >
              Sign in anyway, unverified
            </button>
          )}
        </section>
      )}

      {rejected.length > 0 && (
        <p className="font-mono text-[11px] text-[#8b949e]">Skipped: {rejected.join(", ")}.</p>
      )}

      <button
        onClick={onRetry}
        disabled={busy}
        className="min-h-[56px] rounded-xl border-2 border-[#2e343b] font-mono text-xs tracking-widest text-[#8b949e] uppercase"
      >
        Try again
      </button>
    </div>
  );
}
