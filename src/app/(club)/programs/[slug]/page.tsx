import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProgram, programSlugs, programsByTrack, TRACK_LABELS } from "@/content/club/programs";
import { org } from "@/content/club/org";
import { Section } from "@/components/club/Section";
import { Card } from "@/components/club/Card";
import { Button } from "@/components/club/Button";
import { DetailRow } from "@/components/club/DetailRow";

export function generateStaticParams() {
  return programSlugs().map((slug) => ({ slug }));
}

// All valid slugs are known at build time via generateStaticParams above.
// Without this, a slug that isn't one of the eight still gets routed here
// and notFound() has to fall back to Next's bare __next_error__ shell
// (correct 404 status, but no club chrome and no heading without JS). With
// dynamicParams disabled, an unknown slug never reaches this component at
// all — Next serves the route group's real not-found page instead.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) return {};
  return {
    title: `${program.title} (${program.gradeLabel}) — ${org.name}`,
    description: program.summary,
  };
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();

  const siblings = programsByTrack(program.track).filter((p) => p.slug !== program.slug);

  return (
    <>
      <div className="border-b" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <p className="eyebrow text-[var(--muted)]">
            <Link href="/programs" className="hover:underline">Programs</Link>
            {" · "}
            {TRACK_LABELS[program.track]}
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{program.title}</h1>
          <p className="club-lead mt-4 max-w-2xl">{program.summary}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href={`/register?program=${program.slug}`} size="lg">
              Register for this program
            </Button>
            <Button href="/contact" size="lg" variant="secondary">Ask a question</Button>
          </div>
        </div>
      </div>

      <Section tone="surface" title="About this program">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div>
            <p className="club-lead">{program.description}</p>

            <h3 className="mt-10 text-lg font-semibold">What clubbers learn</h3>
            <ul className="mt-4 space-y-3">
              {program.learn.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--purple)" }} aria-hidden="true" />
                  <span className="text-[var(--ink-body)]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Card>
              <h3 className="text-base font-semibold">At a glance</h3>
              <dl className="mt-3">
                <DetailRow label="Grades" value={program.gradeLabel} />
                <DetailRow label="Schedule" value={program.schedule} />
                <DetailRow label="Fees" value={program.fee} />
                {program.prerequisites && (
                  <DetailRow label="Entry" value={program.prerequisites} />
                )}
                <DetailRow label="Location" value={org.address} />
              </dl>
            </Card>
          </div>
        </div>
      </Section>

      {siblings.length > 0 && (
        <Section title={`Other ${TRACK_LABELS[program.track]}`}>
          <div className="grid gap-5 sm:grid-cols-3">
            {siblings.map((p) => (
              <Card key={p.slug}>
                <h3 className="text-base font-semibold">{p.shortTitle}</h3>
                <p className="eyebrow mt-1 text-[var(--muted)]">{p.gradeLabel}</p>
                <Link
                  href={`/programs/${p.slug}`}
                  className="mt-4 inline-block text-sm font-semibold text-[var(--purple-text)] hover:underline"
                >
                  Details
                </Link>
              </Card>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
