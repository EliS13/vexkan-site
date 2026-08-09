import Link from "next/link";
import { notFound } from "next/navigation";
import { chapters, getChapter, getAdjacentChapters, partLabels } from "@/content/chapters";
import { ChapterBody } from "@/components/ChapterBody";
import { ChapterSidebar } from "@/components/ChapterSidebar";
import { getTool } from "@/content/tools";

export function generateStaticParams() {
  return chapters.filter((c) => c.status === "ready").map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) return {};
  return { title: `${chapter.title} — Built From the Ground Up` };
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  const { prev, next } = getAdjacentChapters(chapter.number);

  if (chapter.status !== "ready") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <p className="eyebrow text-[var(--muted)]">
          {partLabels[chapter.part]} · Chapter {chapter.number}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">{chapter.title}</h1>
        <span
          className="mt-4 inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
          style={{ background: "var(--neutral-bg)", color: "var(--neutral-text)" }}
        >
          Coming soon
        </span>
        <p className="mt-4 text-muted">
          This chapter hasn&apos;t been drafted yet, so there&apos;s nothing to show here. Check back
          once the manuscript catches up, or browse what&apos;s already written.
        </p>
        <Link
          href="/guide/chapters"
          className="mt-6 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--purple)" }}
        >
          Back to table of contents
        </Link>
      </div>
    );
  }
  const relatedTools = (chapter.tools ?? []).map(getTool).filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <ChapterSidebar activeSlug={chapter.slug} />
          </div>
        </aside>

        <article className="min-w-0">
          <p className="eyebrow text-[var(--muted)]">
            {partLabels[chapter.part]} · Chapter {chapter.number}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            {chapter.title}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted">{chapter.dek}</p>

          <div className="mt-8 max-w-2xl">
            <ChapterBody blocks={chapter.blocks} />
          </div>

          {relatedTools.length > 0 && (
            <div className="mt-10 max-w-2xl rounded-xl border p-5" style={{ borderColor: "var(--line)" }}>
              <p className="eyebrow text-[var(--muted)]">
                Try it yourself
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {relatedTools.map((t) => (
                  <Link
                    key={t!.id}
                    href={t!.href}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: "var(--teal)" }}
                  >
                    {t!.title} →
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 flex items-center justify-between border-t pt-6" style={{ borderColor: "var(--line)" }}>
            {prev && prev.status === "ready" ? (
              <Link href={`/guide/chapters/${prev.slug}`} className="text-sm font-medium text-muted hover:text-foreground">
                ← Ch {prev.number}: {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next && next.status === "ready" ? (
              <Link href={`/guide/chapters/${next.slug}`} className="text-sm font-medium text-muted hover:text-foreground">
                Ch {next.number}: {next.title} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
