import Link from "next/link";
import { org } from "@/content/club/org";
import { inspireAward } from "@/content/club/events";
import { Reveal } from "@/components/club/Reveal";
import { Scoreboard } from "@/components/club/Scoreboard";
import { TRACK_LABELS, TRACK_ORDER, programsByTrack } from "@/content/club/programs";
import { Section } from "@/components/club/Section";
import { Button } from "@/components/club/Button";
import { Card } from "@/components/club/Card";
import { RobotHero } from "@/components/club/art/RobotHero";

const STEPS = [
  {
    n: "1",
    title: "Pick a program",
    body: "Foundation classes start from Grade 1. Competition teams are selected from those classes.",
  },
  {
    n: "2",
    title: "Send us a registration",
    body: "One short form with your child's grade and how to reach you. It takes about a minute.",
  },
  {
    n: "3",
    title: "We get in touch",
    body: "We confirm the current schedule, answer your questions, and get your child started.",
  },
];

export default function HomePage() {
  return (
    <>
      <div className="tile-grid relative overflow-hidden border-b" style={{ borderColor: "var(--line)" }}>
        {/*
         * A soft light over the field, brightest where the headline sits. It
         * gives the tile grid somewhere to fall away to, so the hero reads as a
         * lit surface rather than as graph paper.
         */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 60% at 22% 18%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.35) 45%, rgba(244,242,239,0) 75%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:py-28 lg:grid-cols-[1.05fr_1fr]">
          <div className="rise">
            <p className="eyebrow text-[var(--purple-text)]">
              Nonprofit robotics · {org.city}
            </p>
            <h1 className="mt-4 text-[clamp(2.75rem,7vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.035em]">
              {org.tagline}
            </h1>
            <p className="club-lead mt-6 max-w-xl text-[1.2rem]">
              At {org.shortName}, we believe robotics is a universal language that sparks
              innovation and builds important skills.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/register" size="lg">Register your child</Button>
              <Button href="/programs" size="lg" variant="secondary">See our programs</Button>
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
       * The proudest facts the club has, given the highest contrast on the
       * page. Placings are the one thing a competitive robotics club is
       * measured by, so they get the dark band rather than a card in a row.
       */}
      <div className="band-dark">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <Reveal>
            <p className="eyebrow">At the World Championship</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl" style={{ color: "#f3efe8" }}>
              Three VexKan teams, three finishes
            </h2>
          </Reveal>
          <Reveal delay={90} className="mt-10">
            <Scoreboard />
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 max-w-2xl text-[15px]" style={{ color: "rgba(243,239,232,0.7)" }}>
              {inspireAward.summary} It goes to how a team carries itself across the whole
              event, not to the robot.{" "}
              <Link href="/events" className="underline underline-offset-4" style={{ color: "var(--purple-on-dark)" }}>
                See what it takes to win it
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </div>

      <Section tone="surface" eyebrow="Our mission" title="Robotics, open to everyone">
        <p className="club-lead max-w-3xl">{org.mission}</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {/*
           * Figures the club can stand behind without a rebuild. An earlier
           * version computed "years running" from the current date, which meant
           * the number silently went stale between deploys.
           */}
          {[
            { value: `${org.studentCount}`, label: "students in the club" },
            { value: org.gradesShort, label: "the grades we teach" },
            { value: `${org.foundedYear}`, label: "founded, and run by students since" },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <Card className="lift lift-hover h-full">
                <p className="score text-5xl font-semibold text-[var(--purple-text)]">
                  {stat.value}
                </p>
                <p className="mt-3 text-sm text-muted">{stat.label}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Programs"
        title="A path from Grade 1 to the World Championship"
        lead="Foundation classes teach the basics hands-on. Competition teams are chosen from those classes and represent VexKan against other clubs."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {TRACK_ORDER.map((track, i) => {
            const list = programsByTrack(track);
            return (
              <Reveal key={track} delay={i * 80} className="h-full">
                <Card className="lift lift-hover h-full">
                <h3 className="text-lg font-semibold">{TRACK_LABELS[track]}</h3>
                <ul className="mt-4 space-y-2">
                  {list.map((p) => (
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
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section tone="surface" eyebrow="Joining" title="How to join">
        <ol className="grid gap-5 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n}>
              <Card>
                <span
                  className="readout flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ background: "var(--purple)" }}
                >
                  {s.n}
                </span>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.body}</p>
              </Card>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <Button href="/register" size="lg">Register your child</Button>
        </div>
      </Section>
    </>
  );
}
