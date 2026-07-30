import Link from "next/link";
import { chapters, partLabels } from "@/content/chapters";

export function ChapterSidebar({ activeSlug }: { activeSlug: string }) {
  const parts: Array<"iq" | "vrc" | "back-matter"> = ["iq", "vrc", "back-matter"];

  return (
    <nav className="text-sm">
      {parts.map((part) => {
        const list = chapters.filter((c) => c.part === part);
        if (list.length === 0) return null;
        return (
          <div key={part} className="mb-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
              {partLabels[part]}
            </p>
            <ul className="space-y-0.5">
              {list.map((c) => {
                const active = c.slug === activeSlug;
                const ready = c.status === "ready";
                const item = (
                  <span className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-[var(--muted)]">{c.number}.</span>
                    <span className={!ready ? "text-[var(--muted)]" : undefined}>{c.title}</span>
                  </span>
                );
                return (
                  <li key={c.slug}>
                    {ready ? (
                      <Link
                        href={`/chapters/${c.slug}`}
                        className="block rounded-md px-2 py-1.5 transition-colors"
                        style={
                          active
                            ? { background: "var(--purple-bg)", color: "var(--purple-text)" }
                            : undefined
                        }
                      >
                        {item}
                      </Link>
                    ) : (
                      <span className="block cursor-default rounded-md px-2 py-1.5">{item}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
