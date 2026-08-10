import type { Metadata } from "next";
import Link from "next/link";
import { org } from "@/content/club/org";
import { TRACK_LABELS, TRACK_ORDER, programsByTrack } from "@/content/club/programs";
import { Section } from "@/components/club/Section";
import { Card } from "@/components/club/Card";

export const metadata: Metadata = {
  title: `Programs, ${org.name}`,
  description:
    "VEX IQ Foundation Classes from Grade 1, and VEX IQ and V5RC competition teams.",
};

export default function ProgramsPage() {
  return (
    <>
      <Section
        eyebrow="Programs"
        title="What we run"
        lead="Foundation classes are where most clubbers start and are open to any student in the grade range. Competition teams are selected from those classes."
        titleAs="h1"
      />
      {TRACK_ORDER.map((track, i) => (
        <Section key={track} tone={i % 2 === 0 ? "surface" : "default"} title={TRACK_LABELS[track]}>
          <div className="grid gap-5 sm:grid-cols-2">
            {programsByTrack(track).map((p) => (
              <Card key={p.slug} className="lift-hover h-full">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <span
                    className="eyebrow shrink-0 rounded-full px-2.5 py-1"
                    style={{ background: "var(--purple-bg)", color: "var(--purple-text)" }}
                  >
                    {p.gradeLabel}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted">{p.summary}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/programs/${p.slug}`}
                    className="text-sm font-semibold text-[var(--purple-text)] hover:underline"
                  >
                    Details
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}
