import type { Metadata } from "next";
import { org } from "@/content/club/org";
import { achievements, events, inspireAward, placings, teams } from "@/content/club/events";
import { isTbd } from "@/content/club/types";
import { Section } from "@/components/club/Section";
import { Card } from "@/components/club/Card";
import { AwardsShowcase } from "@/components/club/AwardsShowcase";
import {
  featureBothPrograms,
  fetchAlbertaEvents,
  fetchSignatureEvents,
  remainingAfterFeature,
  type LiveEvent,
} from "@/lib/vexEvents";

export const metadata: Metadata = {
  title: `Events & Results, ${org.name}`,
  description:
    "Regional VEX IQ and V5RC competitions VexKan teams attend, and how our teams have placed.",
};

/* Refetched once a day. Competition calendars move over weeks, not minutes. */
export const revalidate = 86400;

function SignatureCard({ event }: { event: LiveEvent }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold">{event.name}</h3>
        <span
          className="eyebrow shrink-0 rounded-full px-2.5 py-1"
          style={{ background: "var(--teal-bg)", color: "var(--teal-text)" }}
        >
          {event.program}
        </span>
      </div>
      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex gap-3">
          <dt className="eyebrow w-20 shrink-0 pt-0.5 text-[var(--muted)]">Date</dt>
          <dd className="text-[var(--ink-body)]">{event.dates}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="eyebrow w-20 shrink-0 pt-0.5 text-[var(--muted)]">Where</dt>
          <dd className="text-[var(--ink-body)]">{event.place}</dd>
        </div>
      </dl>
      <a
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-block text-sm font-semibold text-[var(--purple-text)] hover:underline"
      >
        Details on events.vex.com
      </a>
    </Card>
  );
}

export default async function EventsPage() {
  /* Both fetches share the same daily cache window, so this is one round trip
   * per day, not one per visitor. */
  const [live, signature] = await Promise.all([fetchAlbertaEvents(), fetchSignatureEvents()]);
  const competitions = events.filter((e) => e.kind === "competition");
  const results = events.filter((e) => e.kind === "result");

  return (
    <>
      <Section
        eyebrow="Events"
        title="Where our teams compete"
        titleAs="h1"
        lead="VEX sets the competition calendar each season and it changes from year to year. The full list, including events we have not listed here, is on events.vex.com."
      >
        <p className="club-lead max-w-2xl">
          Search{" "}
          <a
            href="https://events.vex.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 text-[var(--purple-text)]"
          >
            events.vex.com
          </a>{" "}
          by map to find everything running in Alberta this season.
        </p>
      </Section>

      <Section tone="surface" title="Competitions in Alberta">
        {live.ok ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              {live.events.map((e) => (
                <Card key={e.id}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold">{e.name}</h3>
                    <span
                      className="eyebrow shrink-0 rounded-full px-2.5 py-1"
                      style={{ background: "var(--purple-bg)", color: "var(--purple-text)" }}
                    >
                      {e.program}
                    </span>
                  </div>
                  <dl className="mt-5 space-y-2 text-sm">
                    <div className="flex gap-3">
                      <dt className="eyebrow w-20 shrink-0 pt-0.5 text-[var(--muted)]">Date</dt>
                      <dd className="text-[var(--ink-body)]">{e.dates}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="eyebrow w-20 shrink-0 pt-0.5 text-[var(--muted)]">Where</dt>
                      <dd className="text-[var(--ink-body)]">{e.location}</dd>
                    </div>
                  </dl>
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-block text-sm font-semibold text-[var(--purple-text)] hover:underline"
                  >
                    Details on events.vex.com
                  </a>
                </Card>
              ))}
            </div>
            {live.events.length === 0 && (
              <p className="text-muted">
                VEX lists no upcoming Alberta competitions right now. New events appear here as
                soon as they are published.
              </p>
            )}
            <p className="mt-8 text-sm text-muted">
              Pulled from events.vex.com and refreshed daily.
            </p>
          </>
        ) : (
          <>
            {/*
             * The live list is unavailable, so the hand-kept events show
             * instead. Saying nothing here would let an outage read as "no
             * competitions this season", which is the failure that matters.
             */}
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
                      <dt className="eyebrow w-20 shrink-0 pt-0.5 text-[var(--muted)]">Where</dt>
                      <dd className={isTbd(e.location) ? "text-muted" : "text-[var(--ink-body)]"}>{e.location}</dd>
                    </div>
                  </dl>
                </Card>
              ))}
            </div>
            <p
              className="mt-8 rounded-xl px-4 py-3 text-sm"
              style={{ background: "var(--amber-bg)", color: "var(--amber-text)" }}
            >
              {live.reason === "unconfigured"
                ? "The live competition list is not switched on yet, so this shows only the events we keep by hand."
                : "We could not reach events.vex.com just now, so this may be out of date."}{" "}
              The full Alberta calendar is always on{" "}
              <a
                href="https://events.vex.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                events.vex.com
              </a>
              .
            </p>
          </>
        )}
      </Section>

      {/*
       * Signature Events are the invitational-scale events worth travelling
       * for, so this section leads with the two soonest and folds the rest
       * away. The disclosure is a native <details>, which needs no JavaScript
       * and delays nothing: the first two are in the markup either way.
       */}
      {signature.ok && signature.events.length > 0 && (() => {
        const featured = featureBothPrograms(signature.events);
        const rest = remainingAfterFeature(signature.events, featured);
        return (
        <Section
          eyebrow="Worth travelling for"
          title="Signature Events"
          lead="Invitational-scale events run by VEX around the world. These are the ones coming up."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {featured.map((e) => (
              <SignatureCard key={e.id} event={e} />
            ))}
          </div>

          {rest.length > 0 && (
            <details className="group mt-6">
              <summary
                className="inline-flex cursor-pointer list-none items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{ border: "1px solid var(--line)", background: "var(--surface)" }}
              >
                <span className="group-open:hidden">
                  {/* Singular when exactly one is hidden, or it reads "1 more Events". */}
                  Show {rest.length} more Signature{" "}
                  {rest.length === 1 ? "Event" : "Events"}
                </span>
                <span className="hidden group-open:inline">Show fewer</span>
              </summary>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {rest.map((e) => (
                  <SignatureCard key={e.id} event={e} />
                ))}
              </div>
            </details>
          )}
        </Section>
        );
      })()}

      {/*
       * The Inspire Award is judged, not won on the field, so the criteria say
       * more about the club than the trophy does. They are summarised in our
       * own words and linked to the REC Foundation rather than reproduced.
       */}
      <Section
        eyebrow="Recognition"
        title="What our teams have been recognised for"
        lead="Most of these came from teams we mentored rather than teams we ran, which is the part we are proudest of."
      >
        <AwardsShowcase />
      </Section>

      <div className="band-dark">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <p className="eyebrow">Judged award · {inspireAward.event}</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl" style={{ color: "#f3efe8" }}>
            Team {inspireAward.team} won the {inspireAward.name}
          </h2>
          <p className="club-lead mt-5 max-w-2xl" style={{ color: "rgba(243,239,232,0.78)" }}>
            {inspireAward.summary} {inspireAward.meaning}
          </p>

          <p className="eyebrow mt-10" style={{ color: "rgba(243,239,232,0.5)" }}>
            {inspireAward.criteriaLabel}
          </p>
          <ol className="mt-4 grid gap-px overflow-hidden rounded-2xl sm:grid-cols-2" style={{ background: "rgba(243,239,232,0.12)" }}>
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

        {/*
         * Awards are credited to the team that won them, at the event where it
         * happened. A prose list let a team's award read as the club's, which
         * is the one thing a results page must not blur.
         */}
        <h3 className="mt-12 text-lg font-semibold">Finishes</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr>
                {["Team", "Finish", "Event"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="eyebrow border-b py-2.5 pr-6 text-[var(--muted)]"
                    style={{ borderColor: "var(--line)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {placings.map((p) => (
                <tr key={`${p.team}-${p.event}`} className="border-b" style={{ borderColor: "var(--line)" }}>
                  <td className="readout py-3 pr-6 font-semibold">{p.team}</td>
                  <td className="readout py-3 pr-6 text-[var(--ink-body)]">{p.place}</td>
                  <td className="py-3 pr-6 text-muted">{p.event}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mt-12 text-lg font-semibold">Across the club</h3>
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
      </Section>
    </>
  );
}
