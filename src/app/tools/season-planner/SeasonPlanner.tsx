"use client";

import { SCHEMES as SCHEME } from "@/lib/schemes";
import { useId, useMemo, useState, useSyncExternalStore } from "react";
import {
  PlannerEvent,
  EventKind,
  EVENT_KINDS,
  kindInfo,
  SEASON_PHASES,
  toIcs,
  daysUntil,
  formatDateLong,
  eventSections,
} from "@/content/planner";
import { getStore } from "@/lib/stores";
import { MonthCalendar } from "./MonthCalendar";
import { download } from "@/lib/download";

const store = getStore("seasonPlan");
const teamStore = getStore("team");

const inputClass = "w-full rounded-lg border px-3 py-2 text-sm";

function emptyEvent(): PlannerEvent {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    title: "",
    kind: "competition",
    notes: "",
    values: {},
  };
}

export function SeasonPlanner() {
  const raw = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const rawTeam = useSyncExternalStore(
    teamStore.subscribe,
    teamStore.getSnapshot,
    teamStore.getServerSnapshot
  );

  const events = useMemo<PlannerEvent[]>(() => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [raw]);

  const team = useMemo(() => {
    try {
      return rawTeam ? (JSON.parse(rawTeam) as string) : "16688A";
    } catch {
      return "16688A";
    }
  }, [rawTeam]);

  const [draft, setDraft] = useState<PlannerEvent>(emptyEvent);
  const [status, setStatus] = useState("");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const fieldId = useId();

  const sorted = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events]
  );
  const upcoming = sorted.filter((e) => daysUntil(e.date) >= 0);
  const past = sorted.filter((e) => daysUntil(e.date) < 0);
  const nextComp = upcoming.find((e) => e.kind === "competition" || e.kind === "scrimmage");

  function flash(msg: string) {
    setStatus(msg);
    window.setTimeout(() => setStatus(""), 2500);
  }

  function save(next: PlannerEvent[]) {
    try {
      store.write(JSON.stringify(next));
    } catch {
      flash("Out of browser storage.");
    }
  }

  const kind = kindInfo(draft.kind);

  function add() {
    if (!draft.title.trim()) {
      flash("Give it a name first.");
      return;
    }
    save([...events, draft]);
    setDraft({ ...emptyEvent(), kind: draft.kind });
    flash("Added.");
  }

  return (
    <div className="space-y-6">
      {nextComp && (
        <div className="rounded-xl border-l-4 bg-[var(--foreground)] px-5 py-4" style={{ borderColor: "var(--purple)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--purple-on-dark)" }}>
            Next up
          </p>
          <p className="readout mt-1 text-2xl font-semibold text-white">
            {daysUntil(nextComp.date) === 0
              ? "Today"
              : `${daysUntil(nextComp.date)} day${daysUntil(nextComp.date) === 1 ? "" : "s"}`}{" "}
            <span className="font-sans text-base font-normal text-[#cdc6bf]">
              until {nextComp.title}
            </span>
          </p>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            {nextComp.date} · {kindInfo(nextComp.kind).label}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="space-y-3 rounded-xl border bg-surface p-5" style={{ borderColor: "var(--line)" }}>
          <p className="text-sm font-semibold text-foreground">Add to the season</p>

          <p className="text-xs font-semibold text-[var(--ink-body)]" id="kind-group-label">
            What kind of day
          </p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby="kind-group-label">
            {EVENT_KINDS.map((k) => {
              const c = SCHEME[k.scheme];
              const active = draft.kind === k.id;
              return (
                <button
                  key={k.id}
                  onClick={() => setDraft((d) => ({ ...d, kind: k.id as EventKind }))}
                  aria-pressed={active}
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors"
                  style={active ? { background: c.text, color: "white" } : { background: c.bg, color: c.text }}
                >
                  {k.label}
                </button>
              );
            })}
          </div>

          <p className="rounded-lg px-3 py-2 text-[11.5px] leading-relaxed"
             style={{ background: SCHEME[kind.scheme].bg, color: SCHEME[kind.scheme].text }}>
            {kind.what}
          </p>

          <input
            aria-label="Name"
            placeholder={kind.titlePlaceholder}
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            className={inputClass}
            style={{ borderColor: "var(--line)" }}
          />
          <input
            aria-label="Date"
            type="date"
            value={draft.date}
            onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
            className={inputClass}
            style={{ borderColor: "var(--line)" }}
          />
          {kind.fields.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-[var(--ink-body)]" htmlFor={`${fieldId}-${f.key}`}>
                {f.label}
              </label>
              <textarea
                id={`${fieldId}-${f.key}`}
                rows={f.rows ?? 2}
                placeholder={f.placeholder}
                value={draft.values?.[f.key] ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, values: { ...(d.values ?? {}), [f.key]: e.target.value } }))
                }
                className={`${inputClass} mt-1`}
                style={{ borderColor: "var(--line)" }}
              />
            </div>
          ))}

          <div className="rounded-lg border p-3" style={{ borderColor: "var(--line)" }}>
            <p className="eyebrow text-[var(--muted)]">
              Think through before the day
            </p>
            <ul className="mt-1.5 space-y-1">
              {kind.checklist.map((c) => (
                <li key={c} className="flex gap-1.5 text-[11.5px] leading-snug text-muted">
                  <span style={{ color: SCHEME[kind.scheme].solid }}>&bull;</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={add}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--purple)" }}
          >
            Add
          </button>

          <div className="border-t pt-3" style={{ borderColor: "var(--line)" }}>
            <p className="eyebrow text-[var(--muted)]">
              Where you should be
            </p>
            <ol className="mt-2 space-y-2">
              {SEASON_PHASES.map((p, i) => (
                <li key={p.label}>
                  <p className="text-[12px] font-semibold text-[var(--ink-body)]">
                    {i + 1}. {p.label}{" "}
                    <span className="font-normal text-[var(--muted)]">· {p.when}</span>
                  </p>
                  <p className="text-[11px] leading-snug text-muted">{p.what}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          <MonthCalendar events={events} selectedDay={selectedDay} onSelectDay={setSelectedDay} />

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[var(--ink-body)]">
              {events.length} {events.length === 1 ? "date" : "dates"}
            </p>
            <div className="flex items-center gap-2">
              {status && <span className="text-xs font-medium text-muted">{status}</span>}
              {events.length > 0 && (
                <button
                  onClick={() => {
                    download(`${team}-season.ics`, toIcs(sorted, team), "text/calendar");
                    flash("Calendar file downloaded.");
                  }}
                  className="rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--teal)" }}
                >
                  Add to Google Calendar
                </button>
              )}
            </div>
          </div>

          {selectedDay && sorted.every((e) => e.date !== selectedDay) && (
            <div
              className="rounded-xl border border-dashed p-4 text-center text-[13px] text-muted"
              style={{ borderColor: "var(--line)" }}
            >
              <span className="font-semibold text-[var(--ink-body)]">{formatDateLong(selectedDay)}</span>
              <br />
              Nothing scheduled yet. Working backwards from your next competition is usually the
              easiest way to fill a season in.
              <br />
              <button
                onClick={() => {
                  setDraft((d) => ({ ...d, date: selectedDay }));
                  setSelectedDay(null);
                }}
                className="mt-1.5 font-semibold underline"
                style={{ color: "var(--purple-text)" }}
              >
                Add a {kind.label.toLowerCase()} on this day
              </button>
            </div>
          )}

          {events.length === 0 ? (
            <div
              className="rounded-xl border border-dashed p-6 text-center text-sm text-muted"
              style={{ borderColor: "var(--line)" }}
            >
              Nothing scheduled yet. Start with your next competition and work backwards.
            </div>
          ) : (
            <div className="space-y-4">
              {(selectedDay
                ? [{ label: formatDateLong(selectedDay), list: sorted.filter((e) => e.date === selectedDay) }]
                : [
                    { label: "Coming up", list: upcoming },
                    { label: "Done", list: past },
                  ])
                .filter((g) => g.list.length > 0)
                .map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">
                      {group.label}
                    </p>
                    <ul className="space-y-2">
                      {group.list.map((e) => {
                        const c = SCHEME[kindInfo(e.kind).scheme];
                        const d = daysUntil(e.date);
                        return (
                          <li
                            key={e.id}
                            className="flex items-start gap-3 rounded-xl border bg-surface p-3"
                            style={{ borderColor: "var(--line)", opacity: d < 0 ? 0.6 : 1 }}
                          >
                            <div
                              className="w-1 shrink-0 self-stretch rounded-full"
                              style={{ background: c.solid }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                                  style={{ background: c.bg, color: c.text }}
                                >
                                  {kindInfo(e.kind).label}
                                </span>
                                <span className="text-[13px] font-semibold text-foreground">{e.title}</span>
                              </div>
                              <p className="mt-0.5 text-[11.5px] text-muted">
                                {e.date}
                                {d >= 0 && ` · in ${d} day${d === 1 ? "" : "s"}`}
                              </p>
                              {eventSections(e).map(({ label, value }) => (
                                <div key={label} className="mt-1.5">
                                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: c.text }}>
                                    {label}
                                  </p>
                                  <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-[var(--ink-body)]">
                                    {value}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => save(events.filter((x) => x.id !== e.id))}
                              className="shrink-0 text-[11px] font-medium text-[var(--muted)] hover:text-[var(--ink-body)]"
                            >
                              Remove
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
