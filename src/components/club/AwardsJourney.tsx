"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  awardMeanings,
  awards,
  clubAwards,
  teams,
  teamsInJourneyOrder,
  type Award,
  type Team,
} from "@/content/club/events";
import { teamAwardPhotos, type Photo } from "@/content/club/photos";
import { TrophyIcon } from "./TrophyIcon";

/**
 * The club's teams in the order they happened, one block at a time.
 *
 * A relay rather than a trophy shelf: each team enters, hands its awards over,
 * and the next one arrives. That is the actual shape of the club — the V5 teams
 * exist because the elementary teams came first — and a grid of thirty tiles
 * cannot say it.
 *
 * Three rules this has to keep:
 *
 *  - Everything is in the markup before any JavaScript runs. The observer only
 *    ever *reveals*; it never supplies content. With scripting off, or before
 *    hydration, every block is fully readable.
 *  - It does not touch the scroll. No pinning, no scroll-jacking, no hijacked
 *    wheel events — the page scrolls at whatever speed the reader chose and the
 *    blocks simply notice when they arrive.
 *  - `prefers-reduced-motion` renders it static and complete, which is handled
 *    in CSS rather than here so it holds even if this component never hydrates.
 *
 * The animation is the storytelling layer. The record itself is the table on
 * /events, linked at the bottom, which is what a sponsor or a search engine
 * reads.
 */

/**
 * Layout effects run before the browser paints; plain effects run after. This
 * reveal has to decide whether a block starts hidden *before* the first paint,
 * or a block already on screen would be drawn, hidden, and faded back in — a
 * flicker on the one block the reader is looking at.
 *
 * React warns about useLayoutEffect during server rendering, so the server gets
 * useEffect, which it never actually runs.
 */
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * How a block is being drawn.
 *
 *  - `unknown`: server-rendered, or scripting is off. Fully visible, no motion.
 *    This is the state the markup ships in, so the track is readable with
 *    JavaScript disabled and before hydration.
 *  - `waiting`: below the fold and hidden, ready to be revealed.
 *  - `entered`: on screen. Animates in from `waiting`, static from `unknown`.
 */
type BlockState = "unknown" | "waiting" | "entered";

export function AwardsJourney() {
  const order = useMemo(() => teamsInJourneyOrder(), []);

  const byTeam = useMemo(() => {
    const map = new Map<string, Award[]>(order.map((t) => [t.number, []]));
    for (const a of awards) map.get(a.team)?.push(a);
    return map;
  }, [order]);

  return (
    <div className="journey">
      <ol className="relative">
        {order.map((team, i) => (
          <JourneyBlock
            key={team.number}
            team={team}
            won={byTeam.get(team.number) ?? []}
            photo={teamAwardPhotos[team.number]}
            /* The rail is drawn between blocks, so the last one has no tail. */
            last={i === order.length - 1}
          />
        ))}
      </ol>

    </div>
  );
}

/**
 * The count, and the handover into the track below it.
 *
 * Separate from the track so it can lead the section rather than close it. The
 * team count is read from the roster rather than typed, so adding a team can
 * never leave this saying the wrong number.
 */
export function AwardsCount() {
  return (
    <div
      className="lift rounded-3xl px-8 py-12 text-center sm:px-12 sm:py-16"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <p className="score text-[clamp(3.5rem,12vw,7rem)] font-semibold leading-none text-[var(--purple-text)]">
        {clubAwards.count}
      </p>
      {/*
       * The number and what it is over, and nothing else. A "meet the teams"
       * line under it repeated the section heading three inches above it.
       */}
      <p className="club-lead mx-auto mt-5 max-w-md">
        {clubAwards.label} over {teams.length} teams
      </p>
    </div>
  );
}

function JourneyBlock({
  team,
  won,
  photo,
  last,
}: {
  team: Team;
  won: Award[];
  photo?: Photo;
  last: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const [state, setState] = useState<BlockState>("unknown");

  /**
   * Which award the description panel is describing. The first one by default,
   * so the panel is never empty, and it never becomes null — an empty panel
   * would collapse the block's height as the pointer left a chip.
   */
  const [activeIndex, setActiveIndex] = useState(0);
  const active = won[activeIndex];
  const meaning = active ? awardMeanings[active.award] : undefined;

  useBeforePaint(() => {
    const el = ref.current;
    if (!el) return;

    /*
     * Anything already on screen is entered straight away, without ever being
     * hidden. Only what is genuinely below the fold gets an entrance, so no
     * reader ever watches content they were already looking at disappear.
     */
    if (el.getBoundingClientRect().top < window.innerHeight) {
      setState("entered");
      return;
    }

    setState("waiting");

    /*
     * Once entered, it stays entered. Re-hiding a block on the way back up
     * makes re-reading the page feel broken, and "fades out on exit" is what
     * leaving the viewport already does.
     */
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState("entered");
            observer.disconnect();
          }
        }
      },
      /* Fires once the block is genuinely on screen rather than at its edge. */
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <li
      ref={ref}
      data-state={state}
      className="journey-block relative pb-14 pl-0 sm:pb-16 sm:pl-12"
    >
      {/* The rail, and the marker this team sits at. Decorative on a phone. */}
      {!last && (
        <span
          aria-hidden="true"
          className="absolute left-[9px] top-6 hidden h-full w-px sm:block"
          style={{ background: "var(--line)" }}
        />
      )}
      <span
        aria-hidden="true"
        className="journey-dot absolute left-0 top-4 hidden h-[19px] w-[19px] rounded-full sm:block"
        style={{ background: "var(--surface)", border: "2px solid var(--purple)" }}
      />

      <div
        className="journey-card lift rounded-3xl p-7 sm:p-9"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="readout text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-none text-[var(--purple-text)]">
                {team.number}
              </span>
              <span
                className="eyebrow rounded-full px-2.5 py-1"
                style={{ background: "var(--purple-bg)", color: "var(--purple-text)" }}
              >
                {team.program}
              </span>
            </div>
            <h3 className="mt-3 text-xl font-semibold">{team.name}</h3>
            <p className="eyebrow mt-2 text-[var(--muted)]">
              {team.seasons.length > 0 ? team.seasons.join(" · ") : "Seasons not recorded"}
            </p>
            <p className="mt-3 max-w-xl text-[15px] text-muted">{team.note}</p>
          </div>

          {photo && (
            <div className="relative hidden aspect-[4/3] w-44 shrink-0 overflow-hidden rounded-2xl sm:block lg:w-52">
              <Image src={photo.src} alt={photo.alt} fill sizes="208px" className="object-cover" />
            </div>
          )}
        </div>

        {won.length > 0 ? (
          <>
            <ul className="mt-7 flex flex-wrap gap-2">
              {won.map((a, i) => {
                const isActive = i === activeIndex;
                return (
                  <li key={`${a.award}-${a.event}`}>
                    {/*
                     * A button, because it changes what the panel below says.
                     * Hover for a mouse, focus for a keyboard, and a tap on a
                     * phone all land on the same handler.
                     */}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(i)}
                      onFocus={() => setActiveIndex(i)}
                      onClick={() => setActiveIndex(i)}
                      aria-pressed={isActive}
                      className="journey-chip inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-left text-[13.5px] font-semibold"
                      style={{
                        /*
                         * The chip's place in the run. The stylesheet turns it
                         * into an animation-delay, so the stagger belongs to
                         * the entrance only and never slows the hover state.
                         */
                        ["--i" as string]: i,
                        background: isActive ? "var(--purple-bg)" : "var(--neutral-bg)",
                        color: isActive ? "var(--purple-text)" : "var(--ink-body)",
                        border: `1px solid ${isActive ? "var(--purple)" : "var(--line)"}`,
                      }}
                    >
                      <TrophyIcon size={13} className="shrink-0 text-[var(--purple)]" />
                      {a.award}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/*
             * The description panel. `aria-live` is deliberately absent: the
             * panel is driven by hover as well as focus, and announcing every
             * chip a pointer crosses would make a screen reader unusable. The
             * chips carry the award names themselves, which is the part that
             * has to be readable.
             */}
            {active && (
              <div
                className="mt-5 rounded-2xl px-5 py-4"
                style={{ background: "var(--neutral-bg)", border: "1px solid var(--line)" }}
              >
                <p className="text-[15px] font-semibold">{active.award}</p>
                <p className="mt-1 text-[13px] text-muted">{active.event}</p>
                {meaning && <p className="mt-3 text-[15px] text-[var(--ink-body)]">{meaning}</p>}
              </div>
            )}
          </>
        ) : (
          <p className="mt-7 flex gap-3 text-[var(--ink-body)]">
            <TrophyIcon size={15} className="mt-1 shrink-0 text-[var(--purple)]" />
            <span className="text-[15px] font-semibold">
              Qualified for the provincial championships
            </span>
          </p>
        )}
      </div>
    </li>
  );
}
