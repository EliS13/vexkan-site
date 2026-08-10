import type { Metadata } from "next";
import { org } from "@/content/club/org";
import { events, inspireAward, teams } from "@/content/club/events";
import { isTbd } from "@/content/club/types";
import { Section } from "@/components/club/Section";
import { Card } from "@/components/club/Card";
import { Slideshow } from "@/components/club/Slideshow";
import { eventPhotos } from "@/content/club/photos";
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
    <Card className="lift-hover h-full">
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
        <div className="mt-10">
          <Slideshow photos={eventPhotos} />
        </div>
      </Section>

      <Section tone="surface" title="Competitions in Alberta">
        {live.ok ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              {live.events.map((e) => (
                <Card key={e.id} className="lift-hover h-full">
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
                <Card key={e.slug} className="lift-hover h-full">
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

      <Section tone="surface" eyebrow="At the event" title="What competing looks like">
        <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="club-lead">
              Most of a competition happens away from the field: fixing what broke in the last
              match, talking through a strategy with an alliance partner, and explaining a design
              choice to a judge.
            </p>
            <p className="club-lead mt-4">
              These are our own teams at the Mecha Mayhem Signature Event in Calgary.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="surface" title="Our teams">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {teams.map((t) => (
            <Card key={t.number} className="lift-hover h-full">
              <span className="readout text-xl font-semibold">{t.number}</span>
              <p className="mt-1 text-sm font-medium text-[var(--ink-body)]">{t.name}</p>
              <p className="eyebrow mt-2 text-[var(--muted)]">
                {t.program} · {t.grade}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h3 className="text-lg font-semibold">The rest of the community</h3>
            <p className="club-lead mt-3">
              Competitions are where our teams meet everyone else doing this. Some of the most
              useful things we know came from another club being generous with what they had
              worked out.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
