/*
 * Plain anchors, not next/link, for the same reason the board page uses them:
 * these links cross the subdomain rewrite, and client-side navigation resolves
 * the href against the app's own route tree without applying it.
 */
import { mayView } from "@/lib/kiosk/visit";
import { redirect } from "next/navigation";
import { getState } from "@/lib/kiosk/store";
import { BADGE_GUIDE, awardKind, badgeBook, clubAwards } from "@/lib/kiosk/badges";
import { TEAMS } from "@/lib/kiosk/teams";
import { awardsForTeams } from "@/lib/kiosk/vexAwards";
import { BadgeIcon } from "../BadgeIcon";

export const dynamic = "force-dynamic";

/**
 * What every badge is and how it is earned.
 *
 * The counts beside each one come from the live roster, so a member reading
 * this can see whether a thing is rare before deciding to chase it — and an
 * award nobody holds is visibly worth going after.
 */
/* Past this many, a section folds the rest behind a count. Twenty-one secrets
   is a scroll nobody finishes; six is a list somebody reads. */
const SHOWN_PER_SECTION = 6;

export default async function AwardsPage() {
  /*
   * One gate, on the sign-in screen, rather than the same form on four pages.
   * Somebody who typed /awards without a cookie lands where the code is asked
   * and knows where they are, instead of meeting a lock screen wearing the
   * awards page's URL.
   */
  if (!(await mayView())) redirect("/");

  const { now, ...state } = await getState();
  const book = badgeBook(state.members, state.sessions, now);

  const held = new Map<string, number>();
  for (const badges of book.values()) {
    for (const badge of badges) {
      const kind = awardKind(badge);
      held.set(kind, (held.get(kind) ?? 0) + 1);
    }
  }

  /* Real results, from VEX rather than from anybody's memory. */
  const vex = await awardsForTeams([...new Set(TEAMS.map((t) => t.number))]);
  const club = clubAwards(
    state.members,
    state.sessions,
    now,
    vex.ok ? vex.awards.length : undefined,
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col p-5">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-k-bolt-ink uppercase">
            Every badge, and how to get it
          </p>
          <h1 className="font-serif text-3xl leading-tight font-bold sm:text-4xl">Badges</h1>
        </div>
        <div className="flex shrink-0 gap-2">
          <a
            href="/"
            className="rounded-lg border-2 border-k-rule px-4 py-3 font-mono text-xs tracking-widest text-k-sketch uppercase transition-colors hover:border-k-bolt hover:text-k-bolt-ink"
          >
            Sign in
          </a>
          <a
            href="/board"
            className="rounded-lg border-2 border-k-rule px-4 py-3 font-mono text-xs tracking-widest text-k-sketch uppercase transition-colors hover:border-k-bolt hover:text-k-bolt-ink"
          >
            Leaderboard
          </a>
        </div>
      </header>

      <section className="mb-7">
        <h2 className="mb-1 font-mono text-[11px] tracking-[0.18em] text-k-sketch uppercase">
          The club
        </h2>
        <p className="mb-3 font-mono text-[11px] text-k-faint">
          Goals nobody earns alone. These belong to the club, not to a member.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {club.map((award) => {
            const share = Math.min(100, (award.current / award.target) * 100);
            return (
              <li
                key={award.id}
                className="relative flex items-center gap-3 overflow-hidden rounded-xl border-2 border-k-rule bg-k-card p-3"
              >
                <div
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-k-bolt/10"
                  style={{ width: `${share}%` }}
                />
                <BadgeIcon
                  badge={{
                    id: award.id,
                    label: award.label,
                    detail: award.detail,
                    shape: award.shape,
                    tier: award.done ? "gold" : "milestone",
                    weight: 0,
                  }}
                  className="relative size-9 shrink-0"
                />
                <div className="relative min-w-0 flex-1">
                  <p className="truncate font-serif text-base font-semibold">{award.label}</p>
                  <p className="font-mono text-[11px] text-k-sketch">{award.detail}</p>
                </div>
                <span className="relative shrink-0 font-mono text-[11px] tabular-nums text-k-bolt-ink">
                  {Math.round(share)}%
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex flex-col gap-7">
        {BADGE_GUIDE.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-3 font-mono text-[11px] tracking-[0.18em] text-k-sketch uppercase">
              {section.heading}
            </h2>
            {(() => {
              const render = (rows: typeof section.entries) => (
                <ul className="flex flex-col gap-2">
                  {rows.map(({ badge, how, secret }) => {
                const count = held.get(badge.id) ?? 0;
                /* A secret stays secret until somebody in the club finds it. */
                const locked = secret === true && count === 0;
                return (
                  <li
                    key={badge.id}
                    id={badge.id}
                    className="flex scroll-mt-4 items-center gap-4 rounded-xl border-2 border-k-rule bg-k-card p-3 target:border-k-bolt"
                  >
                    {locked ? (
                      <span className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-dashed border-k-faint font-serif text-xl text-k-faint sm:size-12">
                        ?
                      </span>
                    ) : (
                      <BadgeIcon badge={badge} className="size-11 shrink-0 sm:size-12" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`font-serif text-lg font-semibold ${locked ? "text-k-faint" : ""}`}>
                        {locked ? "Secret award" : badge.label}
                      </p>
                      <p className="font-mono text-[11px] leading-relaxed text-k-sketch">
                        {locked ? "Nobody has found this one yet." : how}
                      </p>
                    </div>
                    <span className="shrink-0 text-right font-mono text-[11px] text-k-sketch">
                      {count === 0 ? "unclaimed" : `${count} hold${count === 1 ? "s" : ""} it`}
                    </span>
                  </li>
                );
              })}
                </ul>
              );
              const first = section.entries.slice(0, SHOWN_PER_SECTION);
              const rest = section.entries.slice(SHOWN_PER_SECTION);
              return (
                <>
                  {render(first)}
                  {rest.length > 0 && (
                    <details className="group mt-2">
                      <summary className="cursor-pointer list-none rounded-lg border-2 border-k-rule px-3 py-3 text-center font-mono text-[11px] tracking-widest text-k-sketch uppercase">
                        <span className="group-open:hidden">Show {rest.length} more</span>
                        <span className="hidden group-open:inline">Show fewer</span>
                      </summary>
                      <div className="mt-2">{render(rest)}</div>
                    </details>
                  )}
                </>
              );
            })()}
          </section>
        ))}
      </div>

    </div>
  );
}
