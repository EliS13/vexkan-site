"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { awards, teams, type Award, type Team } from "@/content/club/events";
import { teamAwardPhotos, type Photo } from "@/content/club/photos";
import { TrophyIcon } from "./TrophyIcon";

/**
 * Seconds a team holds before the next one. The progress bar reads this too,
 * so the two can never drift apart.
 *
 * Five rather than four: the fullest panel is ten awards, and four seconds is
 * not long enough to finish reading it before it moves. Hovering or tabbing
 * into the list stops the clock for anyone who wants longer.
 */
const HOLD = 5;

/**
 * The club's teams, one at a time, with what each has won.
 *
 * An index down the side rather than a carousel: all nine teams are on screen
 * at once, so a parent looking for their own child's team can see it without
 * waiting for it to come round, and the rotation is a way of touring the list
 * rather than the only way through it. The bar under the active team is the
 * only thing that says "this moves" — everything else is a directory.
 *
 * Every panel is in the markup and only visibility changes, so the whole
 * record is present before any JavaScript runs. Rotation stops on hover and on
 * keyboard focus, and never starts for a reader who has asked for reduced
 * motion.
 */
export function TeamRotator() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const byTeam = useMemo(() => {
    const map = new Map<string, Award[]>(teams.map((t) => [t.number, []]));
    for (const a of awards) map.get(a.team)?.push(a);
    return map;
  }, []);

  /*
   * `index` is a dependency so that choosing a team gives it a full turn.
   *
   * Reduced motion is read straight from the media query rather than mirrored
   * into state: this has to be able to stop the timer before its first tick,
   * and a state update from an effect lands after the render it would have to
   * prevent. The progress bar is hidden by the same preference in CSS.
   */
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setTimeout(() => setIndex((i) => (i + 1) % teams.length), HOLD * 1000);
    return () => window.clearTimeout(id);
  }, [paused, index]);

  const go = useCallback((next: number) => {
    setIndex(((next % teams.length) + teams.length) % teams.length);
  }, []);

  return (
    <div
      className="lift overflow-hidden rounded-3xl"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
        {/*
         * The index. A horizontal strip on a phone, a column on a laptop, and
         * the same nine buttons either way.
         */}
        <div
          role="tablist"
          aria-label="Our teams"
          aria-orientation="vertical"
          className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:overflow-visible lg:border-r"
          style={{ borderColor: "var(--line)" }}
        >
          {teams.map((t, i) => {
            const active = i === index;
            return (
              <button
                key={t.number}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`team-${t.number}`}
                onClick={() => go(i)}
                className="relative shrink-0 overflow-hidden rounded-xl px-3.5 py-2.5 text-left transition-colors lg:shrink"
                style={
                  active
                    ? { background: "var(--purple-bg)" }
                    : { background: "transparent" }
                }
              >
                <span
                  className="readout block text-sm font-semibold"
                  style={{ color: active ? "var(--purple-text)" : "var(--ink-body)" }}
                >
                  {t.number}
                </span>
                <span className="mt-0.5 hidden text-[13px] text-muted lg:block">{t.name}</span>

                {/*
                 * The only moving part. Keyed on the index so it restarts from
                 * empty each turn, and drawn only when rotation is really on.
                 */}
                {active && !paused && (
                  <span
                    key={index}
                    className="team-progress absolute inset-x-0 bottom-0 h-[3px] origin-left"
                    style={{ background: "var(--purple)", animationDuration: `${HOLD}s` }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/*
         * Every panel occupies the same grid cell, so the box is always as
         * tall as the fullest team and nothing below it moves when the team
         * changes. A fixed height would need a different guess at every
         * breakpoint; this measures itself.
         */}
        <div className="grid p-7 sm:p-9">
          {teams.map((t, i) => (
            <TeamPanel
              key={t.number}
              team={t}
              won={byTeam.get(t.number) ?? []}
              photo={teamAwardPhotos[t.number]}
              active={i === index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamPanel({
  team,
  won,
  photo,
  active,
}: {
  team: Team;
  won: Award[];
  photo?: Photo;
  active: boolean;
}) {
  return (
    <section
      id={`team-${team.number}`}
      role="tabpanel"
      aria-label={`${team.number}, ${team.name}`}
      aria-hidden={active ? undefined : true}
      /*
       * `invisible` is visibility: hidden, which keeps the panel's size in the
       * grid while taking it out of the tab order and the accessibility tree.
       * Opacity alone would leave its buttons and links reachable.
       */
      className={`col-start-1 row-start-1 ${active ? "" : "invisible"}`}
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="readout text-[clamp(2.25rem,5vw,3rem)] font-semibold leading-none text-[var(--purple-text)]">
              {team.number}
            </span>
            <h3 className="text-xl font-semibold">{team.name}</h3>
          </div>
          <p className="eyebrow mt-3 text-[var(--muted)]">
            {team.program} · {team.grade}
          </p>
          <p className="mt-3 max-w-xl text-sm text-muted">{team.note}</p>
        </div>

        {/*
         * The team with what it won, where there is a photograph that names
         * the team. Small and beside the heading rather than under the awards,
         * so a team that has one is not twice the height of a team that has
         * not.
         */}
        {photo && (
          <div className="relative hidden aspect-[4/3] w-40 shrink-0 overflow-hidden rounded-xl sm:block lg:w-48">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="192px"
              className="object-cover"
            />
          </div>
        )}
      </div>

      <hr className="my-6" style={{ borderColor: "var(--line)" }} />

      {won.length > 0 ? (
        <>
          <p className="eyebrow text-[var(--muted)]">
            {won.length} {won.length === 1 ? "award" : "awards"}
          </p>
          <ul className="mt-4 space-y-2.5 sm:columns-2 sm:gap-x-10 sm:space-y-0">
            {won.map((a) => (
              <li key={`${a.award}-${a.event}`} className="flex gap-3 break-inside-avoid sm:mb-2.5">
                <TrophyIcon size={15} className="mt-1 shrink-0 text-[var(--purple)]" />
                <span>
                  <span className="text-[15px] font-semibold">{a.award}</span>
                  <span className="block text-[13px] text-muted">{a.event}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        /*
         * What the team has done, rather than what it has not. Every team
         * without an award still qualified for provincials.
         */
        <>
          <p className="eyebrow text-[var(--muted)]">This season</p>
          <p className="mt-4 flex gap-3 text-[var(--ink-body)]">
            <TrophyIcon size={15} className="mt-1 shrink-0 text-[var(--purple)]" />
            <span className="text-[15px] font-semibold">
              Qualified for the provincial championships
            </span>
          </p>
        </>
      )}
    </section>
  );
}
