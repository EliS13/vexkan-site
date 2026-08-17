/*
 * Plain anchors, not next/link, for the same reason the board page uses them:
 * these links cross the subdomain rewrite, and client-side navigation resolves
 * the href against the app's own route tree without applying it.
 */
import { getState } from "@/lib/kiosk/store";
import { BADGE_GUIDE, awardKind, badgeBook } from "@/lib/kiosk/badges";
import { BadgeIcon } from "../BadgeIcon";

export const dynamic = "force-dynamic";

/**
 * What every badge is and how it is earned.
 *
 * The counts beside each one come from the live roster, so a member reading
 * this can see whether a thing is rare before deciding to chase it — and an
 * award nobody holds is visibly worth going after.
 */
export default async function AwardsPage() {
  const { now, ...state } = await getState();
  const book = badgeBook(state.members, state.sessions, now);

  const held = new Map<string, number>();
  for (const badges of book.values()) {
    for (const badge of badges) {
      const kind = awardKind(badge);
      held.set(kind, (held.get(kind) ?? 0) + 1);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col p-5">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#ffb100] uppercase">
            Every badge, and how to get it
          </p>
          <h1 className="font-serif text-3xl leading-tight font-bold sm:text-4xl">Awards</h1>
        </div>
        <a
          href="/board"
          className="rounded-lg border-2 border-[#2e343b] px-4 py-3 font-mono text-xs tracking-widest text-[#8b949e] uppercase transition-colors hover:border-[#ffb100] hover:text-[#ffb100]"
        >
          Leaderboard
        </a>
      </header>

      <div className="flex flex-col gap-7">
        {BADGE_GUIDE.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-3 font-mono text-[11px] tracking-[0.18em] text-[#8b949e] uppercase">
              {section.heading}
            </h2>
            <ul className="flex flex-col gap-2">
              {section.entries.map(({ badge, how }) => {
                const count = held.get(badge.id) ?? 0;
                return (
                  <li
                    key={badge.id}
                    id={badge.id}
                    className="flex scroll-mt-4 items-center gap-4 rounded-xl border-2 border-[#2e343b] bg-[#1d2126] p-3 target:border-[#ffb100]"
                  >
                    <BadgeIcon badge={badge} className="size-11 shrink-0 sm:size-12" />
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-lg font-semibold">{badge.label}</p>
                      <p className="font-mono text-[11px] leading-relaxed text-[#8b949e]">{how}</p>
                    </div>
                    <span className="shrink-0 text-right font-mono text-[11px] text-[#8b949e]">
                      {count === 0 ? "unclaimed" : `${count} hold${count === 1 ? "s" : ""} it`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <a
        href="/"
        className="mt-8 rounded-lg border-2 border-[#2e343b] px-4 py-4 text-center font-mono text-xs tracking-widest text-[#8b949e] uppercase"
      >
        Back to sign in
      </a>
    </div>
  );
}
