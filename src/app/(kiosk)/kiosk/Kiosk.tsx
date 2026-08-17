"use client";

/*
 * Plain anchors, not next/link, for every link that crosses the subdomain
 * rewrite. Client-side navigation resolves the literal href against the app's
 * own route tree without applying rewrites, so on signin.vexkan.ca a <Link
 * href="/"> walked into the club site's routes instead of the kiosk and the
 * button appeared to do nothing. A full navigation lets the server rewrite it.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "./Avatar";
import { CameraSignIn } from "./CameraSignIn";
import { countSignedIn, formatDuration, rosterOrder } from "@/lib/kiosk/hours";
import { CLUB_TIMEZONE, describePhase, orderGroups } from "@/lib/kiosk/schedule";
import type { KioskState, Member } from "@/lib/kiosk/types";

type Confirmation = { member: Member; action: "in" | "out" } | null;
type CameraMode = { kind: "group" } | { kind: "verify"; member: Member } | null;

export function Kiosk({ initial, initialNow }: { initial: KioskState; initialNow: number }) {
  const [state, setState] = useState(initial);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [camera, setCamera] = useState<CameraMode>(null);

  /*
   * Clock. The server's `now` is the anchor and the browser only measures
   * elapsed time from it, so a wrong clock on the iPad cannot skew anyone's
   * hours. Ticking every 10s is enough for a display that shows minutes.
   *
   * `now` is state rather than something derived at render time: reading
   * Date.now() while rendering makes the output depend on when React happens to
   * re-run the component. The anchor is only ever written from an effect or a
   * tap handler, and only ever read inside the interval callback.
   */
  const anchor = useRef({ serverNow: initialNow, at: initialNow });
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    // Re-anchor against the browser's own clock now that we are past render.
    anchor.current = { serverNow: anchor.current.serverNow, at: Date.now() };
    const id = setInterval(() => {
      setNow(anchor.current.serverNow + (Date.now() - anchor.current.at));
    }, 10_000);
    return () => clearInterval(id);
  }, []);

  /*
   * Groups in time order, and the one the kiosk opens on. At 4:28pm on a
   * Tuesday that is the group meeting at 4:30 — the members about to walk in —
   * rather than whichever group happens to sort first alphabetically. Falls
   * back to everyone when nothing is near its slot.
   */
  const groupStandings = useMemo(
    () => orderGroups(state.groups, now),
    [state.groups, now],
  );
  const suggested = groupStandings.find(
    (s) => s.phase === "in-session" || s.phase === "starting-soon",
  );
  const [filter, setFilter] = useState<string | null>(suggested?.group.id ?? null);

  const visibleMembers = useMemo(
    () =>
      filter === null
        ? state.members
        : state.members.filter((m) => m.groupIds.includes(filter)),
    [state.members, filter],
  );

  const roster = useMemo(
    () => rosterOrder(visibleMembers, state.sessions, now),
    [visibleMembers, state.sessions, now],
  );
  // Counted across the whole club, not the filtered view: the header answers
  // "how many are in the room", which a filter should not change.
  const inRoom = countSignedIn(state.members, state.sessions);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const showConfirmation = useCallback((member: Member, action: "in" | "out") => {
    setConfirmation({ member, action });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setConfirmation(null), 2000);
  }, []);

  /**
   * A tap signs a member out, and only out.
   *
   * Tapping a signed-out tile opens the camera on that one person instead of
   * writing anything, because an unverified tap would let anyone credit hours
   * to anyone. Confirming one claimed identity is also the accurate half of
   * face matching, so this path is more reliable than the group shot.
   */
  const tap = useCallback(async (member: Member, signedIn: boolean) => {
    if (pending) return;
    if (!signedIn) {
      setCamera({ kind: "verify", member });
      return;
    }

    setPending(member.id);
    setError(null);
    try {
      const res = await fetch("/api/signout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "That did not save.");

      anchor.current = { serverNow: body.now, at: Date.now() };
      setNow(body.now);
      setState({ members: body.members, sessions: body.sessions, groups: body.groups });
      showConfirmation(body.member, body.action);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not save. Try again.");
    } finally {
      setPending(null);
    }
  }, [pending, showConfirmation]);

  const cameraDone = useCallback(
    (next: KioskState & { now: number }, signedIn: Member[]) => {
      anchor.current = { serverNow: next.now, at: Date.now() };
      setNow(next.now);
      setState({ members: next.members, sessions: next.sessions, groups: next.groups });
      setCamera(null);
      if (signedIn.length === 1) showConfirmation(signedIn[0], "in");
    },
    [showConfirmation],
  );

  return (
    <div className="flex min-h-dvh flex-col p-5 select-none">
      <Header inRoom={inRoom} total={state.members.filter((m) => m.active).length} now={now} />

      {groupStandings.length > 0 && (
        <nav className="mb-3 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter(null)}
            aria-pressed={filter === null}
            className={`min-h-[56px] rounded-xl border-2 px-4 text-left ${
              filter === null
                ? "border-[#ffb100] bg-[#ffb100] text-[#14171a]"
                : "border-[#2e343b] bg-[#1d2126] text-[#e8eaed]"
            }`}
          >
            <span className="block font-serif font-semibold">Everyone</span>
            <span className="block font-mono text-[10px] opacity-70">
              {state.members.filter((m) => m.active).length} members
            </span>
          </button>

          {groupStandings.map((standing) => {
            const selected = filter === standing.group.id;
            const live = standing.phase === "in-session" || standing.phase === "starting-soon";
            return (
              <button
                key={standing.group.id}
                onClick={() => setFilter(standing.group.id)}
                aria-pressed={selected}
                className={`min-h-[56px] rounded-xl border-2 px-4 text-left ${
                  selected
                    ? "border-[#ffb100] bg-[#ffb100] text-[#14171a]"
                    : live
                      ? "border-[#ffb100]/60 bg-[#1d2126] text-[#e8eaed]"
                      : "border-[#2e343b] bg-[#1d2126] text-[#8b949e]"
                }`}
              >
                <span className="block font-serif font-semibold">{standing.group.name}</span>
                <span
                  className={`block font-mono text-[10px] ${
                    selected ? "opacity-70" : live ? "text-[#ffb100]" : "opacity-70"
                  }`}
                >
                  {describePhase(standing)}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-lg border-2 border-[#e04f4f] bg-[#e04f4f]/15 px-4 py-3 font-mono text-sm text-[#ffb4b4]"
        >
          {error}
        </p>
      )}

      {/*
       * auto-rows-min, not auto-rows-fr, and no flex-1 on the grid itself.
       * Rows sized to their content stay the same height whatever the filter
       * shows: a group of three renders three normal tiles rather than one row
       * stretched down the whole screen. Overflow scrolls instead of resizing,
       * which is also what keeps a roster past 24 usable.
       */}
      {roster.length === 0 && (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="font-serif text-2xl font-semibold text-[#8b949e]">
            {state.members.length === 0
              ? "Nobody is signed up yet."
              : "Nobody in this group yet."}
          </p>
          <p className="max-w-sm font-mono text-xs text-[#8b949e]">
            {state.members.length === 0
              ? "Sign up takes a photo and five face captures, one person at a time."
              : "Add members to this group from the admin screen."}
          </p>
        </div>
      )}

      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
        {roster.map(({ member, signedIn, currentMs, totalMs }) => (
          <button
            key={member.id}
            onClick={() => tap(member, signedIn)}
            disabled={pending !== null}
            aria-pressed={signedIn}
            aria-label={`${member.firstName} ${member.lastName}, ${
              signedIn ? "signed in. Tap to sign out." : "signed out. Tap to sign in with the camera."
            }`}
            className={`group relative flex min-h-[88px] flex-col gap-2 rounded-2xl p-3 text-left transition-[transform,background-color] duration-100 active:scale-[0.97] disabled:opacity-70 motion-reduce:transition-none motion-reduce:active:scale-100 ${
              signedIn
                ? "border-4 border-[#ffb100] bg-[#ffb100] text-[#14171a]"
                : "border-2 border-[#2e343b] bg-[#1d2126] text-[#e8eaed]"
            }`}
          >
            {/* Square, so the photo is never stretched to fill a tall row. */}
            <div className="relative aspect-square w-full">
              <Avatar member={member} signedIn={signedIn} />
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate font-serif text-base leading-tight font-semibold sm:text-xl">
                {member.firstName} {member.lastName[0]}.
              </span>
              {/* Not colour alone: filled vs outlined, and the word itself. */}
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-widest ${
                  signedIn
                    ? "bg-[#14171a] text-[#ffb100]"
                    : "border border-[#4a525b] text-[#8b949e]"
                }`}
              >
                {signedIn ? "IN" : "OUT"}
              </span>
            </div>

            <div
              className={`flex justify-between font-mono text-[11px] tabular-nums ${
                signedIn ? "text-[#14171a]/75" : "text-[#8b949e]"
              }`}
            >
              <span>{signedIn ? `here ${formatDuration(currentMs ?? 0)}` : "—"}</span>
              <span title="Total time this season">{formatDuration(totalMs)}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
        <button
          onClick={() => setCamera({ kind: "group" })}
          className="min-h-[88px] flex-1 rounded-2xl bg-[#ffb100] font-serif text-xl font-bold text-[#14171a] sm:text-2xl"
        >
          Camera sign in
        </button>
        <a
          href="/enroll"
          className="grid min-h-[64px] place-items-center rounded-2xl border-2 border-[#2e343b] px-6 font-mono text-xs tracking-widest text-[#8b949e] uppercase sm:min-h-[88px]"
        >
          Sign up
        </a>
      </div>

      {camera && (
        <CameraSignIn
          mode={camera}
          state={state}
          onDone={cameraDone}
          onClose={() => setCamera(null)}
        />
      )}
      {confirmation && <Confirm confirmation={confirmation} />}
    </div>
  );
}

function Header({ inRoom, total, now }: { inRoom: number; total: number; now: number }) {
  const time = new Date(now).toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: CLUB_TIMEZONE,
  });

  return (
    <header className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:mb-4 sm:items-end">
      <div className="flex items-center gap-4">
        {/*
         * The club's own logo, in whichever form fits.
         *
         * The wordmark is 4:1, so held upright it eats the width the room count
         * and the clock need and the header wraps onto three lines. The square V
         * says the same thing in a quarter of the space. Orientation rather than
         * a width breakpoint: an iPad in portrait is still 820px across, wide
         * enough that `sm:` would keep the wordmark exactly where it does not
         * fit. Neither is repeated in text — both already read as the club.
         */}
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size local asset */}
        <img
          src="/icon-192.png"
          alt="VexKan Robotics Club"
          className="size-10 shrink-0 rounded-xl landscape:hidden"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size local asset */}
        <img
          src="/logo-vexkan.png"
          alt="VexKan Robotics Club"
          className="hidden h-8 w-auto shrink-0 landscape:block sm:landscape:h-14"
        />
        <p className="font-serif text-2xl leading-tight font-bold sm:text-4xl">
          <span className="tabular-nums">{inRoom}</span>
          <span className="text-[#8b949e]"> of {total} in</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <a
          href="/admin"
          className="rounded-lg border-2 border-[#2e343b] px-3 py-2 font-mono text-[10px] tracking-widest text-[#8b949e] uppercase transition-colors hover:border-[#ffb100] hover:text-[#ffb100] sm:px-4 sm:py-3 sm:text-xs"
        >
          Admin
        </a>
        <a
          href="/board"
          className="rounded-lg border-2 border-[#2e343b] px-3 py-2 font-mono text-[10px] tracking-widest text-[#8b949e] uppercase transition-colors hover:border-[#ffb100] hover:text-[#ffb100] sm:px-4 sm:py-3 sm:text-xs"
        >
          Leaderboard
        </a>
        <p className="font-mono text-lg tabular-nums text-[#e8eaed] sm:text-3xl">{time}</p>
      </div>
    </header>
  );
}

/**
 * The one animated thing in the kiosk. It names the person and what happened,
 * because "Signed out" alone leaves a member unsure the right tile was hit.
 */
function Confirm({ confirmation }: { confirmation: NonNullable<Confirmation> }) {
  const { member, action } = confirmation;
  const isIn = action === "in";
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-[#14171a]/80 motion-safe:animate-[fadeIn_120ms_ease-out]"
    >
      <div
        className={`rounded-3xl px-12 py-10 text-center motion-safe:animate-[pop_160ms_cubic-bezier(0.2,0.9,0.3,1.2)] ${
          isIn ? "bg-[#ffb100] text-[#14171a]" : "bg-[#e8eaed] text-[#14171a]"
        }`}
      >
        <p className="font-mono text-sm font-bold tracking-[0.2em] uppercase opacity-70">
          {isIn ? "Signed in" : "Signed out"}
        </p>
        <p className="mt-2 font-serif text-5xl font-bold sm:text-6xl">
          {member.firstName} {member.lastName[0]}.
        </p>
      </div>
    </div>
  );
}
