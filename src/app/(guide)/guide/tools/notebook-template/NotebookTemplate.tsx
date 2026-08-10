"use client";

import { SCHEMES as SCHEME_VARS } from "@/lib/schemes";
import { useId, useMemo, useState, useSyncExternalStore } from "react";
import {
  Entry,
  STAGES,
  Stage,
  getStage,
  emptyEntry,
  entrySections,
  migrateEntry,
} from "@/content/notebook";
import { chronological, toMarkdown, copyForGoogleDocs, download, downloadPptx } from "@/lib/notebookExport";
import { getStore } from "@/lib/stores";
import { fileToResizedDataUrl, approxBytes, formatBytes } from "@/lib/images";

const entryStore = getStore("notebookEntries");
const teamStore = getStore("team");

function parseEntries(raw: string): Entry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(migrateEntry) : [];
  } catch {
    return [];
  }
}

const inputClass = "w-full rounded-lg border px-3 py-2 text-sm";

export function NotebookTemplate() {
  const rawEntries = useSyncExternalStore(
    entryStore.subscribe,
    entryStore.getSnapshot,
    entryStore.getServerSnapshot
  );
  const rawTeam = useSyncExternalStore(
    teamStore.subscribe,
    teamStore.getSnapshot,
    teamStore.getServerSnapshot
  );

  const entries = useMemo(() => parseEntries(rawEntries), [rawEntries]);
  const team = useMemo(() => {
    try {
      return rawTeam ? (JSON.parse(rawTeam) as string) : "16688A";
    } catch {
      return "16688A";
    }
  }, [rawTeam]);

  const [draft, setDraft] = useState<Entry>(() => emptyEntry());
  const [status, setStatus] = useState("");
  const teamId = useId();

  const setEntries = (next: Entry[]) => {
    try {
      entryStore.write(JSON.stringify(next));
      return true;
    } catch {
      // localStorage is only a few MB, and photos fill it fast.
      flash("Out of browser storage. Export what you have, then remove some photos.");
      return false;
    }
  };
  const setTeam = (next: string) => {
    try {
      teamStore.write(JSON.stringify(next));
    } catch {
      flash("Out of browser storage.");
    }
  };

  const stage = getStage(draft.stage);
  const ordered = chronological(entries);

  function setValue(key: string, v: string) {
    setDraft((d) => ({ ...d, values: { ...d.values, [key]: v } }));
  }

  function flash(msg: string) {
    setStatus(msg);
    window.setTimeout(() => setStatus(""), 2500);
  }

  const draftPhotoBytes = (draft.images ?? []).reduce((n, src) => n + approxBytes(src), 0);

  async function onPickImages(ev: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(ev.target.files ?? []);
    ev.target.value = "";
    if (files.length === 0) return;
    flash("Resizing photos...");
    try {
      const added = await Promise.all(files.map(fileToResizedDataUrl));
      setDraft((d) => ({ ...d, images: [...(d.images ?? []), ...added] }));
      flash(`Added ${added.length} photo${added.length === 1 ? "" : "s"}.`);
    } catch {
      flash("That file could not be read as an image.");
    }
  }

  function removeImage(index: number) {
    setDraft((d) => ({ ...d, images: (d.images ?? []).filter((_, n) => n !== index) }));
  }

  function exportBackup() {
    const payload = JSON.stringify({ team, entries, savedAt: new Date().toISOString() }, null, 2);
    download(`${team}-notebook-backup.json`, payload, "application/json");
    flash("Backup downloaded. Keep it somewhere safe.");
  }

  async function importBackup(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const incoming: Entry[] = (Array.isArray(parsed) ? parsed : parsed.entries ?? []).map(migrateEntry);
      if (incoming.length === 0) {
        flash("That file had no entries in it.");
        return;
      }
      // Merge on id, so restoring twice does not duplicate everything.
      const byId = new Map(entries.map((e) => [e.id, e]));
      incoming.forEach((e) => byId.set(e.id, e));
      if (setEntries([...byId.values()])) {
        if (typeof parsed.team === "string" && parsed.team) setTeam(parsed.team);
        flash(`Restored ${incoming.length} entr${incoming.length === 1 ? "y" : "ies"}.`);
      }
    } catch {
      flash("That file could not be read as a notebook backup.");
    }
  }

  function addEntry() {
    if (!draft.title.trim()) {
      flash("Give the entry a title first.");
      return;
    }
    if (!setEntries([...entries, draft])) return;
    // Keep the same stage selected, teams usually log several of a kind in a row.
    setDraft(emptyEntry(draft.stage));
    flash("Entry saved.");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-surface p-4" style={{ borderColor: "var(--line)" }}>
        <div className="min-w-[160px] flex-1">
          <label className="text-xs font-semibold text-[var(--ink-body)]" htmlFor={teamId}>
            Team
          </label>
          <input
            id={teamId}
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className={`${inputClass} mt-1`}
            style={{ borderColor: "var(--line)" }}
          />
        </div>
        <p className="flex-[2] text-xs leading-relaxed text-muted">
          Entries save in this browser only. Nothing is uploaded anywhere. Export whenever you want a
          copy you can hand to a judge.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Composer */}
        <div className="space-y-4 rounded-xl border bg-surface p-5" style={{ borderColor: "var(--line)" }}>
          <p className="text-sm font-semibold text-foreground">New entry</p>

          <div>
            <p className="text-xs font-semibold text-[var(--ink-body)]" id="stage-group-label">
              Design process stage
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-labelledby="stage-group-label">
              {STAGES.map((s) => {
                const c = SCHEME_VARS[s.scheme];
                const active = draft.stage === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setDraft((d) => ({ ...d, stage: s.id as Stage }))}
                    aria-pressed={active}
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors"
                    style={active ? { background: c.text, color: "white" } : { background: c.bg, color: c.text }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            <p
              className="mt-2 rounded-lg px-3 py-2 text-[11.5px] leading-relaxed"
              style={{ background: SCHEME_VARS[stage.scheme].bg, color: SCHEME_VARS[stage.scheme].text }}
            >
              <span className="font-bold">What judges look for: </span>
              {stage.rubric}
            </p>
            <p className="mt-1.5 text-[11px] text-muted">
              The questions below change with the stage. Switching stage keeps anything you already
              typed.
            </p>
          </div>

          <input
            placeholder="Title, e.g. Dropped side rollers to 900 RPM"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            className={inputClass}
            style={{ borderColor: "var(--line)" }}
          />
          <div className="flex flex-wrap gap-2">
            <input
              placeholder="Members present"
              value={draft.members}
              onChange={(e) => setDraft((d) => ({ ...d, members: e.target.value }))}
              className={`${inputClass} flex-1`}
              style={{ borderColor: "var(--line)" }}
            />
            <input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
              className={`${inputClass} flex-1`}
              style={{ borderColor: "var(--line)" }}
            />
          </div>

          {stage.fields.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-[var(--ink-body)]" htmlFor={`${teamId}-${f.key}`}>
                {f.label}
              </label>
              <textarea
                id={`${teamId}-${f.key}`}
                rows={f.rows ?? 3}
                value={draft.values[f.key] ?? ""}
                onChange={(e) => setValue(f.key, e.target.value)}
                placeholder={f.placeholder}
                className={`${inputClass} mt-1`}
                style={{ borderColor: "var(--line)" }}
              />
            </div>
          ))}


          <div>
            <label className="text-xs font-semibold text-[var(--ink-body)]">Photos</label>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
              Photos are resized before saving and are placed beside the text on the slide, and
              inline in the Google Doc.
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onPickImages}
              className="mt-2 block w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
              style={{ colorScheme: "light" }}
            />
            {(draft.images ?? []).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {(draft.images ?? []).map((src, n) => (
                  <div key={n} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Photo ${n + 1}`}
                      className="h-16 w-16 rounded-lg border object-cover"
                      style={{ borderColor: "var(--line)" }}
                    />
                    <button
                      onClick={() => removeImage(n)}
                      aria-label={`Remove photo ${n + 1}`}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--foreground)] text-[11px] font-bold text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {draftPhotoBytes > 0 && (
              <p className="mt-1.5 text-[11px] text-muted">
                {(draft.images ?? []).length} photo
                {(draft.images ?? []).length === 1 ? "" : "s"}, about {formatBytes(draftPhotoBytes)}.
              </p>
            )}
          </div>

          <button
            onClick={addEntry}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--purple)" }}
          >
            Add entry
          </button>
        </div>

        {/* Notebook */}
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[var(--ink-body)]">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </p>
            {status && <span className="text-xs font-medium text-muted">{status}</span>}
          </div>

          {entries.length > 0 && (
            <div className="mb-4 rounded-xl border p-4" style={{ borderColor: "var(--line)" }}>
              <p className="eyebrow text-[var(--muted)]">
                Send it to Google
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  onClick={async () => {
                    try {
                      await copyForGoogleDocs(entries, team);
                      flash("Copied. Paste into a Google Doc.");
                    } catch {
                      flash("Copy failed, use the markdown download instead.");
                    }
                  }}
                  className="rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--teal)" }}
                >
                  Copy for Google Docs
                </button>
                <button
                  onClick={async () => {
                    flash("Building slides...");
                    try {
                      await downloadPptx(entries, team);
                      flash("Deck downloaded. Upload it to Google Slides.");
                    } catch {
                      flash("Could not build the deck. Try the markdown export instead.");
                    }
                  }}
                  className="rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--amber)" }}
                >
                  Slides deck, one slide per entry
                </button>
                <button
                  onClick={() => {
                    download(`${team}-notebook.md`, toMarkdown(entries, team), "text/markdown");
                    flash("Markdown downloaded.");
                  }}
                  className="rounded-lg border px-3.5 py-2 text-xs font-semibold text-[var(--ink-body)] transition-colors hover:bg-[#efece7]"
                  style={{ borderColor: "var(--line)" }}
                >
                  Markdown
                </button>
              </div>
              <p className="mt-2.5 text-[11px] leading-relaxed text-muted">
                The Doc paste is set in Times New Roman with a table of contents, numbered entries
                and figure captions. For a PDF, paste into a Doc and use File, Download, PDF. The
                deck is 8.5 by 11 inch portrait pages, the same page setup VEX&apos;s own digital
                notebook templates use, and Google Slides opens it straight from Drive.
              </p>
            </div>
          )}

          <div className="mb-4 rounded-xl border p-4" style={{ borderColor: "var(--line)" }}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow text-[var(--muted)]">
                Backup
              </span>
              {entries.length > 0 && (
                <button
                  onClick={exportBackup}
                  className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-[var(--ink-body)] transition-colors hover:bg-[#efece7]"
                  style={{ borderColor: "var(--line)" }}
                >
                  Save a backup file
                </button>
              )}
              <label
                className="cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold text-[var(--ink-body)] transition-colors hover:bg-[#efece7]"
                style={{ borderColor: "var(--line)" }}
              >
                Restore from backup
                <input type="file" accept="application/json" onChange={importBackup} className="hidden" />
              </label>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Entries live in this browser only, so clearing site data would wipe them. A backup file
              restores everything, photos included, and moves it to another computer.
            </p>
          </div>

          {entries.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted" style={{ borderColor: "var(--line)" }}>
              Nothing here yet. Add your first entry and it saves automatically in this browser.
            </div>
          ) : (
            <ol className="space-y-3">
              {ordered.map((e, i) => {
                const st = getStage(e.stage);
                const c = SCHEME_VARS[st.scheme];
                const sections = entrySections(e);
                return (
                  <li key={e.id} className="overflow-hidden rounded-xl border bg-surface" style={{ borderColor: "var(--line)" }}>
                    <div className="flex items-start justify-between gap-3 px-4 py-3" style={{ background: c.bg }}>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: c.text }}>
                          Entry {i + 1} · {st.label}
                        </p>
                        <p className="mt-0.5 font-serif text-base font-semibold text-foreground">{e.title}</p>
                        <p className="text-[11px] text-muted">
                          {e.date} · {e.members || "no members listed"}
                        </p>
                      </div>
                      <button
                        onClick={() => setEntries(entries.filter((x) => x.id !== e.id))}
                        className="shrink-0 text-[11px] font-medium text-muted hover:text-[var(--ink-body)]"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="space-y-2 px-4 py-3">
                      {sections.length === 0 && (e.images ?? []).length === 0 ? (
                        <p className="text-[13px] italic text-[var(--muted)]">No details recorded yet.</p>
                      ) : (
                        sections.map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: c.text }}>
                              {label}
                            </p>
                            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--ink-body)]">{value}</p>
                          </div>
                        ))
                      )}
                      {(e.images ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {(e.images ?? []).map((src, n) => (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              key={n}
                              src={src}
                              alt={`Entry ${i + 1} photo ${n + 1}`}
                              className="h-20 w-20 rounded-lg border object-cover"
                              style={{ borderColor: "var(--line)" }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
