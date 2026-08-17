import type { ReactNode } from "react";
import type { Badge } from "@/lib/kiosk/badges";
import type { TeamAward } from "@/lib/kiosk/vexAwards";
import { awardKind } from "@/lib/kiosk/badges";
import { ALONGSIDE, formatDuration, formatElapsed, formatHours, sessionMs } from "@/lib/kiosk/hours";
import { CLUB_TIMEZONE } from "@/lib/kiosk/schedule";
import type { Member, Session } from "@/lib/kiosk/types";
import { teamsFor } from "@/lib/kiosk/teams";
import { Avatar } from "./Avatar";
import { BadgeIcon } from "./BadgeIcon";

/**
 * One member: who they are, what they have done, and what they have earned.
 *
 * Presentational and hook-free on purpose, so the same markup serves the kiosk
 * overlay — where it carries a sign-in button — and the standalone page the
 * leaderboard links to, which is read-only. Two copies of this would drift the
 * first time a badge was added.
 */
/* Who the alongside line is about. One entry today; read from the same map. */
const ALONGSIDE_LABEL = Object.values(ALONGSIDE)[0]?.join(" and ") ?? "others";

/* Five fit without the visits below being pushed off a phone screen. */
const AWARDS_AT_FIRST = 5;

/*
 * Which awards a member would name first.
 *
 * Twenty-two in a list makes them all the same size, and they are not: a
 * Worlds award and Excellence are the ones somebody tells you about, and Robot
 * Skills Champion at a December qualifier is the twelfth. Worlds first, then
 * the judged and overall awards, then everything else in the order VEX gave.
 */
const AWARD_RANK = ["Excellence", "Inspire", "Tournament Champions", "Design", "Teamwork Champion"];

function rankAwards(awards: TeamAward[]): TeamAward[] {
  const score = (a: TeamAward) => {
    if (a.worlds) return -100;
    const hit = AWARD_RANK.findIndex((name) => a.title.startsWith(name));
    return hit === -1 ? 50 : hit;
  };
  return [...awards].sort((a, b) => score(a) - score(b));
}

const SHOWN_AT_FIRST = 5;

export function MemberProfile({
  member,
  signedIn,
  totalMs,
  currentMs,
  visits,
  badges,
  vexAwards = [],
  recent,
  now,
  alongside = 0,
  action,
}: {
  member: Member;
  signedIn: boolean;
  totalMs: number;
  currentMs: number | null;
  visits: number;
  badges: Badge[];
  /** Competition awards this member shares, from the VEX API. */
  vexAwards?: TeamAward[];
  /** Their last few visits, newest first. */
  recent: Session[];
  now: number;
  /** Time in the room for somebody else's session. Shown apart from the total. */
  alongside?: number;
  /** The sign-in button on the kiosk; nothing on the read-only page. */
  action?: ReactNode;
}) {
  const fullName = `${member.firstName} ${member.lastName}`;
  const teams = teamsFor(fullName);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0 sm:size-24">
          <Avatar member={member} signedIn={signedIn} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-2xl font-bold sm:text-3xl">
            {member.firstName} {member.lastName}
          </p>
          <p className="font-mono text-[11px] tracking-widest uppercase">
            {signedIn ? (
              <span className="text-[#35c17a]">In the room · {formatElapsed(currentMs ?? 0)}</span>
            ) : (
              <span className="text-[#8b949e]">Not signed in</span>
            )}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-2">
        {[
          ["Hours", `${formatHours(totalMs)}h`],
          ["Visits", String(visits)],
          ["Badges", String(badges.length)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border-2 border-[#2e343b] bg-[#14171a] px-3 py-2">
            <dt className="font-mono text-[10px] tracking-widest text-[#8b949e] uppercase">
              {label}
            </dt>
            <dd className="font-serif text-xl font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {/*
        * Kept out of the figure above rather than folded into it. The hours
        * tile is the sum of this member's own sessions and has to stay
        * reconcilable against the record; this is time they were in the room
        * for somebody else's, which is true but is not the same claim.
        */}
      {alongside > 0 && (
        <p className="rounded-xl border-2 border-dashed border-[#2e343b] px-3 py-2 font-mono text-[11px] leading-relaxed text-[#8b949e]">
          <span className="text-[#ffb100]">+{formatHours(alongside)}h alongside</span> — as team
          leader, in the room whenever {ALONGSIDE_LABEL} were, without signing in separately. Not
          counted in the hours above, the leaderboard, or any club total. A floor rather than a
          total: build time, management and course prep were never signed in at all.
        </p>
      )}

      {action}

      <section>
        <h3 className="mb-2 font-mono text-[10px] tracking-[0.18em] text-[#8b949e] uppercase">
          {badges.length === 0 ? "No badges yet" : `Badges · ${badges.length}`}
        </h3>
        {badges.length === 0 ? (
          <p className="font-mono text-[11px] text-[#8b949e]">
            Badges arrive with hours, visits and turning up. See the awards screen for the full
            list.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {badges.slice(0, SHOWN_AT_FIRST).map((badge) => (
              <li key={badge.id}>
                <a
                  href={`/awards#${awardKind(badge)}`}
                  className="flex items-center gap-3 rounded-xl border-2 border-[#2e343b] bg-[#14171a] p-2 transition-colors hover:border-[#ffb100]"
                >
                  <BadgeIcon badge={badge} className="size-9 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-base font-semibold">{badge.label}</p>
                    <p className="truncate font-mono text-[10px] text-[#8b949e]">{badge.detail}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}

        {/*
          * Past five, the rest fold away. A member with a dozen badges should
          * not push their recent visits off the screen — and <details> needs no
          * JavaScript, so this behaves the same in the kiosk overlay and on the
          * server-rendered page.
          */}
        {badges.length > SHOWN_AT_FIRST && (
          <details className="mt-2 group">
            <summary className="cursor-pointer list-none rounded-lg border-2 border-[#2e343b] px-3 py-2 text-center font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
              <span className="group-open:hidden">
                View {badges.length - SHOWN_AT_FIRST} more
              </span>
              <span className="hidden group-open:inline">Show fewer</span>
            </summary>
            <ul className="mt-2 flex flex-col gap-2">
              {badges.slice(SHOWN_AT_FIRST).map((badge) => (
                <li key={badge.id}>
                  <a
                    href={`/awards#${awardKind(badge)}`}
                    className="flex items-center gap-3 rounded-xl border-2 border-[#2e343b] bg-[#14171a] p-2 transition-colors hover:border-[#ffb100]"
                  >
                    <BadgeIcon badge={badge} className="size-9 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-base font-semibold">{badge.label}</p>
                      <p className="truncate font-mono text-[10px] text-[#8b949e]">{badge.detail}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      {teams.length > 0 && (
        <section>
          <h3 className="mb-2 font-mono text-[10px] tracking-[0.18em] text-[#8b949e] uppercase">
            Teams
          </h3>
          <ul className="flex flex-wrap gap-1.5">
            {teams.map((team) => (
              <li
                key={`${team.number}-${team.season}`}
                title={team.worlds ? "Competed at the World Championship" : undefined}
                className={`rounded-lg border-2 px-2.5 py-1.5 font-mono text-[11px] ${
                  team.worlds
                    ? "border-[#c8971a] bg-[#ffcc48]/10 text-[#ffcc48]"
                    : "border-[#2e343b] bg-[#14171a] text-[#c2c8cf]"
                }`}
              >
                {team.number}
                <span className={`ml-1.5 ${team.worlds ? "text-[#ffcc48]/70" : "text-[#8b949e]"}`}>
                  {team.season}
                </span>
              </li>
            ))}
          </ul>
          {teams.some((t) => t.worlds) && (
            <p className="mt-1.5 font-mono text-[10px] text-[#ffcc48]">
              Gold marks a team that competed at the World Championship.
            </p>
          )}
          {/*
            * Marked per team, never per season. Qualification was individual —
            * the 2024-25 squad came from several teams — so colouring every
            * team whose season ended at Worlds credited teams that never went.
            */}
        </section>
      )}

      {vexAwards.length > 0 && (
        <section>
          <h3 className="mb-2 font-mono text-[10px] tracking-[0.18em] text-[#8b949e] uppercase">
            Won at competition · {vexAwards.length}
          </h3>
          <ul className="flex flex-col gap-1.5">
            {rankAwards(vexAwards).slice(0, AWARDS_AT_FIRST).map((award, i) => (
              <li
                key={`${award.teamNumber}-${award.title}-${i}`}
                className={`flex items-baseline gap-2 rounded-lg border-2 px-2.5 py-1.5 ${
                  award.worlds ? "border-[#c8971a] bg-[#ffcc48]/10" : "border-[#2e343b] bg-[#14171a]"
                }`}
              >
                <span
                  className={`w-14 shrink-0 font-mono text-[10px] ${
                    award.worlds ? "text-[#ffcc48]" : "text-[#8b949e]"
                  }`}
                >
                  {award.teamNumber}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-serif text-sm">{award.title}</span>
                  <span className="block truncate font-mono text-[10px] text-[#8b949e]">
                    {award.season} · {award.event}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          {vexAwards.length > AWARDS_AT_FIRST && (
            <details className="group mt-2">
              <summary className="cursor-pointer list-none rounded-lg border-2 border-[#2e343b] px-3 py-2 text-center font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
                <span className="group-open:hidden">
                  View {vexAwards.length - AWARDS_AT_FIRST} more
                </span>
                <span className="hidden group-open:inline">Show fewer</span>
              </summary>
              <ul className="mt-2 flex flex-col gap-1.5">
                {rankAwards(vexAwards)
                  .slice(AWARDS_AT_FIRST)
                  .map((award, i) => (
                    <li
                      key={`rest-${award.teamNumber}-${award.title}-${i}`}
                      className="flex items-baseline gap-2 rounded-lg border-2 border-[#2e343b] bg-[#14171a] px-2.5 py-1.5"
                    >
                      <span className="w-14 shrink-0 font-mono text-[10px] text-[#8b949e]">
                        {award.teamNumber}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-serif text-sm">{award.title}</span>
                        <span className="block truncate font-mono text-[10px] text-[#8b949e]">
                          {award.season} · {award.event}
                        </span>
                      </span>
                    </li>
                  ))}
              </ul>
            </details>
          )}
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <h3 className="mb-2 font-mono text-[10px] tracking-[0.18em] text-[#8b949e] uppercase">
            Recent visits
          </h3>
          <ul className="flex flex-col gap-px overflow-hidden rounded-xl border-2 border-[#2e343b] bg-[#14171a]">
            {recent.map((sessionRow) => {
              const open = sessionRow.signedOutAt === null;
              return (
                <li key={sessionRow.id} className="flex items-baseline gap-3 px-3 py-2">
                  <span className="w-28 shrink-0 font-mono text-[11px] text-[#8b949e]">
                    {new Date(sessionRow.signedInAt).toLocaleDateString("en-CA", {
                      timeZone: CLUB_TIMEZONE,
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex-1 font-mono text-[11px] tabular-nums">
                    {new Date(sessionRow.signedInAt).toLocaleTimeString("en-CA", {
                      timeZone: CLUB_TIMEZONE,
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <span
                    className={`shrink-0 font-mono text-[11px] tabular-nums ${
                      open ? "text-[#35c17a]" : "text-[#8b949e]"
                    }`}
                  >
                    {open ? "here now" : formatDuration(sessionMs(sessionRow, now))}
                    {sessionRow.autoClosed && !open && (
                      <span className="text-[#ffb100]" title="Closed by rule, not a real sign-out">
                        {" "}
                        est
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="font-mono text-[10px] text-[#8b949e]">
        {visits > 0 &&
          `${visits} ${visits === 1 ? "visit" : "visits"} across every season, ${formatDuration(totalMs)} in total.`}
      </p>
    </div>
  );
}
