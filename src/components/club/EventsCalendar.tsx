import { events } from "@/content/club/events";
import { isTbd } from "@/content/club/types";
import { Section } from "./Section";
import { Card } from "./Card";
import {
  featureBothPrograms,
  remainingAfterFeature,
  type LiveEvent,
  type LiveEventsResult,
} from "@/lib/vexEvents";

/**
 * The competition calendar, live from VEX.
 *
 * Lifted out of the old results page when that page was folded into the home
 * page. The fetching stays with the page — this only renders what it is given,
 * so nothing here can turn into a second daily round trip.
 */

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

export function EventsCalendar({
  live,
  signature,
}: {
  live: LiveEventsResult;
  signature: LiveEventsResult;
}) {
  const competitions = events.filter((e) => e.kind === "competition");

  return (
    <>
      <Section
        id="calendar"
        title="Competitions in Alberta"
        lead="VEX sets the calendar each season and it changes from year to year. The full list, including events we have not listed here, is on events.vex.com."
      >
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
                VEX lists no upcoming Alberta competitions right now. New events appear here as soon
                as they are published.
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
            tone="surface"
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
    </>
  );
}
