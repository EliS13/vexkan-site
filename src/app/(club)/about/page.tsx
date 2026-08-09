import type { Metadata } from "next";
import { org } from "@/content/club/org";
import { people } from "@/content/club/people";
import { achievements, teams } from "@/content/club/events";
import { Section } from "@/components/club/Section";
import { Card } from "@/components/club/Card";
import { Button } from "@/components/club/Button";
import { PersonCard } from "@/components/club/PersonCard";

export const metadata: Metadata = {
  title: `About — ${org.name}`,
  description: `${org.name} is a nonprofit robotics club founded in ${org.foundedYear} in ${org.city}, teaching VEX robotics to ${org.gradesLabel.toLowerCase()}.`,
};

const VALUES = [
  { title: "Open to everyone", body: "Support and mentorship are free. Cost should never be why a child misses out on robotics." },
  { title: "Hands on the parts", body: "Clubbers build, program and test the robot themselves. We coach; we don't build it for them." },
  { title: "Write it down", body: "Every team keeps an Engineering Logbook, because explaining a decision is as much of the work as making it." },
  { title: "Compete, and keep going", body: "Losing a match is a design brief. Teams iterate through a season rather than starting over." },
];

export default function AboutPage() {
  return (
    <>
      <Section
        eyebrow="About us"
        title={`A robotics club that started at a kitchen table`}
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

      <Section eyebrow="Who we are" title="The people running VexKan">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <PersonCard key={p.name} person={p} />
          ))}
        </div>
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

      <Section eyebrow="Next step" title="Come and build with us">
        <div className="flex flex-wrap gap-3">
          <Button href="/register" size="lg">Register your child</Button>
          <Button href="/contact" size="lg" variant="secondary">Ask us a question</Button>
        </div>
      </Section>
    </>
  );
}
