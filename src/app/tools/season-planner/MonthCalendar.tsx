"use client";

import { SCHEMES as SCHEME } from "@/lib/schemes";
import { useEffect, useMemo, useRef, useState } from "react";
import { PlannerEvent, EVENT_KINDS, kindInfo, formatDateLong } from "@/content/planner";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");
/** Local date key, so nothing shifts a day from timezone maths. */
const keyOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function MonthCalendar({
  events,
  onSelectDay,
  selectedDay,
}: {
  events: PlannerEvent[];
  onSelectDay: (date: string | null) => void;
  selectedDay: string | null;
}) {
  const today = new Date();
  const todayKey = keyOf(today.getFullYear(), today.getMonth(), today.getDate());

  // Open on the month holding the next thing due, otherwise this month.
  const initial = useMemo(() => {
    const upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date)).find((e) => e.date >= todayKey);
    const d = new Date((upcoming ? upcoming.date : todayKey) + "T00:00:00");
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [events, todayKey]);

  const [view, setView] = useState(initial);
  // Events arrive after hydration, so track the month until someone pages by hand.
  const userPaged = useRef(false);
  useEffect(() => {
    if (!userPaged.current) setView(initial);
  }, [initial]);

  const byDate = useMemo(() => {
    const map = new Map<string, PlannerEvent[]>();
    events.forEach((e) => {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    });
    return map;
  }, [events]);

  const { year, month } = view;
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = firstOfMonth.getDay();
  const totalCells = Math.ceil((leading + daysInMonth) / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - leading + 1;
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
    const date = new Date(year, month, dayNum);
    return {
      inMonth,
      label: date.getDate(),
      key: keyOf(date.getFullYear(), date.getMonth(), date.getDate()),
    };
  });

  function shift(by: number) {
    userPaged.current = true;
    const d = new Date(year, month + by, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  }

  const usedKinds = EVENT_KINDS.filter((k) => events.some((e) => e.kind === k.id));

  return (
    <div className="rounded-xl border bg-surface p-4" style={{ borderColor: "var(--line)" }}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-serif text-lg font-semibold text-foreground">
          {MONTH_NAMES[month]} {year}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="h-7 w-7 rounded-md border text-sm text-muted transition-colors hover:bg-[#efece7]"
            style={{ borderColor: "var(--line)" }}
          >
            ‹
          </button>
          <button
            onClick={() => {
              userPaged.current = true;
              setView({ year: today.getFullYear(), month: today.getMonth() });
            }}
            className="rounded-md border px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors hover:bg-[#efece7]"
            style={{ borderColor: "var(--line)" }}
          >
            Today
          </button>
          <button
            onClick={() => shift(1)}
            aria-label="Next month"
            className="h-7 w-7 rounded-md border text-sm text-muted transition-colors hover:bg-[#efece7]"
            style={{ borderColor: "var(--line)" }}
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="pb-1 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
            {d.slice(0, 1)}
            <span className="hidden sm:inline">{d.slice(1)}</span>
          </div>
        ))}

        {cells.map((cell, i) => {
          const dayEvents = byDate.get(cell.key) ?? [];
          const isToday = cell.key === todayKey;
          const isSelected = cell.key === selectedDay;
          return (
            <button
              key={i}
              onClick={() => onSelectDay(isSelected ? null : cell.key)}
              title={
                dayEvents.length
                  ? `${formatDateLong(cell.key)}, ${dayEvents.length} scheduled`
                  : `${formatDateLong(cell.key)}, nothing scheduled`
              }
              aria-label={
                dayEvents.length
                  ? `${formatDateLong(cell.key)}, ${dayEvents.length} scheduled`
                  : `${formatDateLong(cell.key)}, nothing scheduled`
              }
              className="min-h-[58px] rounded-lg border p-1 text-left align-top transition-colors sm:min-h-[74px]"
              style={{
                borderColor: isSelected ? "var(--purple)" : "var(--line)",
                background: isSelected ? "var(--purple-bg)" : cell.inMonth ? "#fff" : "#fafaf9",
                opacity: cell.inMonth ? 1 : 0.45,
              }}
            >
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold"
                style={
                  isToday
                    ? { background: "var(--purple)", color: "#fff" }
                    : { color: "#525252" }
                }
              >
                {cell.label}
              </span>

              <span className="mt-0.5 flex flex-col gap-0.5">
                {dayEvents.slice(0, 2).map((e) => {
                  const c = SCHEME[kindInfo(e.kind).scheme];
                  return (
                    <span
                      key={e.id}
                      className="truncate rounded px-1 py-0.5 text-[9.5px] font-semibold leading-tight"
                      style={{ background: c.bg, color: c.text }}
                      title={`${kindInfo(e.kind).label}: ${e.title}${e.notes ? `\n\n${e.notes}` : ""}`}
                    >
                      {e.title}
                    </span>
                  );
                })}
                {dayEvents.length > 2 && (
                  <span className="px-1 text-[9.5px] font-medium text-muted">
                    +{dayEvents.length - 2} more
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {usedKinds.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 border-t pt-2.5" style={{ borderColor: "var(--line)" }}>
          {usedKinds.map((k) => (
            <span key={k.id} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: SCHEME[k.scheme].solid }}
              />
              <span className="text-[11px] font-medium text-muted">{k.label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
