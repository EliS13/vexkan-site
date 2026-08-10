import type { Metadata } from "next";
import { org } from "@/content/club/org";
import { people } from "@/content/club/people";
import { achievements, teams } from "@/content/club/events";
import { Section } from "@/components/club/Section";
import { Card } from "@/components/club/Card";
import { Button } from "@/components/club/Button";
import { PersonCard } from "@/components/club/PersonCard";

export const metadata: Metadata = {
  title: `About, ${org.name}`,
  description: `${org.name} is a nonprofit robotics club founded in ${org.foundedYear} in ${org.city}, teaching VEX robotics to ${org.gradesLabel.toLowerCase()}.`,
};

const VALUES = [
  { title: "Open to everyone", body: "What we work out gets written down and left open, so a team we have never met can use it." },
  { title: "Hands on the parts", body: "Clubbers build, program and test the robot themselves. We coach; we don't build it for them." },
  { title: "Write it down", body: "Every team keeps an Engineering Logbook, because explaining a decision is as much of the work as making it." },
  { title: "Compete, and keep going", body: "Losing a match is a design brief. Teams iterate through a season rather than starting over." },
];

export default function AboutPage() {
  return (
    <>
      <Section
        eyebrow="About us"
        title="A robotics club that started at home"
        titleAs="h1"
        lead={`${org.name} was founded in ${org.foundedYear} by ${org.foundedBy} and a group of enthusiasts, after he started experimenting with robotics at home. It has grown to around ${org.studentCount} students across ${org.gradesLabel.toLowerCase()}.`}
      >
        <Card>
          <p className="eyebrow text-[var(--muted)]">Our mission</p>
          <p className="club-lead mt-3">{org.mission}</p>
        </Card>
      </Section>

      <Section tone="surface" eyebrow="What we value" title="How we run the club">
        <div className="grid gap-5 sm:grid-cols-2">
          {VALUES.map((v) => (
            <Card key={v.title}>
              <h3 className="text-base font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted">{v.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/*
       * One person, so this is a statement rather than a directory. A lone card
       * in a three-column grid reads as a team page with two people missing.
       */}
      <Section eyebrow="Who runs it" title="Student-founded, student-run">
        <div className="max-w-2xl">
          {people.map((p) => (
            <PersonCard key={p.name} person={p} />
          ))}
        </div>
        <p className="club-lead mt-6 max-w-2xl">
          VexKan is coached and organised by students who compete themselves, which is why the
          club teaches the way it does: everything here was learned at a competition first.
        </p>
      </Section>

      <Section tone="surface" eyebrow="Our teams" title="Competing as VexKan">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {teams.map((t) => (
            <Card key={t.number}>
              <div className="flex items-center justify-between gap-2">
                <span className="readout text-xl font-semibold">{t.number}</span>
                <span
                  className="eyebrow rounded-full px-2.5 py-1"
                  style={
                    t.status === "active"
                      ? { background: "var(--teal-bg)", color: "var(--teal-text)" }
                      : { background: "var(--neutral-bg)", color: "var(--neutral-text)" }
                  }
                >
                  {t.status === "active" ? "Active" : "Past"}
                </span>
              </div>
              <p className="eyebrow mt-2 text-[var(--muted)]">{t.program}</p>
              <p className="mt-3 text-sm text-[var(--ink-body)]">{t.note}</p>
            </Card>
          ))}
        </div>

        <h3 className="mt-12 text-lg font-semibold">What we&apos;ve won</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {achievements.map((a) => (
            <li key={a} className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--purple)" }} aria-hidden="true" />
              <span className="text-[var(--ink-body)]">{a}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Next step" title="Use what we have written">
        <p className="club-lead max-w-2xl">
          The guides, calculators and notebook templates are open to any team, in our club or
          not. That is the part of this we are most glad to hand over.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href="/guide" size="lg">Read the free guides</Button>
          <Button href="/contact" size="lg" variant="secondary">Ask us a question</Button>
        </div>
      </Section>
    </>
  );
}
