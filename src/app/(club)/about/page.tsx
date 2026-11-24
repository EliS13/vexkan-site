import type { Metadata } from "next";
import { org } from "@/content/club/org";
import { people } from "@/content/club/people";
import { Section } from "@/components/club/Section";
import { Card } from "@/components/club/Card";
import { Button } from "@/components/club/Button";
import { PersonCard } from "@/components/club/PersonCard";
import { Slideshow } from "@/components/club/Slideshow";
import { PhotoFrame } from "@/components/club/PhotoFrame";
import { aboutTablePhoto, worldsPhotos, worldsWeekPhotos } from "@/content/club/photos";

export const metadata: Metadata = {
  title: `About, ${org.name}`,
  description: `${org.name} is a nonprofit robotics club founded in ${org.foundedYear} in ${org.city}, teaching VEX robotics to ${org.gradesLabel.toLowerCase()}.`,
};

const VALUES = [
  { title: "Open to everyone" },
  { title: "Hands on the parts" },
  { title: "Write it down" },
  { title: "Compete, and keep going" },
];

export default function AboutPage() {
  return (
    <>
      <Section
        title="How the club started"
        titleAs="h1"
      >
        <Card>
          <p className="eyebrow text-[var(--muted)]">Our mission</p>
          <p className="club-lead mt-3">{org.mission}</p>
        </Card>
      </Section>

      <Section tone="surface" title="How the club actually looks">
        <div className="max-w-3xl">
          <PhotoFrame photo={aboutTablePhoto} sizes="(max-width: 768px) 100vw, 768px" />
        </div>
      </Section>

      <Section title="How we run the club">
        <div className="grid gap-5 sm:grid-cols-2">
          {VALUES.map((v) => (
            <Card key={v.title} className="lift-hover">
              <h3 className="text-base font-semibold">{v.title}</h3>
            </Card>
          ))}
        </div>
      </Section>

      {/*
       * The far end of the same club. These are all from one event, so they do
       * belong together in one frame rather than scattered down the page.
       */}
      <Section
        tone="surface"
        title="At the World Championship"
      >
        <Slideshow photos={worldsPhotos} sizes="(max-width: 1152px) 100vw, 1100px" />
      </Section>

      {/*
       * The same week, told from inside it. The set above is how big the event
       * is; this is what our teams were actually doing there, which is mostly
       * fixing a robot, queueing and eating.
       */}
      <Section
        title="The rest of that week"
      >
        <Slideshow photos={worldsWeekPhotos} sizes="(max-width: 1152px) 100vw, 1100px" />
      </Section>

      {/*
       * One person, so this is a statement rather than a directory. A lone card
       * in a three-column grid reads as a team page with two people missing.
       */}
      <Section title="Student-founded, student-run">
        <div className="max-w-2xl">
          {people.map((p) => (
            <PersonCard key={p.name} person={p} />
          ))}
        </div>
      </Section>

      <Section title="Use what we have written">
        <div className="flex flex-wrap gap-3">
          <Button href="/guide" size="lg">Read the free guides</Button>
          <Button href="/contact" size="lg" variant="secondary">Ask us a question</Button>
        </div>
      </Section>
    </>
  );
}
