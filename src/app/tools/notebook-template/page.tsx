import Link from "next/link";
import { NotebookTemplate } from "./NotebookTemplate";

export const metadata = { title: "Notebook Template — Built From the Ground Up" };

export default function NotebookTemplatePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="eyebrow text-[var(--muted)]">Tool</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">
        Engineering Notebook
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Builds on{" "}
        <Link href="/chapters/the-engineering-notebook" className="underline">
          Chapter 11
        </Link>
        , structured around what the VEX notebook rubric actually scores: the design process from
        identifying a problem through testing and refining it, plus teamwork and formatting. Every
        entry asks for the number behind the call, and for what you rejected.
      </p>

      <div
        className="mt-6 max-w-2xl rounded-xl border p-4"
        style={{ borderColor: "var(--line)", background: "var(--purple-bg)" }}
      >
        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--purple-text)" }}>
          Why the extra fields
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--ink-body)]">
          Judges score the process, not the robot. An entry that records what you tried, what the
          numbers were, and what you threw out scores higher than a tidy one that only records what
          worked. That is the whole reason the rejected-ideas box is there.
        </p>
      </div>

      <div className="mt-8">
        <NotebookTemplate />
      </div>
    </div>
  );
}
