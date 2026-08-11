import type { Metadata } from "next";
import { org } from "@/content/club/org";
import { TRACK_LABELS, TRACK_ORDER, programsByTrack } from "@/content/club/programs";
import { Section } from "@/components/club/Section";
import { PhotoFrame } from "@/components/club/PhotoFrame";
import { ProgramCard } from "@/components/club/ProgramCard";
import { Slideshow } from "@/components/club/Slideshow";
import { programPhotos, programsHeroPhoto, workshopPhotos } from "@/content/club/photos";

export const metadata: Metadata = {
  title: `Programs, ${org.name}`,
  description:
    "VEX IQ Foundation Classes from Grade 3, and VEX IQ and V5RC competition teams.",
};

export default function ProgramsPage() {
  return (
    <>
      <Section
        eyebrow="Programs"
        title="What we run"
        lead="Foundation classes are where most clubbers start and are open to any student in the grade range. Competition teams are selected from those classes."
        titleAs="h1"
      >
        {/* One photograph of a class in session, before the descriptions of them. */}
        <PhotoFrame
          photo={programsHeroPhoto}
          ratio="wide"
          sizes="(max-width: 1152px) 100vw, 1100px"
          priority
        />
      </Section>

      {/* Every program carries its own photograph, on its card and on its page. */}
      {TRACK_ORDER.map((track, i) => (
        <Section key={track} tone={i % 2 === 0 ? "surface" : "default"} title={TRACK_LABELS[track]}>
          <div className="grid gap-5 sm:grid-cols-2">
            {programsByTrack(track).map((p) => (
              <ProgramCard key={p.slug} program={p} photo={programPhotos[p.slug]} />
            ))}
          </div>
        </Section>
      ))}

      {/*
       * Building is most of what a clubber actually does, and it is the part a
       * parent never sees, so it gets a run of photographs of its own rather
       * than one picture at the top of the page.
       */}
      <Section
        eyebrow="Before any of that"
        title="Most of it is building"
        lead="Sorting parts, fitting beams, taking it apart again."
      >
        <Slideshow photos={workshopPhotos} sizes="(max-width: 1152px) 100vw, 1100px" />
      </Section>
    </>
  );
}
