"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { GUIDANCE, matchGuidance } from "@/content/guidance";
import { sourcesFor, generalSourcesFor, Program, SourceKind } from "@/content/sources";
import { getStore } from "@/lib/stores";

const questionStore = getStore("recentQuestions");

const KIND_STYLE: Record<SourceKind, { label: string; bg: string; text: string }> = {
  official: { label: "Official", bg: "var(--teal-bg)", text: "var(--teal-text)" },
  community: { label: "Community", bg: "var(--purple-bg)", text: "var(--purple-text)" },
  video: { label: "Video", bg: "var(--amber-bg)", text: "var(--amber-text)" },
  thread: { label: "Forum thread", bg: "var(--neutral-bg)", text: "var(--neutral-text)" },
};

const EXAMPLES = [
  "what intake should we build",
  "how do we pick a gear ratio",
  "is a PTO worth it",
  "what do judges want in the notebook",
  "how do we scout before an event",
];

export function AskTheBook() {
  const [program, setProgram] = useState<Program>("v5");
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [showAll, setShowAll] = useState(false);

  const rawRecent = useSyncExternalStore(
    questionStore.subscribe,
    questionStore.getSnapshot,
    questionStore.getServerSnapshot
  );
  const recent = useMemo<Array<{ id: string; q: string }>>(() => {
    try {
      const parsed = JSON.parse(rawRecent || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [rawRecent]);

  const guidance = useMemo(() => (submitted ? matchGuidance(submitted) : null), [submitted]);

  function run(q: string) {
    setQuery(q);
    setSubmitted(q);
    if (q.trim()) {
      try {
        const prev = JSON.parse(questionStore.getSnapshot() || "[]") as Array<{ id: string; q: string; at: string }>;
        const next = [
          { id: q.trim().toLowerCase(), q: q.trim(), at: new Date().toISOString() },
          ...prev.filter((r) => r.id !== q.trim().toLowerCase()),
        ].slice(0, 25);
        questionStore.write(JSON.stringify(next));
      } catch {
        // history is a nicety, never block the answer on it
      }
    }
    setShowAll(false);
  }

  const hasAnswer = Boolean(guidance);

  // Everything tied to this topic, on-topic first and general references excluded.
  const topicSources = guidance
    ? sourcesFor([...new Set([...guidance.directSourceIds, ...guidance.sourceIds])], program).filter(
        (src) => !src.general
      )
    : [];
  const shownSources = topicSources.slice(0, 5);

  // Live searches, so every topic has video and forum depth that never goes stale.
  const label = program === "iq" ? "VEX IQ" : "V5RC";
  const q = guidance ? `${label} ${guidance.searchTerms}` : "";
  const searchLinks = guidance
    ? [
        {
          id: "yt-search",
          name: `More videos on ${guidance.searchTerms}`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
          what: `A live YouTube search for ${label} ${guidance.searchTerms}, so it stays current as teams post.`,
          kind: "video" as const,
        },
        {
          id: "forum-search",
          name: `More forum threads on ${guidance.searchTerms}`,
          url: `https://www.vexforum.com/search?q=${encodeURIComponent(q)}`,
          what: `A live VEX Forum search, filtered to ${label}.`,
          kind: "thread" as const,
        },
      ]
    : [];

  // Extras lead with videos and threads, reference docs sink to the bottom.
  const KIND_ORDER: Record<string, number> = { video: 0, thread: 1, community: 2, official: 3 };
  const moreSources = [
    ...searchLinks,
    ...topicSources
      .slice(5)
      .sort((a, b) => (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9)),
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[var(--ink-body)]">Answers for</span>
        {(["iq", "v5"] as Program[]).map((p) => (
          <button
            key={p}
            onClick={() => setProgram(p)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
            style={
              program === p
                ? { background: "var(--purple)", color: "white" }
                : { background: "var(--purple-bg)", color: "var(--purple-text)" }
            }
          >
            {p === "iq" ? "VEX IQ" : "V5RC"}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(query);
        }}
        className="flex gap-2"
      >
        <input
          aria-label="Your question"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask what to do next, e.g. what intake should we build?"
          className="w-full rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: "var(--line)" }}
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--amber)" }}
        >
          Ask
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => run(ex)}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-[#cdc6bf]"
            style={{ borderColor: "var(--line)" }}
          >
            {ex}
          </button>
        ))}
      </div>

      {submitted && !hasAnswer && (
        <p className="mt-8 text-sm text-muted">
          Nothing matched that closely.
        </p>
      )}

      {guidance && (
        <div className="mt-8 space-y-4">
          <div className="rounded-xl border p-5" style={{ borderColor: "var(--amber)", background: "var(--amber-bg)" }}>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--amber-text)" }}>
              {guidance.title}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-body)]">{guidance.summary}</p>
            {guidance.programNote?.[program] && (
              <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-[13px] leading-relaxed text-[var(--ink-body)]">
                <span className="font-bold">{program === "iq" ? "In VEX IQ: " : "In V5RC: "}</span>
                {guidance.programNote[program]}
              </p>
            )}
          </div>

          <div className="rounded-xl border bg-surface p-5" style={{ borderColor: "var(--line)" }}>
            <p className="eyebrow text-[var(--muted)]">
              Your next steps
            </p>
            <ol className="mt-3 space-y-2.5">
              {guidance.nextSteps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ background: "var(--purple)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[14px] leading-relaxed text-[var(--ink-body)]">{s}</span>
                </li>
              ))}
            </ol>

            {guidance.toolHref && (
              <Link
                href={guidance.toolHref}
                className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--teal)" }}
              >
                {guidance.toolLabel} →
              </Link>
            )}
          </div>

          <div className="rounded-xl border bg-surface p-5" style={{ borderColor: "var(--line)" }}>
            <p className="eyebrow text-[var(--muted)]">
              Go deeper, off this site
            </p>
            <ul className="mt-2.5 space-y-2.5">
              {shownSources.map((src) => (
                <li key={src.id}>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium underline"
                    style={{ color: "var(--teal-text)" }}
                  >
                    {src.name} ↗
                  </a>
                  <span
                    className="ml-1.5 rounded-lg px-1.5 py-0.5 text-[9px] font-bold uppercase"
                    style={{ background: KIND_STYLE[src.kind].bg, color: KIND_STYLE[src.kind].text }}
                  >
                    {KIND_STYLE[src.kind].label}
                  </span>
                </li>
              ))}
            </ul>

            {moreSources.length > 0 && (
              <>
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="mt-3 rounded-lg border px-3.5 py-2 text-xs font-semibold text-[var(--ink-body)] transition-colors hover:bg-[#efece7]"
                  style={{ borderColor: "var(--line)" }}
                >
                  {showAll ? "Hide extra resources" : `More videos and forums on this (${moreSources.length})`}
                </button>

                {showAll && (
                  <ul
                    className="mt-3 grid gap-2.5 border-t pt-3 sm:grid-cols-2"
                    style={{ borderColor: "var(--line)" }}
                  >
                    {moreSources.map((src) => (
                      <li key={src.id}>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] font-medium underline"
                          style={{ color: "var(--teal-text)" }}
                        >
                          {src.name} ↗
                        </a>
                        <span
                          className="ml-1.5 rounded-lg px-1.5 py-0.5 text-[9px] font-bold uppercase"
                          style={{ background: KIND_STYLE[src.kind].bg, color: KIND_STYLE[src.kind].text }}
                        >
                          {KIND_STYLE[src.kind].label}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {!submitted && recent.length > 0 && (
        <div className="mt-6">
          <p className="eyebrow text-[var(--muted)]">
            You asked recently
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recent.slice(0, 6).map((r) => (
              <button
                key={r.id}
                onClick={() => run(r.q)}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-[#cdc6bf]"
                style={{ borderColor: "var(--line)" }}
              >
                {r.q}
              </button>
            ))}
          </div>
        </div>
      )}

      {!submitted && (
        <div className="mt-8 rounded-xl border p-5" style={{ borderColor: "var(--line)" }}>
          <p className="eyebrow text-[var(--muted)]">
            What this can help with
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {GUIDANCE.map((g) => (
              <button
                key={g.id}
                onClick={() => run(g.title)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                style={{ background: "var(--purple-bg)", color: "var(--purple-text)" }}
              >
                {g.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {submitted && hasAnswer && (
        <div className="mt-10 border-t pt-5" style={{ borderColor: "var(--line)" }}>
          <p className="eyebrow text-[var(--muted)]">
            General {program === "iq" ? "VEX IQ" : "V5RC"} references
          </p>
          <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {generalSourcesFor(program).map((src) => (
              <li key={src.id}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-medium underline"
                  style={{ color: "var(--teal-text)" }}
                >
                  {src.name} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
