import Link from "next/link";
import { org } from "@/content/club/org";
import { achievements } from "@/content/club/events";
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
      <div className="tile-grid border-b" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-[var(--purple-text)]">
              Nonprofit robotics · {org.city}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.1] sm:text-5xl">
              {org.tagline}
            </h1>
            <p className="club-lead mt-5">
              {org.name} is a nonprofit club teaching VEX robotics to students in{" "}
              {org.gradesLabel.toLowerCase()}. We build robots, keep engineering logbooks, and
              compete — from a first snap-together kit right through to the World Championship.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/register" size="lg">Register your child</Button>
              <Button href="/programs" size="lg" variant="secondary">See our programs</Button>
            </div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
            <RobotHero />
          </div>
        </div>
      </div>

      <Section tone="surface" eyebrow="Our mission" title="Robotics, open to everyone">
        <p className="club-lead max-w-3xl">{org.mission}</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          <Card>
            <p className="readout text-3xl font-semibold text-[var(--purple-text)]">
              {org.studentCount}+
            </p>
            <p className="mt-1 text-sm text-muted">students in the club</p>
          </Card>
          <Card>
            <p className="readout text-3xl font-semibold text-[var(--purple-text)]">
              {org.gradesLabel.replace("Grades ", "")}
            </p>
            <p className="mt-1 text-sm text-muted">grades we teach</p>
          </Card>
          <Card>
            <p className="readout text-3xl font-semibold text-[var(--purple-text)]">
              {new Date().getFullYear() - org.foundedYear}
            </p>
            <p className="mt-1 text-sm text-muted">years running, founded {org.foundedYear}</p>
          </Card>
        </div>
      </Section>

      <Section
        eyebrow="Programs"
        title="A path from Grade 1 to the World Championship"
        lead="Foundation classes teach the basics hands-on. Competition teams are chosen from those classes and represent VexKan against other clubs."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {TRACK_ORDER.map((track) => {
            const list = programsByTrack(track);
            return (
              <Card key={track}>
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
            );
          })}
        </div>
      </Section>

      <Section tone="surface" eyebrow="Results" title="Where our teams have been">
        <ul className="grid gap-4 sm:grid-cols-2">
          {achievements.map((a) => (
            <li key={a} className="flex gap-3">
              <span
                className="mt-2 h-2 w-2 shrink-0 rounded-full"
                style={{ background: "var(--purple)" }}
                aria-hidden="true"
              />
              <span className="text-[var(--ink-body)]">{a}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Button href="/events" variant="secondary">Events and results</Button>
        </div>
      </Section>

      <Section eyebrow="Joining" title="How to join">
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
