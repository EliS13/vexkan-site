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
import {
  countSignedIn,
  formatDuration,
  alongsideMs,
  isSignedIn,
  recentVisits,
  formatElapsed,
  formatHours,
  placeOf,
  rosterOrder,
  seasonLeaderboard,
} from "@/lib/kiosk/hours";
import { badgeBook, topBadges, type Badge } from "@/lib/kiosk/badges";
import { BadgeIcon } from "./BadgeIcon";
import { MemberProfile } from "./MemberProfile";
import { CLUB_TIMEZONE, describePhase, orderGroups } from "@/lib/kiosk/schedule";
import { postJson, type SignOutReply } from "@/lib/kiosk/postJson";
import type { KioskState, Member } from "@/lib/kiosk/types";

type Confirmation = { member: Member; action: "in" | "out" } | null;
type CameraMode = { kind: "group" } | { kind: "verify"; member: Member } | null;

export function Kiosk({
  initial,
  initialNow,
  initialRosterVersion,
  canSign,
}: {
  initial: KioskState;
  initialNow: number;
  initialRosterVersion: string;
  /** False when this device is not on the club's network. Read-only then. */
  canSign: boolean;
}) {
  const [state, setState] = useState(initial);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  /*
   * Which member's profile is open. Tapping a tile opens this rather than
   * signing straight in or out: the tile now leads to a page about the person,
   * and the action lives on a button there. It costs a tap at the iPad, and
   * buys somewhere for a member to see what they have earned.
   */
  const [profileFor, setProfileFor] = useState<Member | null>(null);
  /* Server's verdict first, refreshed by the poll if the connection changes. */
  const [maySign, setMaySign] = useState(canSign);
  /*
   * Hold a tile to sign in or out; tap it to open the profile.
   *
   * The profile made the common action two taps. A press-and-hold puts the
   * one-tap path back for anyone who knows it, without taking the tile's new
   * job away — and the button inside the profile keeps the action reachable
   * for anyone who does not, including by keyboard, where a hold has no
   * meaning.
   */
  const [holding, setHolding] = useState<string | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const acted = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [camera, setCamera] = useState<CameraMode>(null);
  const rosterVersion = useRef(initialRosterVersion);

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
   * Stay in step with the other devices.
   *
   * Sessions signed on a phone, and members added on a laptop, both have to
   * reach this screen without somebody reloading it. The poll is the slim
   * endpoint — sessions and a roster fingerprint, no photographs — so it costs
   * about two kilobytes. The full roster is only refetched when that
   * fingerprint says it actually changed, which is rarely.
   */
  useEffect(() => {
    let stopped = false;

    const sync = async () => {
      try {
        const res = await fetch("/api/state?slim=1", { cache: "no-store" });
        if (!res.ok || stopped) return;
        // Parsed defensively: a platform error page here would otherwise throw
        // a SyntaxError out of a background timer, with nothing to catch it.
        const body = JSON.parse(await res.text());

        setState((current) => ({ ...current, sessions: body.sessions, groups: body.groups }));
        if (typeof body.canSign === "boolean") setMaySign(body.canSign);
        anchor.current = { serverNow: body.now, at: Date.now() };
        setNow(body.now);

        if (body.rosterVersion !== rosterVersion.current) {
          const full = await fetch("/api/state", { cache: "no-store" });
          if (!full.ok || stopped) return;
          const state = await full.json();
          rosterVersion.current = state.rosterVersion;
          setState({ members: state.members, sessions: state.sessions, groups: state.groups });
        }
      } catch {
        // Offline, or the server is busy. The next tick tries again; nothing
        // here is worth interrupting somebody signing in for.
      }
    };

    const id = setInterval(sync, 15_000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
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
  /*
   * Badges for the whole roster, not the filtered view, so switching groups
   * does not reshuffle who is on a podium. Deliberately not keyed on `now`:
   * the clock ticks every ten seconds and nobody crosses a hundred hours
   * between two of them, so this recomputes only when the sessions do.
   */
  const book = useMemo(
    () => badgeBook(state.members, state.sessions, initialNow),
    [state.members, state.sessions, initialNow],
  );
  // Counted across the whole club, not the filtered view: the header answers
  // "how many are in the room", which a filter should not change. Memoised
  // because the clock re-renders this component every ten seconds and neither
  // figure depends on the time.
  const activeCount = useMemo(
    () => state.members.filter((m) => m.active).length,
    [state.members],
  );
  const inRoom = useMemo(
    () => countSignedIn(state.members, state.sessions),
    [state.members, state.sessions],
  );

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  /*
   * Signing out holds longer than signing in, because it now carries the
   * season board and a placing to find yourself in. Two seconds is enough to
   * read your own name; it is not enough to scan a roster. Eight is, and a tap
   * closes it sooner for anyone already heading for the door.
   */
  const showConfirmation = useCallback((member: Member, action: "in" | "out") => {
    setConfirmation({ member, action });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setConfirmation(null), action === "out" ? 8000 : 2000);
  }, []);

  const dismissConfirmation = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setConfirmation(null);
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

    /*
     * Optimistic. Closing the session locally and showing the confirmation
     * before the round trip is what makes a tap feel instant; the request still
     * has to reach Postgres and come back, and waiting on that read as lag on
     * a wall-mounted iPad. The server's reply replaces this a moment later, and
     * a failure puts the old state back with the reason.
     */
    const previous = state;
    setState({
      ...state,
      sessions: state.sessions.map((s) =>
        s.memberId === member.id && s.signedOutAt === null
          ? { ...s, signedOutAt: new Date(now).toISOString() }
          : s,
      ),
    });
    showConfirmation(member, "out");

    try {
      const body = await postJson<SignOutReply>("/api/signout", { memberId: member.id });

      anchor.current = { serverNow: body.now, at: Date.now() };
      setNow(body.now);
      // Sessions only: the roster and its photographs are unchanged and already here.
      setState((current) => ({ ...current, sessions: body.sessions }));
      if (body.rosterVersion) rosterVersion.current = body.rosterVersion;
    } catch (err) {
      setState(previous);
      setConfirmation(null);
      setError(err instanceof Error ? err.message : "That did not save. Try again.");
    } finally {
      setPending(null);
    }
  }, [pending, showConfirmation, state, now]);

  const startHold = useCallback(
    (member: Member, signedIn: boolean) => {
      if (!maySign) return;
      acted.current = false;
      setHolding(member.id);
      if (holdTimer.current) clearTimeout(holdTimer.current);
      holdTimer.current = setTimeout(() => {
        acted.current = true;
        setHolding(null);
        void tap(member, signedIn);
      }, 550);
    },
    [tap, maySign],
  );

  const endHold = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    setHolding(null);
  }, []);

  useEffect(() => () => { if (holdTimer.current) clearTimeout(holdTimer.current); }, []);

  const cameraDone = useCallback(
    (next: { sessions: KioskState["sessions"]; now: number }, signedIn: Member[]) => {
      anchor.current = { serverNow: next.now, at: Date.now() };
      setNow(next.now);
      setState((current) => ({ ...current, sessions: next.sessions }));
      setCamera(null);
      if (signedIn.length === 1) showConfirmation(signedIn[0], "in");
    },
    [showConfirmation],
  );

  return (
    <div className="flex min-h-dvh flex-col p-5 select-none">
      <Header inRoom={inRoom} total={activeCount} now={now} />

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
              {activeCount} members
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
            onClick={() => {
              // The hold already did something; do not also open the profile.
              if (acted.current) { acted.current = false; return; }
              setProfileFor(member);
            }}
            onPointerDown={() => startHold(member, signedIn)}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            onPointerCancel={endHold}
            // Long-press on iOS otherwise raises the selection callout.
            onContextMenu={(e) => e.preventDefault()}
            disabled={pending === member.id}
            aria-pressed={signedIn}
            aria-label={`${member.firstName} ${member.lastName}, ${
              signedIn ? "signed in" : "signed out"
            }. Open profile, or hold to sign ${signedIn ? "out" : "in"}.`}
            className={`group relative flex min-h-[88px] flex-col gap-2 rounded-2xl p-3 text-left select-none transition-[transform,background-color] duration-100 active:scale-[0.97] disabled:opacity-70 motion-reduce:transition-none motion-reduce:active:scale-100 ${
              holding === member.id ? "ring-4 ring-[#ffb100]" : ""
            } ${
              signedIn
                ? "border-4 border-[#ffb100] bg-[#ffb100] text-[#14171a]"
                : "border-2 border-[#2e343b] bg-[#1d2126] text-[#e8eaed]"
            }`}
          >
            {/* Square, so the photo is never stretched to fill a tall row. */}
            <div className="relative aspect-square w-full">
              <Avatar member={member} signedIn={signedIn} />
              <BadgeRow badges={book.get(member.id) ?? []} />
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
              <span>{signedIn ? `here ${formatElapsed(currentMs ?? 0)}` : "—"}</span>
              {/* Two durations side by side read as one number without this. */}
              <span aria-hidden className={signedIn ? "text-[#14171a]/35" : "text-[#4a525b]"}>
                |
              </span>
              <span title="Total time this season">{formatDuration(totalMs)}</span>
            </div>
          </button>
        ))}
      </div>

      {!maySign && (
        <p className="mt-3 rounded-2xl border-2 border-dashed border-[#2e343b] px-4 py-3 text-center font-mono text-[11px] text-[#8b949e]">
          Read-only — you are not on the club&rsquo;s wifi. Tap anyone to see their hours, badges
          and awards.
        </p>
      )}

      {/*
        * Pinned to the bottom of the screen rather than the end of the roster.
        * With thirty-seven tiles the camera button sat below a scroll, so
        * anybody wanting to sign in a group had to find their way back down to
        * it. It is the most-used control on the screen and should not move.
        *
        * The bar itself is transparent and ignores pointer events; the buttons
        * float over the roster on their own shadows. A solid strip across the
        * bottom cut the grid in half and read as a second, emptier screen.
        */}
      <div
        className={`pointer-events-none sticky bottom-0 z-30 mt-3 flex flex-col gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:flex-row sm:gap-3 ${
          maySign ? "" : "hidden"
        }`}
      >
        <button
          onClick={() => setCamera({ kind: "group" })}
          className="pointer-events-auto min-h-[88px] flex-1 rounded-2xl bg-[#ffb100] font-serif text-xl font-bold text-[#14171a] shadow-[0_8px_24px_rgba(0,0,0,0.55)] sm:text-2xl"
        >
          Camera sign in
        </button>
        <a
          href="/enroll"
          className="pointer-events-auto grid min-h-[64px] place-items-center rounded-2xl border-2 border-[#2e343b] bg-[#1d2126] px-6 font-mono text-xs tracking-widest text-[#8b949e] uppercase shadow-[0_8px_24px_rgba(0,0,0,0.55)] sm:min-h-[88px]"
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
      {profileFor && (
        <Profile
          member={profileFor}
          signedIn={isSignedIn(state.sessions, profileFor.id)}
          standing={roster.find((r) => r.member.id === profileFor.id)}
          badges={book.get(profileFor.id) ?? []}
          recent={recentVisits(state.sessions, profileFor.id)}
          now={now}
          alongside={alongsideMs(profileFor, state.members, state.sessions, now)}
          maySign={maySign}
          busy={pending === profileFor.id}
          onClose={() => setProfileFor(null)}
          onAction={() => {
            const member = profileFor;
            const signedIn = isSignedIn(state.sessions, member.id);
            setProfileFor(null);
            void tap(member, signedIn);
          }}
        />
      )}

      {confirmation && (
        <Confirm
          confirmation={confirmation}
          members={state.members}
          sessions={state.sessions}
          now={now}
          onDismiss={dismissConfirmation}
        />
      )}
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
          href="/awards"
          className="rounded-lg border-2 border-[#2e343b] px-3 py-2 font-mono text-[10px] tracking-widest text-[#8b949e] uppercase transition-colors hover:border-[#ffb100] hover:text-[#ffb100] sm:px-4 sm:py-3 sm:text-xs"
        >
          Badges
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
function Confirm({
  confirmation,
  members,
  sessions,
  now,
  onDismiss,
}: {
  confirmation: NonNullable<Confirmation>;
  members: Member[];
  sessions: KioskState["sessions"];
  now: number;
  onDismiss: () => void;
}) {
  const { member, action } = confirmation;
  if (action === "in") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-[#14171a]/80 motion-safe:animate-[fadeIn_120ms_ease-out]"
      >
        <div className="rounded-3xl bg-[#ffb100] px-12 py-10 text-center text-[#14171a] motion-safe:animate-[pop_160ms_cubic-bezier(0.2,0.9,0.3,1.2)]">
          <p className="font-mono text-sm font-bold tracking-[0.2em] uppercase opacity-70">
            Signed in
          </p>
          <p className="mt-2 font-serif text-5xl font-bold sm:text-6xl">
            {member.firstName} {member.lastName[0]}.
          </p>
        </div>
      </div>
    );
  }
  return <SignedOutBoard member={member} members={members} sessions={sessions} now={now} onDismiss={onDismiss} />;
}

/**
 * The board on the way out: where this member stands this season, with their
 * own row scrolled into view and their placing spelled out along the bottom.
 *
 * Ranked over the season rather than all time. After three years of paper went
 * into the table the all-time order stopped moving, and a member who joined in
 * June would read their name at the bottom of a list they had no way to climb.
 */
function SignedOutBoard({
  member,
  members,
  sessions,
  now,
  onDismiss,
}: {
  member: Member;
  members: Member[];
  sessions: KioskState["sessions"];
  now: number;
  onDismiss: () => void;
}) {
  const standings = useMemo(
    () => seasonLeaderboard(members, sessions, now),
    [members, sessions, now],
  );
  const place = placeOf(standings, member.id);
  const mine = useRef<HTMLLIElement>(null);

  // Their own row, not the top of the list, is what they came to see.
  useEffect(() => {
    mine.current?.scrollIntoView({ block: "center" });
  }, []);

  return (
    /*
     * The dark margin around the card dismisses it. No close button and no
     * instruction to read: tapping away from a thing to be rid of it is the
     * gesture everyone already has, and a kiosk overlay that clears itself in
     * eight seconds anyway does not need to teach one.
     *
     * The card stops the click, so scrolling the list or dragging across a
     * name never dismisses by accident.
     */
    <div
      role="status"
      aria-live="polite"
      onClick={onDismiss}
      className="fixed inset-0 z-50 grid place-items-center bg-[#14171a]/90 p-4 motion-safe:animate-[fadeIn_120ms_ease-out] sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        /*
         * Capped short of the screen on purpose. At full height the only place
         * left to tap is the few pixels of padding at the edge, and "tap
         * outside" stops being a gesture anyone can find. This keeps a band of
         * backdrop above and below the card on every screen.
         */
        className="flex max-h-[82dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border-2 border-[#2e343b] bg-[#1d2126]"
      >
        <header className="shrink-0 px-6 pt-5 pb-3 text-center">
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-[#8b949e] uppercase">
            Signed out
          </p>
          <p className="font-serif text-3xl font-bold sm:text-4xl">
            {member.firstName} {member.lastName[0]}.
          </p>
        </header>

        <ol className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3">
          {standings.map((standing, index) => {
            const isMine = standing.member.id === member.id;
            return (
              <li
                key={standing.member.id}
                ref={isMine ? mine : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  isMine ? "bg-[#ffb100] text-[#14171a]" : "text-[#e8eaed]"
                }`}
              >
                <span className="w-7 shrink-0 text-right font-mono text-sm tabular-nums opacity-60">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-serif text-lg">
                  {standing.member.firstName} {standing.member.lastName[0]}.
                </span>
                <span className="shrink-0 font-mono text-sm tabular-nums">
                  {formatHours(standing.totalMs)}h
                </span>
              </li>
            );
          })}
        </ol>

        <footer className="shrink-0 bg-[#ffb100] px-6 py-4 text-center text-[#14171a]">
          <p className="font-serif text-2xl font-bold sm:text-3xl">
            {place === null ? "Welcome to the club" : `${ordinal(place)} place this season`}
          </p>
          <p className="font-mono text-[11px] tracking-[0.15em] uppercase opacity-70">
            Season since May 1
          </p>
        </footer>
      </div>
    </div>
  );
}

/**
 * A member's profile, over the roster.
 *
 * The tile used to sign you straight in or out. It now opens this, and the
 * action is a button here — one more tap at the iPad, in exchange for a place
 * to see your badges, your hours and when you last came.
 */
function Profile({
  member,
  signedIn,
  standing,
  badges,
  recent,
  now,
  alongside,
  maySign,
  busy,
  onClose,
  onAction,
}: {
  member: Member;
  signedIn: boolean;
  standing?: { totalMs: number; currentMs: number | null; visits: number };
  badges: Badge[];
  recent: KioskState["sessions"];
  now: number;
  alongside: number;
  maySign: boolean;
  busy: boolean;
  onClose: () => void;
  onAction: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-[#14171a]/90 p-4 motion-safe:animate-[fadeIn_120ms_ease-out] sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88dvh] w-full max-w-lg flex-col overflow-y-auto rounded-3xl border-2 border-[#2e343b] bg-[#1d2126] p-4 sm:p-5"
      >
        <MemberProfile
          member={member}
          signedIn={signedIn}
          totalMs={standing?.totalMs ?? 0}
          currentMs={standing?.currentMs ?? null}
          visits={standing?.visits ?? 0}
          badges={badges}
          recent={recent}
          now={now}
          alongside={alongside}
          action={
            !maySign ? (
              <p className="rounded-2xl border-2 border-dashed border-[#2e343b] px-4 py-3 text-center font-mono text-[11px] leading-relaxed text-[#8b949e]">
                Signing in and out only works on the club&rsquo;s wifi. Everything else here —
                hours, badges, awards — reads the same from anywhere.
              </p>
            ) : (
            <button
              onClick={() => onAction()}
              disabled={busy}
              className={`min-h-[64px] w-full rounded-2xl font-serif text-2xl font-bold disabled:opacity-40 ${
                signedIn ? "bg-[#e8eaed] text-[#14171a]" : "bg-[#ffb100] text-[#14171a]"
              }`}
            >
              {busy ? "One moment…" : signedIn ? "Sign out" : "Sign in"}
            </button>
            )
          }
        />
        <button
          onClick={onClose}
          className="mt-3 min-h-[48px] w-full rounded-xl border-2 border-[#2e343b] font-mono text-xs tracking-widest text-[#8b949e] uppercase"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/**
 * The three best badges, sitting on the photograph.
 *
 * Display only — the tile itself is the sign-in button, so a badge cannot be
 * tapped for detail without stealing that tap. The full set, with what each one
 * was for, is on the leaderboard.
 */
function BadgeRow({ badges }: { badges: Badge[] }) {
  const shown = topBadges(badges);
  if (shown.length === 0) return null;
  return (
    <div className="pointer-events-none absolute top-1 left-1 flex gap-1">
      {shown.map((badge) => (
        <BadgeIcon
          key={badge.id}
          badge={badge}
          className="size-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] sm:size-7"
        />
      ))}
    </div>
  );
}

/** 1st, 2nd, 3rd, 4th — including the 11th-to-13th exceptions. */
function ordinal(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}
