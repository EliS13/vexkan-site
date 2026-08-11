import { clubAwards } from "@/content/club/events";
import { TeamRotator } from "./TeamRotator";

/**
 * Recognition, arranged around what it says about the club rather than as a
 * trophy shelf.
 *
 * The mentored-teams figure leads, because it is the one number here that is
 * about other people. Under it the awards are told a team at a time rather
 * than as one long list: thirty tiles in a grid are read as texture and
 * scrolled past, and they also hide which team did what, which is the part
 * that actually means something.
 *
 * The teams sit behind an index rather than a scroll sequence: all nine are
 * listed at once and one is shown at a time. See TeamRotator.
 */
export function AwardsShowcase() {
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
       * The Inspire Award still appears under 16688A, whose award it is. The
       * dark band above explains what it takes to win; this is the record.
       */}
      <div className="mt-8">
        <TeamRotator />
      </div>
    </div>
  );
}
