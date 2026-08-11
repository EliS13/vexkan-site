/**
 * The club's Worlds placings: three numbers and the teams that earned them.
 *
 * Just the placing. The field size and the Inspire Award both used to hang off
 * 16688A's line and made one of three equal panels louder than the other two —
 * the award has its own block directly below this anyway, so saying it here as
 * well was saying it twice.
 *
 * Only teams with a placing appear. A team without one is left out rather than
 * shown as a blank, because an empty slot on a scoreboard reads as a zero.
 */
type Line = {
  team: string;
  program: string;
  place: string;
  /** The World Championship these came from, so a placing dates itself. */
  year: string;
};

/*
 * Not all one trip. The club has been to the World Championship in more than
 * one year, so each line carries its own — do not "tidy" these to a single
 * year on the assumption that they went together, which is exactly the wrong
 * guess that had 595C down as 2026 to begin with.
 *
 * 595C's 18th is 2025, from the club. 16688A's 7th is 2026, which matches the
 * Inspire Award filed against the 2026 World Championship in events.ts.
 */
const LINES: Line[] = [
  { team: "16688A", program: "V5RC", place: "7", year: "2026" },
  { team: "595C", program: "VEX IQ", place: "18", year: "2025" },
  { team: "595Y", program: "VEX IQ", place: "31", year: "2026" },
];

function ordinal(place: string): string {
  const n = Number(place);
  if (n % 100 >= 11 && n % 100 <= 13) return "th";
  return ["th", "st", "nd", "rd"][n % 10] ?? "th";
}

export function Scoreboard() {
  return (
    <ul className="grid gap-px overflow-hidden rounded-2xl sm:grid-cols-3" style={{ background: "rgba(243,239,232,0.12)" }}>
      {LINES.map((line) => (
        <li key={line.team} className="p-7" style={{ background: "var(--ink-deep)" }}>
          <div className="flex items-baseline gap-2">
            <span className="score text-6xl font-semibold" style={{ color: "#f3efe8" }}>
              {line.place}
            </span>
            <span className="score text-2xl font-medium" style={{ color: "rgba(243,239,232,0.55)" }}>
              {ordinal(line.place)}
            </span>
          </div>

          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="readout text-sm font-semibold" style={{ color: "var(--purple-on-dark)" }}>
              {line.team}
            </span>
            <span className="eyebrow" style={{ color: "rgba(243,239,232,0.5)" }}>
              {line.program}
            </span>
            <span className="eyebrow" style={{ color: "rgba(243,239,232,0.5)" }}>
              · {line.year}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}


