import Link from "next/link";
import { tools } from "@/content/tools";

export const metadata = { title: "Tools — Built From the Ground Up" };

const ACCENTS = {
  purple: { bg: "var(--purple-bg)", text: "var(--purple-text)" },
  teal: { bg: "var(--teal-bg)", text: "var(--teal-text)" },
  amber: { bg: "var(--amber-bg)", text: "var(--amber-text)" },
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-serif text-3xl font-semibold text-foreground">Interactive Tools</h1>
      <p className="mt-2 max-w-xl text-muted">
        Things a page in a book can&apos;t do. Play with the numbers, click through a decision, fill in
        your own notebook.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {tools.map((t) => {
          const accent = ACCENTS[t.accent];
          return (
            <Link
              key={t.id}
              href={t.href}
              className="rounded-xl border bg-surface p-5 transition-colors hover:border-[#cdc6bf]"
              style={{ borderColor: "var(--line)" }}
            >
              <span
                className="inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                style={{ background: accent.bg, color: accent.text }}
              >
                Tool
              </span>
              <h2 className="mt-3 font-serif text-lg font-semibold text-foreground">{t.title}</h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{t.dek}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
