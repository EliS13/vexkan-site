import { clubAwards } from "@/content/club/events";
import { TeamCycle } from "./TeamCycle";

/**
 * Recognition, arranged around what it says about the club rather than as a
 * trophy shelf.
 *
 * The mentored-teams figure leads, because it is the one number here that is
 * about other people. Under it the awards are told a team at a time rather
 * than as one long list: thirty tiles in a grid are read as texture and
 * scrolled past, and they also hide which team did what, which is the part
 * that actually means something.
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
       * The Inspire Award is deliberately absent from the team panels' framing
       * here: it gets the dark band above, where its criteria are explained.
       * It still appears under 16688A, which is whose award it is.
       */}
      <div className="mt-8">
        <TeamCycle />
      </div>
    </div>
  );
}
