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
        eyebrow="Free, for any group"
        title="Workshops we run for schools and libraries"
        titleAs="h1"
        lead="We bring the kit, run the session, and leave the guides behind. There is no charge for these, and your group does not need to own a single VEX part."
      >
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="club-lead">
              This is separate from the club. Nobody has to join anything, and no student needs to
              become a clubber afterwards. If a school in {org.city.split(",")[0]} wants an hour of
              robotics for a class that has never seen a robot, that is the whole ask.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
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
                    className="eyebrow shrink-0 rounded-full px-2.5 py-1"
                    style={{ background: "var(--teal-bg)", color: "var(--teal-text)" }}
                  >
                    Free
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted">{w.summary}</p>
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
              Nothing is on the calendar right now. We book these directly with a school, a library
              or a group rather than setting dates in advance, so the way to get one is to ask.
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
                  <p className="mt-3 text-sm text-muted">{w.summary}</p>
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
          <p className="eyebrow">What is actually out there</p>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold sm:text-3xl" style={{ color: "#f3efe8" }}>
            Free whether or not you ever meet us
          </h2>
          <dl className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
                  <span className="mt-1 block text-[13px]" style={{ color: "rgba(243,239,232,0.55)" }}>
                    {stat.note}
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
      <Section eyebrow="If you want more than a workshop" title="The programs we run">
        <p className="club-lead max-w-2xl">
          A workshop is one session. A program is a season — a class or a competition team that
          meets all year. They are different things, and they are priced differently, so here is
          the difference in full:
        </p>

        {/*
         * The free/paid line, drawn once and in plain words rather than left
         * for a family to work out from context. Teal is the colour the free
         * resources use everywhere else on the site, so the side that costs
         * nothing is the side that looks like the guides.
         */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--teal-bg)", border: "1px solid var(--teal)" }}
          >
            <p className="eyebrow text-[var(--teal-text)]">Workshops</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--teal-text)]">Free</p>
            <p className="mt-3 text-sm text-[var(--ink-body)]">
              One session, at your school, library or group. We bring the kit. Nothing to pay and
              nothing to sign up for.
            </p>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <p className="eyebrow text-[var(--muted)]">Classes and competition teams</p>
            <p className="mt-2 text-2xl font-semibold">Member-supported</p>
            <p className="mt-3 text-sm text-[var(--ink-body)]">
              A full season, with parts, field elements and tournament entries behind it, so there
              is a fee. Email{" "}
              <a href={org.emailHref} className="font-semibold underline underline-offset-4">
                {org.email}
              </a>{" "}
              or call{" "}
              <a href={org.phoneHref} className="font-semibold underline underline-offset-4">
                {org.phone}
              </a>{" "}
              for more details.
            </p>
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
        lead="Four fields and a rough date. We will come back to you with what we can actually run and when."
      >
        <WorkshopRequestForm />
      </Section>

      <Section title="Ask us anything">
        <p className="club-lead max-w-2xl">
          Questions about robotics are welcome even if your group never books anything. We are
          students ourselves, so during build season and competition weekends replies can take a
          while.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href="/contact" size="lg">Contact us</Button>
          <Button href={org.guideHref} size="lg" variant="secondary">Read the free guides</Button>
        </div>
      </Section>
    </>
  );
}
