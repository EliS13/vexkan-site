"use client";

import { SCHEMES as SCHEME } from "@/lib/schemes";
import { useState } from "react";
import { MECHANISMS, recommend, Job, Volume, Travel, CLAW_NOTE, OUTTAKE_NOTE } from "@/content/mechanisms";
import { sourcesFor, Program } from "@/content/sources";

const JOBS: Array<{ id: Job; label: string; sub: string }> = [
  { id: "floor", label: "Collect off the floor", sub: "Pick elements up as you drive" },
  { id: "loader", label: "Take from a loader", sub: "A station hands it to you at a set height" },
  { id: "feed", label: "Feed a scorer", sub: "Move elements through the robot" },
  { id: "hold", label: "Hold one securely", sub: "Grab it and keep it while driving" },
  { id: "descore", label: "Descore", sub: "Pull elements back out of a goal" },
];

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[var(--ink-body)]">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Opt({
  active,
  onClick,
  children,
  sub,
  color = "var(--teal)",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  sub?: string;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border px-3.5 py-2 text-left transition-colors"
      style={active ? { background: color, color: "white", borderColor: color } : { borderColor: "var(--line)", color: "#404040" }}
    >
      <span className="block text-sm font-medium">{children}</span>
      {sub && (
        <span className="block text-[11px]" style={{ color: active ? "rgba(255,255,255,.82)" : "#737373" }}>
          {sub}
        </span>
      )}
    </button>
  );
}

function MechCard({ id, compact = false }: { id: string; compact?: boolean }) {
  const m = MECHANISMS[id];
  if (!m) return null;
  const c = SCHEME[m.scheme];
  const links = sourcesFor(m.sourceIds, m.program === "both" ? undefined : m.program);

  if (compact) {
    return (
      <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--line)" }}>
        <p className="text-[12.5px] font-semibold text-[var(--ink-body)]">{m.name}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-muted">{m.what}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border" style={{ borderColor: c.solid, background: c.bg }}>
      <div className="px-4 pt-3.5">
        <p className="font-serif text-lg font-semibold text-foreground">{m.name}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-body)]">{m.what}</p>
      </div>
      <div className="grid gap-3 px-4 py-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: c.text }}>
            Good at
          </p>
          <ul className="mt-1 space-y-1">
            {m.goodAt.map((g) => (
              <li key={g} className="flex gap-1.5 text-[12.5px] leading-snug text-[var(--ink-body)]">
                <span style={{ color: c.solid }}>+</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Costs you</p>
          <ul className="mt-1 space-y-1">
            {m.costs.map((g) => (
              <li key={g} className="flex gap-1.5 text-[12.5px] leading-snug text-muted">
                <span className="text-[var(--muted)]">&minus;</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t bg-white/60 px-4 py-3" style={{ borderColor: "var(--line)" }}>
        <p className="text-[12.5px] leading-relaxed text-[var(--ink-body)]">
          <span className="font-semibold">Tune this first: </span>
          {m.tune}
        </p>
        {links.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {links.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11.5px] font-medium underline"
                style={{ color: c.text }}
              >
                {s.name} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function MechanismPicker() {
  const [program, setProgram] = useState<Program>("v5");
  const [job, setJob] = useState<Job | null>(null);
  const [volume, setVolume] = useState<Volume | null>(null);
  const [travel, setTravel] = useState<Travel | null>(null);
  const [pneu, setPneu] = useState<boolean | null>(null);

  const ready = job && volume && travel && pneu !== null;
  const rec = ready ? recommend(program, job, volume, travel, pneu) : null;

  function reset() {
    setJob(null);
    setVolume(null);
    setTravel(null);
    setPneu(null);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-5 rounded-xl border bg-surface p-5" style={{ borderColor: "var(--line)" }}>
        <Question title="Which program are you building for?">
          <Opt
            active={program === "iq"}
            onClick={() => {
              setProgram("iq");
              reset();
            }}
            sub="Level Up this season"
            color="var(--purple)"
          >
            VEX IQ
          </Opt>
          <Opt
            active={program === "v5"}
            onClick={() => {
              setProgram("v5");
              reset();
            }}
            sub="Override this season"
            color="var(--purple)"
          >
            V5RC
          </Opt>
        </Question>

        <Question title="What is the job?">
          {JOBS.map((j) => (
            <Opt key={j.id} active={job === j.id} onClick={() => setJob(j.id)} sub={j.sub}>
              {j.label}
            </Opt>
          ))}
        </Question>

        {job && (
          <Question title="One at a time, or a steady stream?">
            <Opt active={volume === "one"} onClick={() => setVolume("one")} sub="Grab, score, come back">
              One at a time
            </Opt>
            <Opt active={volume === "stream"} onClick={() => setVolume("stream")} sub="Several without stopping">
              A steady stream
            </Opt>
          </Question>
        )}

        {volume && (
          <Question title="Does the element need to travel upward inside the robot?">
            <Opt active={travel === "flat"} onClick={() => setTravel("flat")} sub="Stays at about floor height">
              No, it stays low
            </Opt>
            <Opt active={travel === "lift"} onClick={() => setTravel("lift")} sub="Scoring point is up high">
              Yes, it has to go up
            </Opt>
          </Question>
        )}

        {travel && (
          <Question title="Do you have pneumatics to spare this season?">
            <Opt active={pneu === true} onClick={() => setPneu(true)} sub="Tank and a free solenoid">
              Yes
            </Opt>
            <Opt active={pneu === false} onClick={() => setPneu(false)} sub="Motors only">
              No
            </Opt>
          </Question>
        )}
      </div>

      {rec && (
        <div className="space-y-4">
          <div className="rounded-xl border-l-4 bg-[var(--foreground)] px-5 py-4" style={{ borderColor: "var(--teal)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--teal-on-dark)" }}>
              Your build stack
            </p>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-white">{rec.why}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#cdc6bf]">{rec.combination}</p>
          </div>

          {rec.stages.map((s) => (
            <div key={s.stage}>
              <div className="mb-2 flex items-baseline gap-2">
                <span className="font-serif text-base font-semibold text-foreground">{s.label}</span>
              </div>
              <p className="mb-2 text-[13px] leading-relaxed text-muted">{s.note}</p>
              <MechCard id={s.mechanismId} />
              <div className="mt-2">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                  Or swap in
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {s.alternates.map((a) => (
                    <MechCard key={a} id={a} compact />
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-xl border p-4" style={{ borderColor: "var(--line)", background: "var(--amber-bg)" }}>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--amber-text)" }}>
              About claws
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--ink-body)]">{CLAW_NOTE}</p>
          </div>

          <div className="rounded-xl border p-4" style={{ borderColor: "var(--line)" }}>
            <p className="eyebrow text-[var(--muted)]">On the outtake side</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--ink-body)]">{OUTTAKE_NOTE}</p>
          </div>

          <button onClick={reset} className="text-xs font-semibold underline" style={{ color: "var(--teal-text)" }}>
            Start over
          </button>
        </div>
      )}
    </div>
  );
}
