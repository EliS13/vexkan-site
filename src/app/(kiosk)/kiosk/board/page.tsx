/*
 * Plain anchors, not next/link, for every link that crosses the subdomain
 * rewrite. Client-side navigation resolves the literal href against the app's
 * own route tree without applying rewrites, so on signin.vexkan.ca a <Link
 * href="/"> walked into the club site's routes instead of the kiosk and the
 * button appeared to do nothing. A full navigation lets the server rewrite it.
 */
import { mayView } from "@/lib/kiosk/visit";
import { redirect } from "next/navigation";
import { getState } from "@/lib/kiosk/store";
import { formatDuration, formatHours, leaderboard } from "@/lib/kiosk/hours";
import { badgeBook, seasonAt, seasonLabel, sessionsInSeason } from "@/lib/kiosk/badges";
import { BadgeIcon } from "../BadgeIcon";
import { Avatar } from "../Avatar";


export const dynamic = "force-dynamic";

/* A row is one line tall. Past four chips it wraps and the board loses its shape. */
const BADGES_ON_A_ROW = 4;


/**
 * Ranked by hours in the room. Quieter and denser than the kiosk: this is read
 * standing still, not tapped in passing.
 *
 * Two boards, and the season is the one it opens on. All time is the honest
 * total but it is also a seniority list — a member in their third year sits
 * above one in their first no matter who turned up this week, and a board
 * nobody new can move on is a board they stop reading. The season resets that
 * every May while all time keeps the long record intact.
 */
export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  /*
   * One gate, on the sign-in screen, rather than the same form on four pages.
   * Somebody who typed /awards without a cookie lands where the code is asked
   * and knows where they are, instead of meeting a lock screen wearing the
   * awards page's URL.
   */
  if (!(await mayView())) redirect("/");

  const { now, ...state } = await getState();
  const season = seasonAt(now);
  /* In the URL rather than in client state, so the choice survives a reload
     and can be linked to — the same reason the gate stopped living in React. */
  const allTime = (await searchParams).range === "all";
  const counted = allTime ? state.sessions : sessionsInSeason(state.sessions, season);

  const standings = leaderboard(state.members, counted, now);
  const most = standings[0]?.totalMs ?? 0;
  /* Badges are read from every session either way. They are things a member
     earned, not a ranking, and having them blink out when the board is
     switched to this season would read as losing them. */
  const book = badgeBook(state.members, state.sessions, now);

  return (
    <div className="mx-auto flex min-h-dvh max-w-4xl flex-col p-5">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-k-bolt-ink uppercase">
            {allTime ? "Hours in the room, all time" : `Hours in the room, ${seasonLabel(season)}`}
          </p>
          <h1 className="font-serif text-3xl leading-tight font-bold sm:text-4xl">Leaderboard</h1>
        </div>
        <a
          href="/"
          className="rounded-lg border-2 border-k-rule px-4 py-3 font-mono text-xs tracking-widest text-k-sketch uppercase transition-colors hover:border-k-bolt hover:text-k-bolt-ink"
        >
          Back to sign in
        </a>
      </header>

      {/*
        * Two plain links rather than a control, for the same reason every other
        * link here is one: this crosses the subdomain rewrite, and client-side
        * navigation would resolve the href against the wrong route tree.
        */}
      <nav aria-label="Which hours to rank by" className="mb-4 flex gap-2">
        {[
          { href: "/board", label: seasonLabel(season), on: !allTime },
          { href: "/board?range=all", label: "All time", on: allTime },
        ].map((tab) => (
          <a
            key={tab.href}
            href={tab.href}
            aria-current={tab.on ? "page" : undefined}
            className={`rounded-lg border-2 px-4 py-2 font-mono text-xs tracking-widest uppercase transition-colors ${
              tab.on
                ? "border-k-bolt bg-k-bolt/10 text-k-bolt-ink"
                : "border-k-rule text-k-sketch hover:border-k-bolt hover:text-k-bolt-ink"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </nav>

      <ol className="flex flex-col gap-2">
        {standings.map((standing, index) => {
          const { member, totalMs, visits, signedIn, currentMs } = standing;
          /* Bar length is relative to the leader, so the gap is visible rather
             than needing the numbers to be read and compared. */
          const share = most > 0 ? (totalMs / most) * 100 : 0;

          return (
            <li key={member.id}>
              <a
                href={`/member/${member.id}`}
                className={`relative flex items-center gap-4 overflow-hidden rounded-xl border-2 p-3 transition-colors hover:border-k-bolt ${
                  signedIn ? "border-k-grass bg-k-card" : "border-k-rule bg-k-card"
                }`}
              >
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 bg-k-bolt/10"
                style={{ width: `${share}%` }}
              />

              <span className="relative w-8 shrink-0 text-center font-mono text-lg font-bold tabular-nums text-k-sketch">
                {index + 1}
              </span>

              <div className="relative size-12 shrink-0">
                <Avatar member={member} signedIn={signedIn} />
              </div>

              <div className="relative min-w-0 flex-1">
                {/*
                  * Every badge, not the tile's best three. This page is read
                  * standing still, and it is the only place the kiosk can
                  * explain what each one was for — the tiles themselves are
                  * sign-in buttons and cannot spend a tap on detail.
                  */}
                {(book.get(member.id) ?? []).length > 0 && (
                  <ul className="mb-1 flex flex-wrap items-center gap-1">
                    {(book.get(member.id) ?? []).slice(0, BADGES_ON_A_ROW).map((badge) => (
                      <li
                        key={badge.id}
                        title={badge.detail}
                        className="flex items-center gap-1 rounded border border-k-rule bg-k-paper py-0.5 pr-2 pl-1 font-mono text-[10px] text-k-sketch"
                      >
                        <BadgeIcon badge={badge} className="size-4" />
                        {badge.label}
                      </li>
                    ))}
                    {(book.get(member.id) ?? []).length > BADGES_ON_A_ROW && (
                      <li className="font-mono text-[10px] text-k-sketch">
                        +{(book.get(member.id) ?? []).length - BADGES_ON_A_ROW}
                      </li>
                    )}
                    <li className="ml-1 font-mono text-[10px] text-k-faint">
                      {(book.get(member.id) ?? []).length} badges
                    </li>
                  </ul>
                )}
                <p className="truncate font-serif text-lg font-semibold">
                  {member.firstName} {member.lastName}
                </p>
                <p className="font-mono text-[11px] text-k-sketch">
                  {visits} {visits === 1 ? "visit" : "visits"}
                  {signedIn && (
                    <span className="text-k-grass-ink">
                      {" · here now, "}
                      {formatDuration(currentMs ?? 0)}
                    </span>
                  )}
                </p>
              </div>

              <div className="relative shrink-0 text-right">
                <p className="font-mono text-xl font-bold tabular-nums">{formatHours(totalMs)}h</p>
                {/* Somebody with no visits has not been for under a minute — they
                    have not been. Common on a season board in May. */}
                <p className="font-mono text-[11px] text-k-sketch">
                  {visits === 0 ? "not yet" : formatDuration(totalMs)}
                </p>
              </div>
              </a>
            </li>
          );
        })}
      </ol>

      {standings.length === 0 && (
        <p className="py-16 text-center font-serif text-2xl font-semibold text-k-sketch">
          {allTime ? "No hours recorded yet." : `Nobody has hours in ${seasonLabel(season)} yet.`}
        </p>
      )}

      <p className="mt-6 border-t border-k-rule pt-4 font-mono text-[11px] text-k-sketch">
        Totals include the visit in progress.
        {!allTime && ` A season runs from the first of May, so this is ${seasonLabel(season)} only.`}
      </p>
    </div>
  );
}
