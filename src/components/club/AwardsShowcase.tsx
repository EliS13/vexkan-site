import { awards, clubAwards, inspireAward } from "@/content/club/events";

/**
 * Recognition, arranged around what it says about the club rather than as a
 * trophy shelf.
 *
 * The mentored-teams figure leads, because it is the one number here that is
 * about other people. The awards follow as small tiles: there are enough of
 * them now that giving each a large card buried the point in scrolling.
 */
export function AwardsShowcase() {
  const rest = awards.filter((a) => a.award !== inspireAward.name);

  return (
    <div>
      <div
        className="lift rounded-3xl px-8 py-12 text-center sm:px-12 sm:py-16"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        <p className="score text-[clamp(3.5rem,12vw,7rem)] font-semibold leading-none text-[var(--purple-text)]">
          {clubAwards.count}
        </p>
        <p className="club-lead mx-auto mt-5 max-w-md">{clubAwards.label}</p>
      </div>

      {/*
       * The Inspire Award is deliberately absent: it gets the dark band below,
       * where its criteria are explained, and showing it twice would spend the
       * page's one loud moment on the same thing.
       */}
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((a) => (
          <li
            key={`${a.team}-${a.award}-${a.event}`}
            className="lift lift-hover rounded-2xl px-6 py-5"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-base font-semibold leading-tight tracking-[-0.01em]">
                {a.award}
              </h3>
              <span className="readout shrink-0 text-xs font-semibold text-[var(--purple-text)]">
                {a.team}
              </span>
            </div>
            <p className="mt-2 text-[13px] text-muted">{a.event}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
