import { awards, teams, type Award } from "@/content/club/events";
import { TrophyIcon } from "./TrophyIcon";

/**
 * The club's teams in order, each holding the screen while you scroll past it
 * and then sliding away under the next one.
 *
 * The mechanism is `position: sticky` and nothing else. Every card sticks to
 * the same line near the top of the screen, against the whole list rather
 * than its own slot, so each one pins there and the next scrolls up and
 * covers it. That is where the sense of one team leaving and the next
 * arriving comes from — no scroll listener, no observer, no animation, and
 * nothing that can fail to fire.
 *
 * The stick has to be against the list. A card that is sticky inside its own
 * wrapper can only pin for the slack in that wrapper — a 440px card in a
 * 620px slot holds for 77px, which reads as not working at all.
 *
 * Which matters more than the effect: every team and every award is plain
 * markup, rendered on the server. With JavaScript off, or sticky unsupported,
 * this is a readable list of nine teams and their records. Nothing is hidden
 * waiting for a script to reveal it.
 */
export function TeamStack() {
  /* Awards per team, in the order the awards file lists them. */
  const byTeam = new Map<string, Award[]>(teams.map((t) => [t.number, []]));
  for (const a of awards) byTeam.get(a.team)?.push(a);

  return (
    <ol className="mt-8">
      {teams.map((team, i) => {
        const won = byTeam.get(team.number) ?? [];
        return (
          <li key={team.number} className="sticky top-24 mb-[38vh] last:mb-0">
            <div
              className="lift min-h-[clamp(320px,44vh,420px)] overflow-hidden rounded-3xl p-7 sm:p-9"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
            >
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
                <div>
                  {/*
                   * Position in the run, which is the one number here that is
                   * genuinely a sequence and so earns being numbered.
                   */}
                  <p className="eyebrow text-[var(--muted)]">
                    {String(i + 1).padStart(2, "0")} / {String(teams.length).padStart(2, "0")}
                  </p>
                  <span className="readout mt-3 block text-[clamp(2.5rem,6vw,3.75rem)] font-semibold leading-none text-[var(--purple-text)]">
                    {team.number}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold">{team.name}</h3>
                  <p className="eyebrow mt-2 text-[var(--muted)]">
                    {team.program} · {team.grade}
                  </p>
                  <p className="mt-4 text-sm text-muted">{team.note}</p>
                </div>

                <div>
                  {won.length > 0 ? (
                    <>
                      <p className="eyebrow text-[var(--muted)]">
                        {won.length} {won.length === 1 ? "award" : "awards"}
                      </p>
                      {/*
                       * Two columns once there is room. A team with ten awards
                       * would otherwise make a card twice the height of the
                       * rest, and in a stack the tall one pokes out below the
                       * short ones sitting on top of it.
                       */}
                      <ul className="mt-4 space-y-3 sm:columns-2 sm:gap-x-8 sm:space-y-0">
                        {won.map((a) => (
                          <li
                            key={`${a.award}-${a.event}`}
                            className="flex gap-3 break-inside-avoid sm:mb-3"
                          >
                            <TrophyIcon size={16} className="mt-1 shrink-0 text-[var(--purple)]" />
                            <span>
                              <span className="font-semibold">{a.award}</span>
                              <span className="block text-[13px] text-muted">{a.event}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    /*
                     * What the team has done, rather than what it has not.
                     * Every team without an award on the shelf still qualified
                     * for provincials, which is the fact worth leading on.
                     */
                    <>
                      <p className="eyebrow text-[var(--muted)]">This season</p>
                      <p className="mt-4 flex gap-3 text-[var(--ink-body)]">
                        <TrophyIcon size={16} className="mt-1 shrink-0 text-[var(--purple)]" />
                        <span className="font-semibold">
                          Qualified for the provincial championships
                        </span>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
