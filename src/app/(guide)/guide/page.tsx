import { Button } from "@/components/club/Button";

const FEATURES = [
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
    body: "Describe what you are stuck on and get the short version plus your actual next steps, with links out to official VEX documentation.",
  },
];

export default function Home() {
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
          <h1 className="max-w-3xl font-serif text-[2.6rem] font-bold leading-[1.03] tracking-[-0.03em] text-foreground sm:text-6xl">
            Built to
            <br />
            Compete
          </h1>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/guide/tools" size="lg">Open the tools</Button>
            <Button href="/guide/ask" size="lg" variant="secondary">Ask for next steps</Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border bg-surface p-5"
              style={{ borderColor: "var(--line)" }}
            >
              <span className="eyebrow" style={{ color: f.text }}>
                {f.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div
          className="rounded-xl border bg-surface p-8 text-center sm:p-12"
          style={{ borderColor: "var(--line)" }}
        >
          <h2 className="font-serif text-3xl font-semibold tracking-[-0.02em] text-foreground">
            Built to Compete is now available
          </h2>
        </div>
      </section>
    </div>
  );
}
