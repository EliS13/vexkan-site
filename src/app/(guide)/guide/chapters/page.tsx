import Link from "next/link";
import { chapters, partLabels } from "@/content/chapters";
import { ChapterCard } from "@/components/ChapterCard";

export const metadata = { title: "Chapters — Built From the Ground Up" };

export default function ChaptersPage() {
  const parts: Array<keyof typeof partLabels> = ["iq", "vrc", "back-matter"];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-serif text-3xl font-semibold text-foreground">Table of Contents</h1>
      <p className="mt-2 max-w-xl text-muted">
        Chapters marked coming soon are on the map but not drafted yet, they will not link
        anywhere until the manuscript catches up.
      </p>

      <Link
        href="/guide/seasons"
        className="mt-6 flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors hover:border-[#cdc6bf]"
        style={{ borderColor: "var(--line)", background: "var(--teal-bg)" }}
      >
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--teal-text)" }}>
            Reference
          </p>
          <p className="mt-0.5 font-serif text-lg font-semibold text-foreground">
            Seasons from the Field
          </p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
            Every machine and mechanism 16688A has run, one robot at a time, pulled together from
            across the chapters.
          </p>
        </div>
        <span className="shrink-0 text-lg text-[var(--muted)]" aria-hidden>→</span>
      </Link>

      {parts.map((part) => {
        const list = chapters.filter((c) => c.part === part);
        if (list.length === 0) return null;
        return (
          <section key={part} className="mt-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              {partLabels[part]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <ChapterCard key={c.slug} chapter={c} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
