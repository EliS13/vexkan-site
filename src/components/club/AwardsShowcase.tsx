import { awards, clubAwards, inspireAward } from "@/content/club/events";

/**
 * Recognition, arranged around what it says about the club rather than as a
 * trophy shelf.
 *
 * The order is deliberate: the number of awards across teams the club has
 * mentored comes first, because that is the one figure that is about other
 * people. The Inspire Award follows, since it is judged on impact rather than
 * on the robot. The rest sit quietly underneath.
 */
export function AwardsShowcase() {
  const rest = awards.filter((a) => a.award !== inspireAward.name);

  return (
    <div>
      {/* The headline figure. Everything else on the page is one team; this is all of them. */}
      <div
        className="rounded-3xl px-8 py-14 text-center sm:px-12 sm:py-20"
        style={{ background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-rest)" }}
      >
        <p className="score text-[clamp(4rem,14vw,8rem)] font-semibold leading-none text-[var(--purple-text)]">
          {clubAwards.count}
        </p>
        <p className="club-lead mx-auto mt-6 max-w-md text-[1.15rem]">
          {clubAwards.label}
        </p>
      </div>

      {/*
       * The Inspire Award is deliberately absent here. It gets the dark band
       * immediately below, where its criteria are explained, and showing it
       * twice would spend the page's one loud moment on the same thing.
       */}
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((a) => (
          <li
            key={`${a.team}-${a.award}-${a.event}`}
            className="rounded-3xl px-8 py-10"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow-rest)",
            }}
          >
            <p className="readout text-sm font-semibold text-[var(--purple-text)]">{a.team}</p>
            <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.02em]">
              {a.award}
            </h3>
            <p className="mt-4 text-sm text-muted">{a.event}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
