import type { Metadata } from "next";
import { org } from "@/content/club/org";
import { achievements, events, inspireAward, teams } from "@/content/club/events";
import { isTbd } from "@/content/club/types";
import { Section } from "@/components/club/Section";
import { Card } from "@/components/club/Card";
import { Button } from "@/components/club/Button";

export const metadata: Metadata = {
  title: `Events & Results — ${org.name}`,
  description:
    "Regional VEX IQ and V5RC competitions VexKan teams attend, and how our teams have placed.",
};

export default function EventsPage() {
  const competitions = events.filter((e) => e.kind === "competition");
  const results = events.filter((e) => e.kind === "result");

  return (
    <>
      <Section
        eyebrow="Events"
        title="Where our teams compete"
        titleAs="h1"
        lead="Competition dates are set by the REC Foundation each season and change from year to year. Get in touch for the current calendar."
      />

      <Section tone="surface" title="Competitions">
        <div className="grid gap-5 sm:grid-cols-2">
          {competitions.map((e) => (
            <Card key={e.slug}>
              <h3 className="text-lg font-semibold">{e.name}</h3>
              <p className="mt-3 text-sm text-muted">{e.summary}</p>
              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex gap-3">
                  <dt className="eyebrow w-20 shrink-0 pt-0.5 text-[var(--muted)]">Date</dt>
                  <dd className={isTbd(e.date) ? "text-muted" : "text-[var(--ink-body)]"}>{e.date}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="eyebrow w-20 shrink-0 pt-0.5 text-[var(--muted)]">Location</dt>
                  <dd className={isTbd(e.location) ? "text-muted" : "text-[var(--ink-body)]"}>{e.location}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      </Section>

      {/*
       * The Inspire Award is judged, not won on the field, so the criteria say
       * more about the club than the trophy does. They are summarised in our
       * own words and linked to the REC Foundation rather than reproduced.
       */}
      <div className="band-dark">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <p className="eyebrow">Judged award · {inspireAward.event}</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl" style={{ color: "#f3efe8" }}>
            Team {inspireAward.team} won the {inspireAward.name}
          </h2>
          <p className="club-lead mt-5 max-w-2xl" style={{ color: "rgba(243,239,232,0.78)" }}>
            {inspireAward.summary}
          </p>

          <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl sm:grid-cols-2" style={{ background: "rgba(243,239,232,0.12)" }}>
            {inspireAward.criteria.map((c, i) => (
              <li key={c} className="flex gap-4 p-6" style={{ background: "var(--ink-deep)" }}>
                <span className="readout shrink-0 text-sm" style={{ color: "var(--purple-on-dark)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ color: "rgba(243,239,232,0.88)" }}>{c}</span>
              </li>
            ))}
          </ol>

          <p className="mt-6 text-sm" style={{ color: "rgba(243,239,232,0.6)" }}>
            {inspireAward.note} Criteria summarised from the{" "}
            <a
              href={inspireAward.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
              style={{ color: "var(--purple-on-dark)" }}
            >
              {inspireAward.sourceLabel}
            </a>
            .
          </p>
        </div>
      </div>

      <Section title="Results">
        <div className="grid gap-5 sm:grid-cols-2">
          {results.map((e) => (
            <Card key={e.slug}>
              <h3 className="text-lg font-semibold">{e.name}</h3>
              <p className="mt-3 text-[var(--ink-body)]">{e.summary}</p>
              {!isTbd(e.location) && (
                <p className="eyebrow mt-4 text-[var(--muted)]">{e.location}</p>
              )}
            </Card>
          ))}
        </div>

        <h3 className="mt-12 text-lg font-semibold">Club record</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {achievements.map((a) => (
            <li key={a} className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--purple)" }} aria-hidden="true" />
              <span className="text-[var(--ink-body)]">{a}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="surface" title="Our teams">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {teams.map((t) => (
            <Card key={t.number}>
              <span className="readout text-xl font-semibold">{t.number}</span>
              <p className="eyebrow mt-1 text-[var(--muted)]">
                {t.program} · {t.status === "active" ? "Active" : "Past"}
              </p>
              <p className="mt-3 text-sm text-[var(--ink-body)]">{t.note}</p>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <Button href="/register">Join a team</Button>
        </div>
      </Section>
    </>
  );
}
