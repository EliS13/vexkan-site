import Link from "next/link";
import { Chapter } from "@/content/types";

export function ChapterCard({ chapter }: { chapter: Chapter }) {
  const ready = chapter.status === "ready";
  const content = (
    <div
      className="group flex h-full flex-col rounded-xl border bg-surface p-4 transition-colors"
      style={{
        borderColor: "var(--line)",
        opacity: ready ? 1 : 0.6,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow text-[var(--muted)]">
          Chapter {chapter.number}
        </span>
        {!ready && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ background: "var(--neutral-bg)", color: "var(--neutral-text)" }}
          >
            Coming soon
          </span>
        )}
      </div>
      <h3
        className={`mt-1.5 font-serif text-base font-semibold text-foreground ${
          ready ? "group-hover:text-purple-text" : ""
        }`}
      >
        {chapter.title}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{chapter.dek}</p>
    </div>
  );

  if (!ready) {
    return <div className="cursor-default">{content}</div>;
  }

  return (
    <Link href={`/guide/chapters/${chapter.slug}`} className="block h-full">
      {content}
    </Link>
  );
}
