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
          <p className="eyebrow" style={{ color: "var(--purple-text)" }}>
            By VexKan Robotics
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-[2.6rem] font-bold leading-[1.03] tracking-[-0.03em] text-foreground sm:text-6xl">
            Built to
            <br />
            Compete
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
            A field guide to VEX Robotics, from your first build to the competition floor, with
            calculators, an engineering notebook, and an assistant that hands you the next steps.
          </p>

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
              <p className="mt-2.5 text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div
          className="rounded-xl border bg-surface p-8 text-center sm:p-12"
          style={{ borderColor: "var(--line)" }}
        >
          <span className="eyebrow" style={{ color: "var(--purple-text)" }}>
            Now available
          </span>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-[-0.02em] text-foreground">
            Built to Compete is now available
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
            The book by VexKan Robotics, written from the field. Use the tools and the assistant here
            alongside it.
          </p>
        </div>
      </section>
    </div>
  );
}
