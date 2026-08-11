import { ladder, programFamilies, spectating } from "@/content/club/compete";
import { Card } from "./Card";

/**
 * The competition ladder: qualifiers, provincials, Worlds.
 *
 * Static markup with no client boundary. It is three paragraphs and a list, and
 * the audience is a family on school wifi — there is nothing here worth
 * shipping JavaScript for.
 */
export function CompetitionLadder() {
  return (
    <ol className="grid gap-5 sm:grid-cols-3">
      {ladder.map((rung) => (
        <li key={rung.step}>
          <Card className="h-full">
            <span className="readout text-sm font-semibold text-[var(--purple-text)]">
              {rung.step}
            </span>
            <h3 className="mt-3 text-lg font-semibold">{rung.title}</h3>
            <p className="mt-3 text-sm text-muted">{rung.what}</p>
          </Card>
        </li>
      ))}
    </ol>
  );
}

/** VEX IQ against V5RC, so a reader can find the row that is theirs. */
export function ProgramComparison() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {programFamilies.map((p) => (
        <Card key={p.name} className="h-full">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <span
              className="eyebrow rounded-full px-2.5 py-1"
              style={{ background: "var(--teal-bg)", color: "var(--teal-text)" }}
            >
              {p.who}
            </span>
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="eyebrow text-[var(--muted)]">The kit</dt>
              <dd className="mt-1.5 text-[var(--ink-body)]">{p.kit}</dd>
            </div>
            <div>
              <dt className="eyebrow text-[var(--muted)]">A match</dt>
              <dd className="mt-1.5 text-[var(--ink-body)]">{p.format}</dd>
            </div>
          </dl>
        </Card>
      ))}
    </div>
  );
}

/**
 * Watching, which is genuinely free and is the lowest-commitment thing on the
 * whole site. It gets the teal treatment the free resources get, because it
 * belongs on the same side of the line.
 */
export function SpectatingNote() {
  return (
    <div
      className="rounded-2xl px-5 py-4"
      style={{ background: "var(--teal-bg)", border: "1px solid var(--teal)" }}
    >
      <p className="font-semibold text-[var(--teal-text)]">{spectating.headline}</p>
      <p className="mt-2 text-sm text-[var(--ink-body)]">{spectating.detail}</p>
    </div>
  );
}
