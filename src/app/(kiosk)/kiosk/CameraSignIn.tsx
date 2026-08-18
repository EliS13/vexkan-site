"use client";

import { useCallback, useEffect, useState } from "react";
import { detectAll, detectOne, grabFrame, loadFaceEngine } from "@/lib/kiosk/face";
import { useCamera } from "@/lib/kiosk/useCamera";
import { CameraGate } from "./CameraGate";
import { reconcile, adopt, saveDescriptors, descriptorsFor } from "@/lib/kiosk/faceStore";
import { descriptorFromPhoto, planRecovery } from "@/lib/kiosk/faceRecovery";
import {
  identify,
  voteAcrossFrames,
  distanceToMember,
  VERIFY_DISTANCE,
  type MatchResult,
} from "@/lib/kiosk/matching";
import { postJson, type SignInReply } from "@/lib/kiosk/postJson";
import type { KioskState, Member } from "@/lib/kiosk/types";

/*
 * How many frames a shot samples, and how far apart.
 *
 * Was four frames a third of a second apart, which meant a second of standing
 * still before any work started and then four full detection passes. Two frames
 * close together catch a blink — the thing multi-frame sampling is actually for
 * — at roughly half the wait and half the inference.
 */
/*
 * One photo. Sampling several frames was insurance against a blink, but it made
 * the button feel unresponsive: a wait with a live picture still moving, so it
 * was never clear the tap had registered. Taking a single frame, freezing it on
 * screen and reading that is both faster and legible — you can see exactly what
 * the camera judged you on.
 */
const FRAMES = 1;
const FRAME_GAP_MS = 0;

type Mode = { kind: "group" } | { kind: "verify"; member: Member };

/**
 * Names the failure and where it came from.
 *
 * Safari words every SyntaxError as "the string did not match the expected
 * pattern" and identifies nothing else, so an unlabelled one is untraceable —
 * it could be a malformed URL, a bad date, or a rejected input value. Prefixing
 * with the step that failed turns a report of "the string error" into something
 * that points at a single function.
 */
function describeFailure(err: unknown): string {
  if (!(err instanceof Error)) return "unknown error";
  return err.name && err.name !== "Error" ? `${err.name}: ${err.message}` : err.message;
}

/**
 * Why the camera has nothing to compare against.
 *
 * Three different problems used to wear one sentence. An iPad that has never
 * been enrolled on needs members signed up. An iPad holding templates that
 * match nobody needs those particular members again — telling its owner to
 * "sign members up first" sends them to add people already on the roster. And
 * an iPad where the roster has been photographed but this device has not seen
 * any of those faces needs neither: the photographs are enough to start from.
 */
function unenrolledMessage(orphaned: number, fromPhotos: number): string {
  const photos =
    fromPhotos === 0
      ? ""
      : fromPhotos === 1
        ? " One member already has a sign-up photo their face can be read from."
        : ` ${fromPhotos} members already have a sign-up photo their face can be read from.`;

  if (orphaned === 0) return `Nobody is enrolled on this iPad yet.${photos || " Sign members up first."}`;
  return orphaned === 1
    ? `This iPad has one face saved, but it belongs to somebody no longer on the roster.${photos}`
    : `This iPad has ${orphaned} faces saved, but none of them match anybody on the roster.${photos}`;
}

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
  onDone: (next: { sessions: KioskState["sessions"]; now: number }, signedIn: Member[]) => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState("Starting the camera…");
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passcode, setPasscode] = useState("");
  /** The frozen photo being analysed, so the tap visibly did something. */
  const [shot, setShot] = useState<string | null>(null);
  /** Whether the code entry is showing instead of waiting on a face. */
  const [usingCode, setUsingCode] = useState(false);
  /**
   * What a pass over the members' photographs could do for this iPad, kept in
   * state so the error can offer the work rather than only naming the problem.
   *
   * `stranded` is templates here that belong to nobody on the roster.
   * `fromPhotos` is members with a photograph but no face on this device —
   * which on a fresh iPad is everybody who was ever photographed.
   */
  const [stranded, setStranded] = useState(0);
  const [fromPhotos, setFromPhotos] = useState(0);

  const memberById = useCallback(
    (id: string) => state.members.find((m) => m.id === id) ?? null,
    [state.members],
  );

  /*
   * Destructured at the call site. Held as one object, the React compiler infers
   * the whole thing is ref-bearing (getVideo closes over a ref) and rejects
   * every read of it during render.
   */
  const { attach, getVideo, status: camStatus, message: camMessage, start: camStart, resume: camResume, facing, flip } =
    useCamera();

  /*
   * Only the models are loaded up front. The camera itself waits for the tap on
   * CameraGate: iOS Safari rejects getUserMedia outside a user gesture, so
   * starting it here would fail before the permission sheet ever appeared.
   */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus("Loading the face models…");
        await loadFaceEngine();
        if (cancelled) return;
        // Already allowed on this device: skip the gate entirely.
        void camResume();
        setStatus(
          mode.kind === "group"
            ? "Get everyone in frame, then take the photo."
            : `Look at the camera, ${mode.member.firstName}.`,
        );
      } catch {
        setError("The face models could not load. Check the connection and try again.");
      }
    })();
    return () => { cancelled = true; };
  }, [mode, camResume]);

  /** Samples several frames so a blink or a turned head cannot decide anything. */
  const sampleFrames = useCallback(async (): Promise<HTMLCanvasElement[]> => {
    const frames: HTMLCanvasElement[] = [];
    for (let i = 0; i < FRAMES; i++) {
      const el = getVideo();
      if (!el) break;
      frames.push(grabFrame(el));
      if (i < FRAMES - 1) await new Promise((r) => setTimeout(r, FRAME_GAP_MS));
    }
    if (frames[0]) setShot(frames[0].toDataURL("image/jpeg", 0.8));
    return frames;
  }, [getVideo]);

  const runGroup = useCallback(async () => {
    setBusy(true);
    setStatus("Looking…");
    try {
      /*
       * Squared against the roster first. Templates keyed to a member id that
       * no longer exists are re-linked by name, which is what the roster being
       * rebuilt in Postgres broke: every id changed, so every template on the
       * iPad pointed at nobody and the group photo insisted the club had never
       * enrolled anyone. Whatever cannot be placed is left alone rather than
       * carried into the match, because an id the database rejects fails the
       * whole batch with a message about a string being invalid.
       */
      const { enrolled, orphaned } = reconcile(state.members);
      const have = new Set(enrolled.map((f) => f.memberId));
      const photographed = state.members.filter((m) => m.photoUrl && !have.has(m.id)).length;
      setStranded(orphaned.length);
      setFromPhotos(photographed);
      if (enrolled.length === 0) {
        setError(unenrolledMessage(orphaned.length, photographed));
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
        const vote = voteAcrossFrames(votes, 1);
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
      setError(`Reading the photo failed — ${describeFailure(err)}`);
    } finally {
      setBusy(false);
    }
  }, [memberById, sampleFrames, state.members]);

  /**
   * Puts stranded templates back on their owners, using the photograph each
   * member had taken when they signed up.
   *
   * Every member without a template is read once, and the orphans are matched
   * against those readings. Anything the match is not sure of is left where it
   * is, so the worst outcome is that somebody still has to enroll again — the
   * one outcome ruled out is a face attached to the wrong person.
   */
  /**
   * Gives this iPad faces to compare against, using the photograph each member
   * had taken when they signed up.
   *
   * Two different jobs, in the order that loses the least. A template that is
   * merely stranded on an old id is reattached whole, keeping the five angles
   * it was enrolled with. A member this device has never seen gets a template
   * read out of their photograph instead — one angle rather than five, which
   * is weaker at a turned head and still far better than not being recognised
   * at all. Enrolling properly from their tile replaces it outright.
   */
  const recover = useCallback(async () => {
    setBusy(true);
    setError(null);
    setStatus("Reading the sign-up photos…");
    try {
      const { enrolled, orphaned } = reconcile(state.members);
      const have = new Set(enrolled.map((f) => f.memberId));

      const photos: { memberId: string; descriptor: number[] }[] = [];
      let unreadable = 0;
      let unphotographed = 0;
      for (const member of state.members) {
        if (have.has(member.id)) continue;
        if (!member.photoUrl) {
          unphotographed++;
          continue;
        }
        const descriptor = await descriptorFromPhoto(member.photoUrl);
        if (descriptor) photos.push({ memberId: member.id, descriptor });
        else unreadable++;
      }

      /* Stranded templates first, so anybody who really was enrolled here
         keeps the five angles rather than being flattened to one. */
      const { links } = planRecovery(orphaned, photos);
      const reclaimed = adopt(
        links.flatMap((link) => {
          const member = memberById(link.memberId);
          return member ? [{ orphanId: link.orphanId, member }] : [];
        }),
      );
      const claimed = new Set(links.map((link) => link.memberId));

      let seeded = 0;
      for (const photo of photos) {
        if (claimed.has(photo.memberId)) continue;
        const member = memberById(photo.memberId);
        if (!member) continue;
        saveDescriptors(member, [photo.descriptor]);
        seeded++;
      }

      const after = reconcile(state.members);
      setStranded(after.orphaned.length);
      setFromPhotos(0);

      const done = reclaimed + seeded;
      if (done === 0) {
        setError(
          unreadable > 0
            ? `No faces could be read. ${unreadable} sign-up ${unreadable === 1 ? "photo has" : "photos have"} no face the camera can make out, so ${unreadable === 1 ? "that member needs" : "those members need"} enrolling from their ${unreadable === 1 ? "tile" : "tiles"}.`
            : "There are no sign-up photos to read faces from. Members have to be enrolled from their tiles first.",
        );
        setStatus("Nothing could be read.");
        return;
      }

      const leftovers = [
        unphotographed > 0 ? `${unphotographed} ${unphotographed === 1 ? "has" : "have"} no photo` : "",
        unreadable > 0 ? `${unreadable} had no readable face` : "",
      ].filter(Boolean);

      setError(
        leftovers.length > 0
          ? `${leftovers.join(" and ")}, so ${leftovers.length === 1 && unphotographed === 1 ? "that member still needs" : "those members still need"} enrolling from their tiles.`
          : null,
      );
      setStatus(`${done} ${done === 1 ? "member is" : "members are"} ready. Take the photo again.`);
    } catch (err) {
      setError(`Reading the sign-up photos failed — ${describeFailure(err)}`);
    } finally {
      setBusy(false);
    }
  }, [memberById, state.members]);

  const runVerify = useCallback(async () => {
    if (mode.kind !== "verify") return;
    setBusy(true);
    setStatus("Checking…");
    try {
      /* Same repair as the group photo, so one tile is not stuck on a stale
         id while the group shot has already moved past it. */
      reconcile(state.members);
      const mine = descriptorsFor(mode.member.id);
      if (mine.length === 0) {
        setError(`${mode.member.firstName} is not enrolled on this iPad yet.`);
        return;
      }

      const frames = await sampleFrames();
      let hits = 0;
      let closest = Infinity;
      for (const frame of frames) {
        const { face } = await detectOne(frame, { allowEdge: true });
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

      if (hits >= 1) {
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
      setError(`Checking your face failed — ${describeFailure(err)}`);
    } finally {
      setBusy(false);
    }
  }, [mode, sampleFrames, state.members]);

  /** Writes the sign-ins. Verified when a face decided it, organizer-gated when not. */
  const commit = useCallback(
    async (members: Member[], verified: boolean) => {
      if (members.length === 0) return;
      setBusy(true);
      try {
        const body = await postJson<SignInReply>("/api/signin", {
            memberIds: members.map((m) => m.id),
            verified,
            passcode: verified ? undefined : passcode,
          });
        onDone(body, body.signedIn ?? []);
      } catch (err) {
        setError(`Saving failed — ${describeFailure(err)}`);
      } finally {
        setBusy(false);
      }
    },
    [onDone, passcode],
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-k-paper/97 p-5">
      <header className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-k-bolt-ink uppercase">
            {mode.kind === "group" ? "Camera sign in" : `Confirm ${mode.member.firstName}`}
          </p>
          <p className="font-serif text-2xl font-bold">{status}</p>
        </div>
        <div className="flex gap-2">
          {flip && camStatus === "live" && (
            <button
              onClick={() => { setShot(null); void flip(); }}
              className="min-h-[56px] rounded-lg border-2 border-k-rule px-5 font-mono text-xs tracking-widest text-k-sketch uppercase"
            >
              {facing === "user" ? "Use back camera" : "Use front camera"}
            </button>
          )}
          <button
            onClick={onClose}
            className="min-h-[56px] rounded-lg border-2 border-k-rule px-5 font-mono text-xs tracking-widest text-k-sketch uppercase"
          >
            Close
          </button>
        </div>
      </header>

      {error && (
        <div role="alert" className="mb-3 rounded-lg border-2 border-k-berry bg-k-berry/15 px-4 py-3 text-sm text-k-berry-ink">
          <p>{error}</p>
          {/*
            * Offered here rather than buried in admin, because this banner is
            * where somebody actually meets the problem: they tapped the group
            * photo and were told the faces on this iPad belong to nobody.
            */}
          {(stranded > 0 || fromPhotos > 0) && (
            <button
              type="button"
              onClick={recover}
              disabled={busy}
              className="mt-3 min-h-[44px] w-full rounded-lg border-2 border-k-berry px-4 font-mono text-xs tracking-widest text-k-berry-ink uppercase disabled:opacity-40"
            >
              {busy ? "Reading…" : "Use the sign-up photos"}
            </button>
          )}
        </div>
      )}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/*
         * The video is positioned to fill, not centred by the grid: place-items-center
         * overrides size-full and leaves it at its natural size in the middle of a
         * black box. object-cover rather than contain so the picture crops to the
         * box instead of letterboxing inside it.
         */}
        <div className="relative min-h-[40vh] overflow-hidden rounded-2xl bg-black">
          {/* Mirrored for the person standing there; the captured pixels are not. */}
          <video
            ref={attach}
            muted
            playsInline
            className={`absolute inset-0 size-full object-cover ${facing === "user" ? "-scale-x-100" : ""} ${
              camStatus === "live" ? "" : "hidden"
            }`}
          />
          {shot && (
            /* eslint-disable-next-line @next/next/no-img-element -- in-memory frame */
            <img
              src={shot}
              alt=""
              className={`absolute inset-0 size-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`}
            />
          )}
          {camStatus !== "live" && (
            <div className="absolute inset-0 grid place-items-center">
            <CameraGate
              status={camStatus}
                message={camMessage}
                onStart={camStart}
              purpose={
                mode.kind === "group"
                  ? "The camera reads faces to sign everyone in at once. It runs on this device only."
                  : `The camera checks it is really ${mode.member.firstName} before signing them in. It runs on this device only.`
              }
              onCancel={onClose}
            />
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          {!outcome && camStatus === "live" && !usingCode && (
            <button
              onClick={mode.kind === "group" ? runGroup : runVerify}
              disabled={camStatus !== "live" || busy}
              className="min-h-[88px] rounded-2xl bg-k-bolt px-6 font-serif text-2xl font-bold text-k-ink disabled:opacity-40"
            >
              {busy ? "Working…" : mode.kind === "group" ? "Take the photo" : "Check my face"}
            </button>
          )}

          {/*
           * The code, offered up front rather than only after a face check has
           * failed. Someone not yet enrolled, or standing in bad light, should
           * not have to be refused first to find the way in — and a member
           * waiting on a camera that will not recognise them is the moment the
           * queue at the door stops moving.
           */}
          {!outcome && !usingCode && (
            <button
              onClick={() => setUsingCode(true)}
              className="min-h-[64px] rounded-2xl border-2 border-k-rule font-mono text-xs tracking-widest text-k-sketch uppercase"
            >
              Use a code instead
            </button>
          )}

          {!outcome && usingCode && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const who = mode.kind === "verify" ? [mode.member] : [];
                if (who.length > 0) void commit(who, false);
              }}
              className="flex flex-col gap-3 rounded-2xl border-2 border-k-rule p-4"
            >
              <p className="font-serif text-lg font-semibold">
                {mode.kind === "verify"
                  ? `Sign ${mode.member.firstName} in with the organizer code`
                  : "Pick people from the grid, then use the camera"}
              </p>
              {mode.kind === "verify" && (
                <>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoFocus
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    aria-label="Organizer code"
                    className="min-h-[64px] rounded-xl border-2 border-k-rule bg-k-paper px-4 text-center font-mono text-2xl tracking-[0.3em] text-k-ink"
                  />
                  <button
                    type="submit"
                    disabled={busy || passcode.length === 0}
                    className="min-h-[72px] rounded-2xl bg-k-bolt font-serif text-xl font-bold text-k-ink disabled:opacity-40"
                  >
                    {busy ? "Signing in…" : "Sign in"}
                  </button>
                  {/* Recorded unverified, so a coach can tell these apart later. */}
                  <p className="font-mono text-[10px] leading-relaxed text-k-sketch">
                    Recorded without a face match, and marked as such.
                  </p>
                </>
              )}
              <button
                type="button"
                onClick={() => { setUsingCode(false); setPasscode(""); }}
                className="min-h-[56px] font-mono text-xs tracking-widest text-k-sketch uppercase"
              >
                Back to the camera
              </button>
            </form>
          )}

          {outcome && <Results outcome={outcome} onCommit={commit} busy={busy} passcode={passcode} setPasscode={setPasscode} onRetry={() => { setOutcome(null); setShot(null); setStatus("Ready."); }} />}
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
        <section className="rounded-xl border-2 border-k-grass p-3">
          <h2 className="mb-2 font-mono text-[11px] tracking-widest text-k-grass-ink uppercase">
            Recognised — {matched.length}
          </h2>
          <ul className="mb-3 flex flex-wrap gap-2">
            {matched.map((m) => (
              <li key={m.id} className="rounded-lg bg-k-grass/15 px-3 py-2 font-serif font-semibold">
                {m.firstName} {m.lastName[0]}.
              </li>
            ))}
          </ul>
          <button
            onClick={() => onCommit(matched, true)}
            disabled={busy}
            className="min-h-[64px] w-full rounded-xl bg-k-grass font-serif text-xl font-bold text-k-ink disabled:opacity-40"
          >
            Sign {matched.length === 1 ? "them" : "all"} in
          </button>
        </section>
      )}

      {(ambiguous.length > 0 || unknownFaces > 0) && (
        <section className="rounded-xl border-2 border-k-rule p-3">
          <h2 className="mb-2 font-mono text-[11px] tracking-widest text-k-sketch uppercase">
            Needs an organizer
          </h2>
          {ambiguous.length > 0 && (
            <p className="mb-2 text-sm text-k-sketch">
              Too close to call for{" "}
              <span className="text-k-ink">
                {ambiguous.map((m) => `${m.firstName} ${m.lastName[0]}.`).join(", ")}
              </span>
              . The camera would be guessing, so it did not.
            </p>
          )}
          {unknownFaces > 0 && (
            <p className="mb-2 text-sm text-k-sketch">
              {unknownFaces} {unknownFaces === 1 ? "face was" : "faces were"} not recognised.
            </p>
          )}
          <label className="mb-2 block font-mono text-[11px] tracking-widest text-k-sketch uppercase">
            Organizer passcode
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="mt-1 min-h-[56px] w-full rounded-lg border-2 border-k-rule bg-k-paper px-3 font-mono text-lg text-k-ink"
            />
          </label>
          {ambiguous.length > 0 && (
            <button
              onClick={() => onCommit(ambiguous, false)}
              disabled={busy || passcode.length === 0}
              className="min-h-[64px] w-full rounded-xl border-2 border-k-bolt font-serif text-lg font-bold text-k-bolt-ink disabled:opacity-40"
            >
              Sign in anyway, unverified
            </button>
          )}
        </section>
      )}

      {rejected.length > 0 && (
        <p className="font-mono text-[11px] text-k-sketch">Skipped: {rejected.join(", ")}.</p>
      )}

      <button
        onClick={onRetry}
        disabled={busy}
        className="min-h-[56px] rounded-xl border-2 border-k-rule font-mono text-xs tracking-widest text-k-sketch uppercase"
      >
        Try again
      </button>
    </div>
  );
}
