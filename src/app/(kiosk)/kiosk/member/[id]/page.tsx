/*
 * Plain anchors, not next/link — these cross the subdomain rewrite. See the
 * note at the top of Kiosk.tsx.
 */
import { notFound } from "next/navigation";
import { getState } from "@/lib/kiosk/store";
import { badgeBook } from "@/lib/kiosk/badges";
import { alongsideMs, recentVisits, standingFor } from "@/lib/kiosk/hours";
import { awardsForMember, awardsForTeams } from "@/lib/kiosk/vexAwards";
import { TEAMS } from "@/lib/kiosk/teams";
import { MemberProfile } from "../../MemberProfile";

export const dynamic = "force-dynamic";

/**
 * One member, read-only, linked from the leaderboard.
 *
 * No sign-in button: this is reached from a board somebody is reading, often
 * not the person themselves, and the kiosk is where attendance is taken. The
 * kiosk's own overlay carries the action.
 */
export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { now, ...state } = await getState();
  const member = state.members.find((m) => m.id === id);
  if (!member) notFound();

  const standing = standingFor(member, state.sessions, now);
  const badges = badgeBook(state.members, state.sessions, now).get(member.id) ?? [];
  const vex = await awardsForTeams([...new Set(TEAMS.map((t) => t.number))]);
  const won = vex.ok
    ? awardsForMember(vex.awards, `${member.firstName} ${member.lastName}`)
    : [];

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col p-5">
      <MemberProfile
        member={member}
        signedIn={standing.signedIn}
        totalMs={standing.totalMs}
        currentMs={standing.currentMs}
        visits={standing.visits}
        badges={badges}
        recent={recentVisits(state.sessions, member.id)}
        now={now}
        alongside={alongsideMs(member, state.members, state.sessions, now)}
        vexAwards={won}
      />

      <a
        href="/"
        className="mt-6 rounded-lg border-2 border-[#2e343b] px-4 py-4 text-center font-mono text-xs tracking-widest text-[#8b949e] uppercase transition-colors hover:border-[#ffb100] hover:text-[#ffb100]"
      >
        Back to sign in
      </a>

    </div>
  );
}
