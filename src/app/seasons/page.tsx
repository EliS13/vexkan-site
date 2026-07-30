import Link from "next/link";
import { SEASONS } from "@/content/seasons";
import { SCHEMES } from "@/lib/schemes";

export const metadata = { title: "Seasons from the Field — Built From the Ground Up" };

/** IQ reads purple, V5RC teal, matching the colour system everywhere else. */
const PROGRAM_SCHEME = { "VEX IQ": "purple", V5RC: "teal" } as const;
/** Accents lift on the dark panels, where the base tones only reach about 3:1. */
const ON_DARK = { purple: "var(--purple-on-dark)", teal: "var(--teal-on-dark)" } as const;

export default function SeasonsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <p className="eyebrow text-[var(--muted)]">Reference</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">
        Seasons from the Field
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Every machine 16688A has written about, one robot at a time. Nothing here is new, it is
        pulled together from the chapters so you can read a whole season in one go instead of
        meeting it scattered across Chapters 3, 6, 8, 9, 11 and 15. Each entry says where it came
        from.
      </p>

      <div className="mt-10 space-y-8">
        {SEASONS.map((s) => {
          const c = SCHEMES[PROGRAM_SCHEME[s.program]];
          return (
            <section key={s.id}>
              <div className="flex flex-wrap items-baseline gap-2.5">
                <h2 className="font-serif text-2xl font-semibold text-foreground">{s.name}</h2>
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                  style={{ background: c.bg, color: c.text }}
                >
                  {s.program}
                </span>
                {s.fusion && (
                  <span className="text-[11.5px] font-medium text-muted">
                    Fusion: {s.fusion}
                  </span>
                )}
              </div>

              <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-[var(--ink-body)]">
                {s.premise}
              </p>

              <div className="mt-4 space-y-3">
                {s.mechanisms.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border bg-surface p-4"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: c.text }}
                    >
                      {m.label}
                    </p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--ink-body)]">{m.detail}</p>
                    <Link
                      href={`/chapters/${m.slug}`}
                      className="mt-1.5 inline-block text-[11.5px] font-semibold underline"
                      style={{ color: c.text }}
                    >
                      {m.chapter} →
                    </Link>
                  </div>
                ))}
              </div>

              <div
                className="mt-3 rounded-xl border-l-4 bg-[var(--foreground)] px-4 py-3"
                style={{ borderColor: c.solid }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: ON_DARK[PROGRAM_SCHEME[s.program]] }}
                >
                  What it taught us
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-white">{s.lesson}</p>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
