/*
 * Plain anchors, not next/link, for every link that crosses the subdomain
 * rewrite. Client-side navigation resolves the literal href against the app's
 * own route tree without applying rewrites, so on signin.vexkan.ca a <Link
 * href="/"> walked into the club site's routes instead of the kiosk and the
 * button appeared to do nothing. A full navigation lets the server rewrite it.
 */
import { getState } from "@/lib/kiosk/store";
import { formatDuration, formatHours, leaderboard } from "@/lib/kiosk/hours";
import { badgeBook, type Badge } from "@/lib/kiosk/badges";
import { Avatar } from "../Avatar";

/* Shape as well as colour, so the tiers survive a photograph and colour blindness. */
const TIER_STYLE: Record<Badge["tier"], string> = {
  gold: "border-[#c8971a] bg-[#ffcc48]/15 text-[#ffcc48]",
  silver: "border-[#8f9296] bg-[#d7dade]/15 text-[#d7dade]",
  bronze: "border-[#8a5a2b] bg-[#cd8b4a]/15 text-[#cd8b4a]",
  runnerUp: "border-[#4a525b] bg-[#20242a] text-[#c2c8cf]",
  milestone: "border-[#2f6f52] bg-[#173a2b] text-[#7fe0ae]",
  streak: "border-[#7a4a86] bg-[#3a2140] text-[#dbaeea]",
  special: "border-[#8a6a1f] bg-[#3a2f12] text-[#f0cf7a]",
};

export const dynamic = "force-dynamic";

/**
 * Ranked by total hours in the room. Quieter and denser than the kiosk: this is
 * read standing still, not tapped in passing.
 */
export default async function BoardPage() {
  const { now, ...state } = await getState();
  const standings = leaderboard(state.members, state.sessions, now);
  const most = standings[0]?.totalMs ?? 0;
  const book = badgeBook(state.members, state.sessions, now);

  return (
    <div className="mx-auto flex min-h-dvh max-w-4xl flex-col p-5">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#ffb100] uppercase">
            Hours in the room
          </p>
          <h1 className="font-serif text-3xl leading-tight font-bold sm:text-4xl">Leaderboard</h1>
        </div>
        <a
          href="/"
          className="rounded-lg border-2 border-[#2e343b] px-4 py-3 font-mono text-xs tracking-widest text-[#8b949e] uppercase transition-colors hover:border-[#ffb100] hover:text-[#ffb100]"
        >
          Back to sign in
        </a>
      </header>

      <ol className="flex flex-col gap-2">
        {standings.map((standing, index) => {
          const { member, totalMs, visits, signedIn, currentMs } = standing;
          /* Bar length is relative to the leader, so the gap is visible rather
             than needing the numbers to be read and compared. */
          const share = most > 0 ? (totalMs / most) * 100 : 0;

          return (
            <li
              key={member.id}
              className={`relative flex items-center gap-4 overflow-hidden rounded-xl border-2 p-3 ${
                signedIn ? "border-[#ffb100] bg-[#1d2126]" : "border-[#2e343b] bg-[#1d2126]"
              }`}
            >
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 bg-[#ffb100]/10"
                style={{ width: `${share}%` }}
              />

              <span className="relative w-8 shrink-0 text-center font-mono text-lg font-bold tabular-nums text-[#8b949e]">
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
                  <ul className="mb-1 flex flex-wrap gap-1">
                    {(book.get(member.id) ?? []).map((badge) => (
                      <li
                        key={badge.id}
                        title={badge.detail}
                        className={`flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] ${TIER_STYLE[badge.tier]}`}
                      >
                        <span aria-hidden>{badge.icon}</span>
                        {badge.label}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="truncate font-serif text-lg font-semibold">
                  {member.firstName} {member.lastName}
                </p>
                <p className="font-mono text-[11px] text-[#8b949e]">
                  {visits} {visits === 1 ? "visit" : "visits"}
                  {signedIn && (
                    <span className="text-[#ffb100]">
                      {" · here now, "}
                      {formatDuration(currentMs ?? 0)}
                    </span>
                  )}
                </p>
              </div>

              <div className="relative shrink-0 text-right">
                <p className="font-mono text-xl font-bold tabular-nums">{formatHours(totalMs)}h</p>
                <p className="font-mono text-[11px] text-[#8b949e]">{formatDuration(totalMs)}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {standings.length === 0 && (
        <p className="py-16 text-center font-serif text-2xl font-semibold text-[#8b949e]">
          No hours recorded yet.
        </p>
      )}

      <p className="mt-6 border-t border-[#2e343b] pt-4 font-mono text-[11px] text-[#8b949e]">
        Totals include the visit in progress.
      </p>
    </div>
  );
}
