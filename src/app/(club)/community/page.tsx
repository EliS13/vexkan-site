import type { Metadata } from "next";
import Link from "next/link";
import { org } from "@/content/club/org";
import { impact, pastWorkshops, upcomingWorkshops } from "@/content/club/community";
import { TRACK_LABELS, TRACK_ORDER, programsByTrack } from "@/content/club/programs";
import { Section } from "@/components/club/Section";
import { Card } from "@/components/club/Card";
import { Button } from "@/components/club/Button";
import { PhotoFrame } from "@/components/club/PhotoFrame";
import { communityPhoto } from "@/content/club/photos";
import { WorkshopRequestForm } from "@/components/club/WorkshopRequestForm";

export const metadata: Metadata = {
  title: `Community workshops, ${org.name}`,
  description:
    "Free robotics workshops for schools, libraries and community groups in Calgary. Request one for your group, or take the free guides and run your own.",
};

export default function CommunityPage() {
  return (
    <>
      <Section
        title="Workshops we run for schools and libraries"
        titleAs="h1"
      >
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="flex flex-wrap gap-3">
              <Button href="#request" size="lg">Request a workshop</Button>
              <Button href={org.guideHref} size="lg" variant="secondary">
                Take the guides instead
              </Button>
            </div>
          </div>
          <PhotoFrame photo={communityPhoto} sizes="(max-width: 1024px) 100vw, 45vw" priority />
        </div>
      </Section>

      <Section tone="surface" title="Upcoming workshops">
        {upcomingWorkshops.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {upcomingWorkshops.map((w) => (
              <Card key={w.slug} className="lift-hover h-full">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold">{w.title}</h3>
                  {/*
                   * The only "free" badge on the club site. It is allowed here
                   * because the type will not let a workshop into this list
                   * without it, and nothing in this list costs money.
                   */}
                  <span
                    className="eyebrow shrink-0 rounded-lg px-2.5 py-1"
                    style={{ background: "var(--teal-bg)", color: "var(--teal-text)" }}
                  >
                    Free
                  </span>
                </div>
                <dl className="mt-5 space-y-2 text-sm">
                  <div className="flex gap-3">
                    <dt className="eyebrow w-20 shrink-0 pt-0.5 text-[var(--muted)]">Date</dt>
                    <dd className="text-[var(--ink-body)]">{w.date}</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="eyebrow w-20 shrink-0 pt-0.5 text-[var(--muted)]">Where</dt>
                    <dd className="text-[var(--ink-body)]">{w.location}</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="eyebrow w-20 shrink-0 pt-0.5 text-[var(--muted)]">Grades</dt>
                    <dd className="text-[var(--ink-body)]">{w.grades}</dd>
                  </div>
                </dl>
                {w.signupHref && (
                  <Link
                    href={w.signupHref}
                    className="mt-5 inline-block text-sm font-semibold text-[var(--purple-text)] hover:underline"
                  >
                    Sign up
                  </Link>
                )}
              </Card>
            ))}
          </div>
        ) : (
          /*
           * The club books these with a school rather than scheduling them in
           * advance, so an empty list is the normal state and has to read that
           * way. "None scheduled" would sound like the programme had stopped.
           */
          <Card>
            <p className="club-lead">
              Nothing is on the calendar right now.
            </p>
            <div className="mt-6">
              <Button href="#request">Request a workshop</Button>
            </div>
          </Card>
        )}
      </Section>

      {pastWorkshops.length > 0 && (
        <Section title="Where we have been">
          <ul className="grid gap-5 sm:grid-cols-2">
            {pastWorkshops.map((w) => (
              <li key={w.slug}>
                <Card className="h-full">
                  <h3 className="text-lg font-semibold">{w.title}</h3>
                  <p className="eyebrow mt-1 text-[var(--muted)]">{w.when}</p>
                  {w.reached !== undefined && (
                    <p className="readout mt-4 text-sm text-[var(--purple-text)]">
                      {w.reached} students
                    </p>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/*
       * Numbers, no adjectives, and every one of them counted from something
       * on this site rather than estimated. Outreach headcounts are absent
       * because nobody wrote them down; see content/club/TODO.md.
       */}
      <div className="band-dark">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <h2 className="max-w-2xl text-2xl font-semibold sm:text-3xl" style={{ color: "#f3efe8" }}>
            Free whether or not you ever meet us
          </h2>
          <dl className="mt-10 grid gap-8 sm:grid-cols-3">
            {impact.map((stat) => (
              /*
               * Column-reverse so the number reads first but the markup stays
               * in dt-then-dd order. A visually-hidden duplicate label would
               * make a screen reader say every one of these twice.
               */
              <div key={stat.label} className="flex flex-col-reverse">
                <dt>
                  <span className="mt-3 block text-[15px]" style={{ color: "rgba(243,239,232,0.88)" }}>
                    {stat.label}
                  </span>
                </dt>
                <dd
                  className="score text-4xl font-semibold sm:text-5xl"
                  style={{ color: "var(--purple-on-dark)" }}
                >
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/*
       * The programs, on the page whose whole subject is the free side of the
       * club. That is a line worth being careful with: everything above this
       * costs a family nothing, and these do. So the heading says so, the lead
       * says so, and each card sends the reader to the page where the cost is
       * written down rather than implying a workshop and a season are the same
       * offer.
       */}
      <Section title="The programs we run">
        {/*
         * The free/paid line, drawn once and in plain words rather than left
         * for a family to work out from context. Teal is the colour the free
         * resources use everywhere else on the site, so the side that costs
         * nothing is the side that looks like the guides.
         */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div
            className="rounded-xl p-6"
            style={{ background: "var(--teal-bg)", border: "1px solid var(--teal)" }}
          >
            <p className="eyebrow text-[var(--teal-text)]">Workshops</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--teal-text)]">Free</p>
          </div>

          <div
            className="rounded-xl p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <p className="eyebrow text-[var(--muted)]">Classes and competition teams</p>
            <p className="mt-2 text-2xl font-semibold">Member-supported</p>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {TRACK_ORDER.map((track) => (
            <Card key={track} className="lift-hover h-full">
              <h3 className="text-lg font-semibold">{TRACK_LABELS[track]}</h3>
              <ul className="mt-4 space-y-2">
                {programsByTrack(track).map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/programs/${p.slug}`}
                      className="flex items-baseline justify-between gap-3 text-sm text-[var(--ink-body)] hover:underline"
                    >
                      <span>{p.shortTitle}</span>
                      <span className="eyebrow shrink-0 text-[var(--muted)]">{p.gradeLabel}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        id="request"
        tone="surface"
        title="Request a workshop for your school or library"
      >
        <WorkshopRequestForm />
      </Section>

      <Section title="Ask us anything">
        <div className="flex flex-wrap gap-3">
          <Button href="/contact" size="lg">Contact us</Button>
          <Button href={org.guideHref} size="lg" variant="secondary">Read the free guides</Button>
        </div>
      </Section>
    </>
  );
}
