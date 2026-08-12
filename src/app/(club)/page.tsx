import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { org } from "@/content/club/org";
import { TRACK_LABELS, TRACK_ORDER, programsByTrack } from "@/content/club/programs";
import { Section } from "@/components/club/Section";
import { Button } from "@/components/club/Button";
import { Card } from "@/components/club/Card";
import { Scoreboard } from "@/components/club/Scoreboard";
import { Slideshow } from "@/components/club/Slideshow";
import { PhotoBand } from "@/components/club/PhotoBand";
import { PhotoFrame } from "@/components/club/PhotoFrame";
import {
  awardPhotos,
  certificatePhotos,
  clubSpacePhotos,
  competePhoto,
  competePhotos,
  competitionDayPhotos,
  designAwardPhoto,
  eventFloorPhotos,
  homeBandPhoto,
  homeClassPhotos,
  homeHeroPhotos,
  homeWorldsPhotos,
  pitPhoto,
  practicePhotos,
} from "@/content/club/photos";
import { inspireAward } from "@/content/club/events";
import { AwardsCount, AwardsJourney } from "@/components/club/AwardsJourney";
import {
  CompetitionLadder,
  ProgramComparison,
  SpectatingNote,
} from "@/components/club/CompetitionLadder";
import { readyChapters } from "@/content/chapters";
import { EventsCalendar } from "@/components/club/EventsCalendar";
import { fetchAlbertaEvents, fetchSignatureEvents } from "@/lib/vexEvents";

export const metadata: Metadata = {
  title: `${org.name}`,
  description:
    "A nonprofit robotics club in Calgary. Free VEX guides, calculators and notebook templates, plus classes and competition teams for Grades 1 to 12.",
};

/*
 * The competition calendar is fetched here now that there is no separate
 * results page. Refetched once a day: calendars move over weeks, not minutes.
 */
export const revalidate = 86400;

/**
 * What a visitor can take away today, without asking anyone for anything. The
 * field guide is already written, so these are real links rather than promises.
 */
const RESOURCES = [
  {
    href: "/guide/chapters",
    title: "The field guide",
    /*
     * Counted rather than written out, so it cannot drift from the guide. Only
     * the chapters that are actually readable — the array holds outlines too.
     */
    body: `${readyChapters().length} chapters on building, programming and competing, written from the pit rather than from a manual.`,
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

export default async function HomePage() {
  /* One round trip a day between them, not one per visitor. */
  const [live, signature] = await Promise.all([fetchAlbertaEvents(), fetchSignatureEvents()]);

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
              <Button href="#what-we-run" size="lg" variant="secondary">See what we run</Button>
            </div>
          </div>
          {/*
           * Five, not the whole archive. A carousel only ever shows a visitor
           * its first slide or two, so the rest of the photographs are placed
           * down the page and across the site instead of stacked in here.
           */}
          <Slideshow photos={homeHeroPhotos} priority />
        </div>
      </div>

      {/*
       * First real section on the page, because it is the thing a visitor can
       * use without contacting anyone. Nothing here asks for an email address.
       */}
      <Section
        tone="surface"
        eyebrow="Free, no signup"
        title="Need some help?"
        lead="We write all of this for our own teams, and then leave it open for anyone. No account, no email, no form in the way."
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
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Button href="/guide" variant="secondary">Browse everything</Button>
          {/*
           * The other free thing, and the only one that involves us turning up
           * in person. It belongs beside the guides rather than beside the
           * programs, because neither costs a family anything.
           */}
          <Link
            href="/community"
            className="text-sm font-semibold text-[var(--purple-text)] underline underline-offset-4"
          >
            Or have us run a free workshop for your school
          </Link>
        </div>
      </Section>

      <PhotoBand photo={homeBandPhoto} />

      <Section
        id="what-we-run"
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

        {/* The same three tracks again, as photographs rather than lists. */}
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {homeClassPhotos.map((photo) => (
            <PhotoFrame key={photo.src} photo={photo} sizes="(max-width: 640px) 100vw, 33vw" />
          ))}
        </div>

        <p className="mt-8 text-sm text-muted">
          Each program page says what a student actually does, and what it costs, before anything
          asks for a name.
        </p>
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

          {/*
           * Photographs from those events, unframed: a light card border would
           * cut three holes in the dark band.
           */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {homeWorldsPhotos.map((photo) => (
              <div key={photo.src} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/*
           * The Inspire Award, in the same band rather than a second one below
           * it. It was won at this event, by one of the teams in the scoreboard
           * above, so a seam between them would be inventing a separation that
           * is not there. It is judged rather than won on the field, which is
           * why the criteria say more about the club than the trophy does —
           * summarised in our own words and linked to the REC Foundation
           * rather than reproduced.
           */}
          <hr
            className="mt-16 border-0"
            style={{ borderTop: "1px solid rgba(243,239,232,0.14)" }}
          />

          <p className="eyebrow mt-16">Judged award · {inspireAward.event}</p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl" style={{ color: "#f3efe8" }}>
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

      {/*
       * Default tone, not surface: the count sits in a surface-coloured box and
       * would disappear into a surface-coloured band behind it.
       */}
      <Section id="teams" title="Meet the teams">
        {/*
         * No standing paragraph here. The count says the size of it, the line
         * under it hands over, and the track itself — oldest team first — makes
         * the point about handing over better than a sentence describing it.
         */}
        <div className="mb-12">
          <AwardsCount />
        </div>
        <AwardsJourney />

        {/*
         * The one place on the site where photographs carry captions: an award
         * photograph cannot say which award it was.
         */}
        <div className="mt-12">
          <Slideshow
            photos={[...awardPhotos, designAwardPhoto, ...certificatePhotos]}
            sizes="(max-width: 1152px) 100vw, 1100px"
          />
        </div>
      </Section>

      {/*
       * The ladder, which almost no parent has seen written down. It sits after
       * the results rather than before them, so it reads as an explanation of
       * where those results came from rather than as a boast about reaching the
       * top of it.
       */}
      <Section
        id="where-we-compete"
        tone="surface"
        title="Where we compete"
        lead="Qualifying tournaments across Alberta, then the provincial championship, then the World Championship. Qualification rules shift a little each season and differ by program, so each step says what usually earns the next rather than promising it."
      >
        <CompetitionLadder />

        <h3 className="mt-14 text-xl font-semibold">Which one is my child in?</h3>
        <p className="club-lead mt-3 max-w-2xl">
          Two separate competitions, with different kit and different matches. The grades overlap in
          middle school, where a student could be in either.
        </p>
        <div className="mt-7">
          <ProgramComparison />
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_1fr]">
          <SpectatingNote />
          <PhotoFrame photo={competePhoto} sizes="(max-width: 1024px) 100vw, 45vw" />
        </div>

        {/*
         * A competition weekend, at the size it actually happens. Nine
         * photographs with nothing to say about any one of them individually,
         * so they run as a slideshow rather than a wall of thumbnails — one at
         * a time and large enough to actually read.
         */}
        <h3 className="mt-14 text-xl font-semibold">A competition weekend</h3>
        <p className="club-lead mt-3 max-w-2xl">
          Mostly this, at a school or a convention centre in Calgary: the pit, the queue for the
          field, and a few hundred students from other clubs doing exactly the same thing.
        </p>
        <div className="mt-8">
          <Slideshow photos={competePhotos} sizes="(max-width: 1152px) 100vw, 1100px" />
        </div>
      </Section>

      {/* The live calendar, pulled from VEX rather than kept by hand. */}
      <EventsCalendar live={live} signature={signature} />

      {/*
       * Two photographs that each illustrate a specific paragraph, so they are
       * paired with their text and alternate sides rather than being stacked
       * into a slideshow. A carousel here would separate a picture from the
       * sentence that explains it.
       *
       * `lg:order-first` on the second row is what does the alternating: the
       * markup keeps text before image so the reading order is right on a
       * phone, and only the wide layout swaps them.
       */}
      <Section title="What competing looks like">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="club-lead">
              Most of a competition happens away from the field: fixing what broke in the last
              match, talking through a strategy with an alliance partner, and explaining a design
              choice to a judge.
            </p>
            <p className="club-lead mt-5">
              That last one decides the judged awards: a team, its notebook, and two judges asking
              how the robot got that way.
            </p>
          </div>
          <PhotoFrame photo={pitPhoto} sizes="(max-width: 1024px) 100vw, 45vw" />
        </div>

        {/*
         * The day itself, in the order it happens: inspection, the wait at the
         * barrier, then the match. Captioned, because none of these photographs
         * can say which part of the day it is.
         */}
        <h3 className="mt-16 text-xl font-semibold">A competition day, in order</h3>
        <p className="club-lead mt-3 max-w-2xl">
          Inspection first, because a robot that fails it does not play. Then a long wait at the
          barrier, and about a minute of the thing you came for.
        </p>
        <div className="mt-8">
          <Slideshow
            photos={[...competitionDayPhotos, ...eventFloorPhotos]}
            sizes="(max-width: 1152px) 100vw, 1100px"
          />
        </div>

        {/*
         * And the other 95% of a season. Three photographs with nothing to say
         * about any one of them, so: slideshow.
         */}
        <h3 className="mt-16 text-xl font-semibold">And the rest of the season</h3>
        <p className="club-lead mt-3 max-w-2xl">
          A competition is two days. The other few hundred hours are a field on the floor, a robot
          half apart, and the same mechanism tried again.
        </p>
        <div className="mt-8">
          <Slideshow
            photos={[...practicePhotos, ...clubSpacePhotos]}
            sizes="(max-width: 1152px) 100vw, 1100px"
          />
        </div>
      </Section>

      <Section tone="surface" title="Ask us anything">
        <p className="club-lead max-w-2xl">
          Questions about robotics are welcome even if your child never joins. We are students
          ourselves, so during build season and competition weekends replies can take a while.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href="/contact" size="lg">Contact us</Button>
          <Button href="/community" size="lg" variant="secondary">Free workshops</Button>
        </div>
      </Section>
    </>
  );
}
