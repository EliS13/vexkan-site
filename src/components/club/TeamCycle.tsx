"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { awards, teams, type Award, type Team } from "@/content/club/events";
import { TrophyIcon } from "./TrophyIcon";

/** Milliseconds a team holds before the next one. Long enough to read it. */
const HOLD = 6000;

/**
 * Every team the club runs, one at a time, with what that team has won.
 *
 * The club's record is thirty-odd awards across nine teams, which as a flat
 * list is unreadable — it becomes texture. Told a team at a time it is a set
 * of stories, and the teams with nothing yet are visible too rather than
 * quietly dropped, which is the honest version of a trophy shelf.
 *
 * Every panel is in the markup and only visibility changes, so the whole
 * record is present before any JavaScript runs and is found by search. The
 * cycle stops on hover and on keyboard focus, and never starts at all for a
 * reader who has asked for reduced motion.
 */
export function TeamCycle() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  /** Awards per team, in the order the awards file lists them. */
  const byTeam = useMemo(() => {
    const map = new Map<string, Award[]>();
    for (const t of teams) map.set(t.number, []);
    for (const a of awards) map.get(a.team)?.push(a);
    return map;
  }, []);

  const go = useCallback(
    (next: number) => setIndex(((next % teams.length) + teams.length) % teams.length),
    []
  );

  /*
   * `index` is a dependency on purpose: choosing a team tears the timer down
   * and starts a fresh one, so a pick always gets its full turn. Without it
   * the cycle keeps its own schedule and can move the panel a moment after
   * someone clicks, which reads as the page fighting them.
   */
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => setIndex((i) => (i + 1) % teams.length), HOLD);
    return () => window.clearInterval(id);
  }, [paused, index]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/*
       * Team numbers as the control. They are how the club refers to its own
       * teams, so they work as labels rather than needing dots above them.
       */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Our teams">
        {teams.map((t, i) => (
          <button
            key={t.number}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-controls={`team-panel-${t.number}`}
            onClick={() => go(i)}
            className="readout rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors"
            style={
              i === index
                ? { background: "var(--purple)", color: "#fff" }
                : { background: "var(--surface)", border: "1px solid var(--line)", color: "var(--muted)" }
            }
          >
            {t.number}
          </button>
        ))}
      </div>

      <div className="relative mt-5">
        {teams.map((t, i) => (
          <TeamPanel
            key={t.number}
            team={t}
            won={byTeam.get(t.number) ?? []}
            active={i === index}
          />
        ))}
      </div>
    </div>
  );
}

function TeamPanel({ team, won, active }: { team: Team; won: Award[]; active: boolean }) {
  return (
    <section
      id={`team-panel-${team.number}`}
      role="tabpanel"
      aria-label={`${team.number}, ${team.name}`}
      /*
       * The active panel is in flow and sets the height; the rest stack
       * underneath it, present but invisible. Absolute positioning for the
       * inactive ones keeps the block from being as tall as every team at
       * once, without any of them leaving the document.
       */
      className={
        active
          ? "lift relative rounded-3xl p-7 sm:p-9"
          : "pointer-events-none absolute inset-0 overflow-hidden opacity-0"
      }
      aria-hidden={active ? undefined : true}
      style={active ? { background: "var(--surface)", border: "1px solid var(--line)" } : undefined}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div>
          <span className="readout text-[clamp(2.5rem,6vw,3.75rem)] font-semibold leading-none text-[var(--purple-text)]">
            {team.number}
          </span>
          <h3 className="mt-3 text-xl font-semibold">{team.name}</h3>
          <p className="eyebrow mt-2 text-[var(--muted)]">
            {team.program} · {team.grade}
          </p>
          <p className="mt-4 text-sm text-muted">{team.note}</p>
        </div>

        <div>
          {won.length > 0 ? (
            <>
              <p className="eyebrow text-[var(--muted)]">
                {won.length} {won.length === 1 ? "award" : "awards"}
              </p>
              <ul className="mt-4 space-y-3">
                {won.map((a) => (
                  <li key={`${a.award}-${a.event}`} className="flex gap-3">
                    <TrophyIcon size={16} className="mt-1 shrink-0 text-[var(--purple)]" />
                    <span>
                      <span className="font-semibold">{a.award}</span>
                      <span className="block text-[13px] text-muted">{a.event}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            /*
             * Said plainly rather than hidden. A team with nothing yet is a
             * team that started recently, which is worth a parent seeing.
             */
            <p className="text-sm text-muted">
              No awards yet. This is one of the club&apos;s newer teams, and it competes against
              the same schools as the rest.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
