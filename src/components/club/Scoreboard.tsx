import { teams } from "@/content/club/events";

/**
 * The club's Worlds placings, set the way an event bracket sets them: the
 * placing carries the weight, the field size stays a quiet denominator.
 *
 * Only teams with a placing appear. A team without one is left out rather than
 * shown as a blank, because an empty slot on a scoreboard reads as a zero.
 */
type Line = {
  team: string;
  program: string;
  place: string;
  of?: string;
  note?: string;
};

const LINES: Line[] = [
  { team: "16688A", program: "V5RC", place: "7", of: "84", note: "Inspire Award" },
  { team: "595C", program: "VEX IQ", place: "18" },
  { team: "595Y", program: "VEX IQ", place: "31" },
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
            {line.of && (
              <span className="score ml-1 text-base" style={{ color: "rgba(243,239,232,0.55)" }}>
                / {line.of}
              </span>
            )}
          </div>

          <p className="mt-4 flex items-center gap-2">
            <span className="readout text-sm font-semibold" style={{ color: "var(--purple-on-dark)" }}>
              {line.team}
            </span>
            <span className="eyebrow" style={{ color: "rgba(243,239,232,0.5)" }}>
              {line.program}
            </span>
          </p>

          {line.note && (
            <p
              className="mt-3 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: "rgba(240,132,78,0.16)", color: "var(--purple-on-dark)" }}
            >
              {line.note}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Used by the events page, where the teams' own notes carry the detail. */
export function teamsWithResults() {
  return teams.filter((t) => t.status === "active");
}
