import Link from "next/link";
import type { Metadata } from "next";
import { org } from "@/content/club/org";
import { TRACK_LABELS, TRACK_ORDER, programsByTrack } from "@/content/club/programs";
import { Section } from "@/components/club/Section";
import { Button } from "@/components/club/Button";
import { Card } from "@/components/club/Card";
import { RobotHero } from "@/components/club/art/RobotHero";
import { Scoreboard } from "@/components/club/Scoreboard";

export const metadata: Metadata = {
  title: `${org.name}`,
  description:
    "A nonprofit robotics club in Calgary. Free VEX guides, calculators and notebook templates, plus classes and competition teams for Grades 1 to 12.",
};

/**
 * What a visitor can take away today, without asking anyone for anything. The
 * field guide is already written, so these are real links rather than promises.
 */
const RESOURCES = [
  {
    href: "/guide/chapters",
    title: "The field guide",
    body: "Seventeen chapters on building, programming and competing, written from the pit rather than from a manual.",
  },
  {
    href: "/guide/tools/gear-ratio",
    title: "Gear ratio calculator",
    body: "Work out speed against torque before you commit to a drivetrain, instead of after.",
  },
  {
    href: "/guide/tools/notebook-template",
    title: "Engineering notebook template",
    body: "The entry structure judges actually look for, with an export you can hand in.",
  },
  {
    href: "/guide/tools/season-planner",
    title: "Season planner",
    body: "Lay a season out across the months you really have, so build does not eat all of it.",
  },
];

export default function HomePage() {
  return (
    <>
      <div className="tile-grid relative overflow-hidden border-b" style={{ borderColor: "var(--line)" }}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 60% at 22% 18%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.35) 45%, rgba(244,242,239,0) 75%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:py-28 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="eyebrow text-[var(--purple-text)]">
              Nonprofit robotics · {org.city}
            </p>
            <h1 className="mt-4 text-[clamp(2.75rem,7vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.035em]">
              {org.tagline}
            </h1>
            <p className="club-lead mt-6 max-w-xl text-[1.2rem]">
              We are a student-run robotics club in Calgary. Everything we have worked out, the
              guides, the calculators, the notebook templates, is free here for any team to use,
              whether you are in our club or not.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/guide" size="lg">Start with the free guides</Button>
              <Button href="/programs" size="lg" variant="secondary">See what we run</Button>
            </div>
          </div>
          <div
            className="lift rounded-3xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <RobotHero />
          </div>
        </div>
      </div>

      {/*
       * First real section on the page, because it is the thing a visitor can
       * use without contacting anyone. Nothing here asks for an email address.
       */}
      <Section
        tone="surface"
        eyebrow="Free, no signup"
        title="Take what you need"
        lead="We write this for our own teams and then leave it open. No account, no email, no form in the way."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {RESOURCES.map((r) => (
            <Link key={r.href} href={r.href} className="group block">
              <Card className="lift-hover h-full">
                <h3 className="text-lg font-semibold group-hover:text-[var(--purple-text)]">
                  {r.title}
                </h3>
                <p className="mt-2 text-sm text-muted">{r.body}</p>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <Button href="/guide" variant="secondary">Browse everything</Button>
        </div>
      </Section>

      <Section
        eyebrow="What we run"
        title="Classes and competition teams"
        lead="Foundation classes teach the basics hands on. Competition teams are picked from those classes and represent the club against other schools."
      >
        <div className="grid gap-5 sm:grid-cols-3">
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

      {/*
       * Low on the page and deliberately compact. The placings are here to say
       * the advice above has been tested, not to be admired.
       */}
      <div className="band-dark">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <p className="eyebrow">Teams from our club</p>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold sm:text-3xl" style={{ color: "#f3efe8" }}>
            How our teams have done at the World Championship
          </h2>
          <div className="mt-8">
            <Scoreboard />
          </div>
          <p className="mt-7">
            <Link href="/events" className="underline underline-offset-4" style={{ color: "var(--purple-on-dark)" }}>
              The full record, and what the Inspire Award takes
            </Link>
          </p>
        </div>
      </div>

      <Section eyebrow="Getting in touch" title="Ask us anything">
        <p className="club-lead max-w-2xl">
          Questions about robotics are welcome even if your child never joins. We are students
          ourselves, so during build season and competition weekends replies can take a while.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href="/contact" size="lg">Contact us</Button>
          <Button href="/register" size="lg" variant="secondary">Join the club</Button>
        </div>
      </Section>
    </>
  );
}
