import Link from "next/link";
import { chapters } from "@/content/chapters";
import { ChapterCard } from "@/components/ChapterCard";
import { SEASONS } from "@/content/seasons";

const FEATURES = [
  {
    title: "Chapter guides",
    accent: "var(--purple)",
    bg: "var(--purple-bg)",
    text: "var(--purple-text)",
    body: "Every mechanism chapter anchors to a real 16688A build, drivetrains, intakes, PTOs, pneumatics, and more, written in plain, first-person coaching voice.",
  },
  {
    title: "Interactive tools",
    accent: "var(--teal)",
    bg: "var(--teal-bg)",
    text: "var(--teal-text)",
    body: "A gear-ratio calculator, a mechanism decision picker, a season timeline, and a fillable engineering notebook, things a page can't do.",
  },
  {
    title: "Ask",
    accent: "var(--amber)",
    bg: "var(--amber-bg)",
    text: "var(--amber-text)",
    body: "Describe what you are stuck on and get the short version plus your actual next steps, with links back to the book and out to official VEX documentation.",
  },
];

export default function Home() {
  const iqPreview = chapters.filter((c) => c.part === "iq").slice(0, 6);
  const vrcPreview = chapters.filter((c) => c.part === "vrc").slice(0, 6);

  return (
    <div>
      <section className="relative overflow-hidden border-b" style={{ borderColor: "var(--line)" }}>
        {/* The drafting surface the whole guide sits on. */}
        <div className="tile-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="eyebrow" style={{ color: "var(--purple-text)" }}>
            Team 16688A · VexKan Robotics
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-[2.6rem] font-bold leading-[1.03] tracking-[-0.03em] text-foreground sm:text-6xl">
            Built From
            <br />
            the Ground Up
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
            A field guide to VEX Robotics, from your first build to the competition floor. Chapters,
            calculators, an engineering notebook, and an assistant that hands you the next steps.
          </p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            <Link
              href="/chapters/welcome-to-vex-iq"
              className="rounded-lg px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--purple)" }}
            >
              Start with VEX IQ
            </Link>
            <Link
              href="/chapters/advanced-drivetrains"
              className="rounded-lg border bg-surface px-5 py-3 text-sm font-semibold transition-colors hover:bg-[#efece7]"
              style={{ borderColor: "var(--line)" }}
            >
              Jump to V5RC
            </Link>
            <Link
              href="/ask"
              className="rounded-lg border bg-surface px-5 py-3 text-sm font-semibold transition-colors hover:bg-[#efece7]"
              style={{ borderColor: "var(--line)" }}
            >
              Ask for next steps
            </Link>
          </div>

          {/* The guide's actual spine: the robots it is written from. */}
          <div className="mt-12 border-t pt-5" style={{ borderColor: "var(--line)" }}>
            <p className="eyebrow" style={{ color: "var(--muted)" }}>
              Written from {SEASONS.length} real robots
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-2">
              {SEASONS.map((season) => (
                <Link
                  key={season.id}
                  href="/seasons"
                  className="group flex items-baseline gap-1.5 rounded-lg border bg-surface px-2.5 py-1.5 transition-colors hover:border-[#b8b0a7]"
                  style={{ borderColor: "var(--line)" }}
                >
                  <span className="text-[13px] font-semibold text-foreground">{season.name}</span>
                  <span
                    className="eyebrow"
                    style={{ color: season.program === "VEX IQ" ? "var(--purple-text)" : "var(--teal-text)" }}
                  >
                    {season.program === "VEX IQ" ? "IQ" : "V5"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border bg-surface p-5"
              style={{ borderColor: "var(--line)" }}
            >
              <span className="eyebrow" style={{ color: f.text }}>
                {f.title}
              </span>
              <p className="mt-2.5 text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-semibold tracking-[-0.02em] text-foreground">
            Part I — VEX IQ Fundamentals
          </h2>
          <Link href="/chapters" className="text-sm font-medium" style={{ color: "var(--purple-text)" }}>
            See all chapters →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {iqPreview.map((c) => (
            <ChapterCard key={c.slug} chapter={c} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-semibold tracking-[-0.02em] text-foreground">
            Part II — V5RC Advanced
          </h2>
          <Link href="/chapters" className="text-sm font-medium" style={{ color: "var(--purple-text)" }}>
            See all chapters →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vrcPreview.map((c) => (
            <ChapterCard key={c.slug} chapter={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
