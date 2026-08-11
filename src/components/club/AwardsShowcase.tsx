import { awards, clubAwards, inspireAward, teamProgram, type Award } from "@/content/club/events";

/**
 * Rough order of what an award says about a team, best first.
 *
 * Excellence is VEX's top award and takes the whole event to win; a skills
 * ranking is one good run. Anything not listed sorts last, so adding an award
 * VEX has invented since does not need this table edited to render.
 */
const AWARD_ORDER = [
  "Excellence Award",
  "Tournament Champions",
  "Teamwork Champion Award",
  "Design Award",
  "Innovate Award",
  "Judges Award",
  "Robot Skills Champion",
  "Tournament Finalists",
  "Build Award",
];

function rank(a: Award): number {
  const i = AWARD_ORDER.indexOf(a.award);
  return i === -1 ? AWARD_ORDER.length : i;
}

/**
 * The few that lead: best first, alternating between the two programs, and one
 * per team before any team gets a second.
 *
 * Sorting on merit alone puts a run of the same team's awards at the top,
 * which reads as one team's page rather than the club's. Alternating keeps
 * both the IQ and the V5 side visible, and the one-per-team pass stops the
 * strongest team from taking three of the five slots.
 */
function leadWith(list: Award[], count: number): Award[] {
  const byProgram = (program: string) =>
    list.filter((a) => teamProgram(a.team) === program).sort((x, y) => rank(x) - rank(y));

  const v5 = byProgram("V5RC");
  const iq = byProgram("VEX IQ");

  const alternating: Award[] = [];
  for (let i = 0; i < Math.max(v5.length, iq.length); i++) {
    if (v5[i]) alternating.push(v5[i]);
    if (iq[i]) alternating.push(iq[i]);
  }

  const picked: Award[] = [];
  const teamsShown = new Set<string>();
  for (const a of alternating) {
    if (picked.length === count) break;
    if (teamsShown.has(a.team)) continue;
    picked.push(a);
    teamsShown.add(a.team);
  }
  /* Fewer teams than slots: fill the rest in the same order. */
  for (const a of alternating) {
    if (picked.length === count) break;
    if (!picked.includes(a)) picked.push(a);
  }
  return picked;
}

function AwardTile({ award }: { award: Award }) {
  return (
    <li
      className="lift lift-hover rounded-2xl px-6 py-5"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold leading-tight tracking-[-0.01em]">{award.award}</h3>
        <span className="readout shrink-0 text-xs font-semibold text-[var(--purple-text)]">
          {award.team}
        </span>
      </div>
      <p className="mt-2 text-[13px] text-muted">{award.event}</p>
    </li>
  );
}

/**
 * Recognition, arranged around what it says about the club rather than as a
 * trophy shelf.
 *
 * The mentored-teams figure leads, because it is the one number here that is
 * about other people. Then five awards, not thirty: a wall of tiles is read as
 * texture and scrolled past, so the rest fold away behind a disclosure for
 * anyone who does want the full list.
 */
export function AwardsShowcase() {
  const rest = awards.filter((a) => a.award !== inspireAward.name);
  const featured = leadWith(rest, 5);
  const folded = rest.filter((a) => !featured.includes(a));

  return (
    <div>
      <div
        className="lift rounded-3xl px-8 py-12 text-center sm:px-12 sm:py-16"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        <p className="score text-[clamp(3.5rem,12vw,7rem)] font-semibold leading-none text-[var(--purple-text)]">
          {clubAwards.count}
        </p>
        <p className="club-lead mx-auto mt-5 max-w-md">{clubAwards.label}</p>
      </div>

      {/*
       * The Inspire Award is deliberately absent: it gets the dark band below,
       * where its criteria are explained, and showing it twice would spend the
       * page's one loud moment on the same thing.
       */}
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((a) => (
          <AwardTile key={`${a.team}-${a.award}-${a.event}`} award={a} />
        ))}
      </ul>

      {folded.length > 0 && (
        /*
         * A native <details>, matching the Signature Events list further up
         * this page. It needs no JavaScript, and the hidden awards are in the
         * markup either way, so they are still found by search.
         */
        <details className="group mt-5">
          <summary
            className="inline-flex cursor-pointer list-none items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{ border: "1px solid var(--line)", background: "var(--surface)" }}
          >
            <span className="group-open:hidden">Show {folded.length} more awards</span>
            <span className="hidden group-open:inline">Show fewer</span>
          </summary>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {folded.map((a) => (
              <AwardTile key={`${a.team}-${a.award}-${a.event}`} award={a} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
