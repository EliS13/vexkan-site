import { AskTheBook } from "./AskTheBook";

export const metadata = { title: "Ask — Built From the Ground Up" };

export default function AskPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <span
        className="inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
        style={{ background: "var(--amber-bg)", color: "var(--amber-text)" }}
      >
        Answers with next steps
      </span>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-foreground">Ask</h1>
      <p className="mt-3 text-muted">
        Describe what you are stuck on and get the short version plus the actual next steps, so you
        do not have to re-read a whole chapter to find them. Answers point back to the book and out
        to official VEX documentation when there is more worth reading.
      </p>

      <div className="mt-8 rounded-xl border p-6" style={{ borderColor: "var(--line)" }}>
        <AskTheBook />
      </div>

      <div className="mt-6 rounded-xl border p-4" style={{ borderColor: "var(--line)" }}>
        <p className="eyebrow text-[var(--muted)]">
          How to trust this
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          These answers are assembled from the book and a short list of vetted sources, not written
          fresh by a live model, so they stay consistent and cost nothing to run. Outside links are
          limited to official VEX sites and a couple of long-running engineering references, because
          VEX split from the REC Foundation in 2026 and plenty of older VEX writing is now wrong
          about who runs events. When this site and your season&apos;s game manual disagree, the
          manual wins.
        </p>
      </div>
    </div>
  );
}
