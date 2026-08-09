"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, isCloudConfigured } from "@/lib/supabase";
import { getProgram } from "@/content/club/programs";
import { toCsv, type RegistrationRow } from "@/lib/registration";
import {
  deleteRegistration,
  isAdmin,
  listRegistrations,
  updateRegistrationStatus,
} from "@/lib/registrationsApi";
import { download } from "@/lib/download";

const STATUSES = ["new", "contacted", "enrolled", "withdrawn"] as const;

type State = "loading" | "signed-out" | "not-admin" | "ready";

export function AdminDashboard() {
  const [state, setState] = useState<State>("loading");
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return setState("signed-out");

    const { data } = await sb.auth.getUser();
    if (!data.user) return setState("signed-out");

    if (!(await isAdmin())) return setState("not-admin");

    setRows(await listRegistrations());
    setState("ready");
  }, []);

  useEffect(() => {
    // Calling `load` inside a .then() callback, rather than directly in the
    // effect body, keeps its setState calls off the effect's synchronous
    // call stack — the pattern src/lib/useSession.ts already uses.
    Promise.resolve().then(load);
  }, [load]);

  // Computed before any function that closes over it (see exportCsv below):
  // rows/filter exist regardless of `state`, so this is safe to compute on
  // every render, not just the "ready" one.
  const shown = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
    setSent(true);
  }

  async function signOut() {
    await getSupabase()?.auth.signOut();
    setState("signed-out");
    setRows([]);
  }

  async function setStatus(id: string, status: string) {
    if (await updateRegistrationStatus(id, status)) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    }
  }

  async function remove(row: RegistrationRow) {
    const ok = window.confirm(
      `Permanently delete the registration for ${row.student_first} ${row.student_last}? This cannot be undone.`
    );
    if (!ok) return;
    if (await deleteRegistration(row.id)) {
      setRows((rs) => rs.filter((r) => r.id !== row.id));
    }
  }

  function exportCsv() {
    download(
      `vexkan-registrations-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(shown),
      "text/csv;charset=utf-8"
    );
  }

  if (!isCloudConfigured) {
    return <p className="text-muted">Supabase isn&apos;t configured, so there is nothing to show.</p>;
  }

  if (state === "loading") return <p className="text-muted">Loading…</p>;

  if (state === "signed-out") {
    return (
      <form onSubmit={signIn} className="max-w-sm">
        <p className="text-sm text-muted">
          Sign in with the club email address to see registrations.
        </p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@vexkan.ca"
          className="mt-4 w-full rounded-xl border px-3.5 py-2.5"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        />
        <button
          type="submit"
          className="mt-3 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: "var(--purple)" }}
        >
          Email me a sign-in link
        </button>
        {sent && <p className="mt-3 text-sm text-[var(--teal-text)]">Check your inbox for the link.</p>}
      </form>
    );
  }

  if (state === "not-admin") {
    return (
      <div>
        <p className="text-[var(--ink-body)]">
          This account isn&apos;t an administrator, so it can&apos;t see registrations.
        </p>
        <button onClick={signOut} className="mt-4 text-sm font-semibold underline">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <option value="all">All ({rows.length})</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s} ({rows.filter((r) => r.status === s).length})
            </option>
          ))}
        </select>
        <button onClick={exportCsv} className="rounded-xl border px-4 py-2 text-sm font-semibold" style={{ borderColor: "var(--line)" }}>
          Export CSV
        </button>
        <button onClick={() => void load()} className="rounded-xl border px-4 py-2 text-sm font-semibold" style={{ borderColor: "var(--line)" }}>
          Refresh
        </button>
        <button onClick={signOut} className="ml-auto text-sm font-semibold underline">
          Sign out
        </button>
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 text-muted">No registrations yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="text-left">
                {["Received", "Student", "Grade", "Program", "Guardian", "Contact", "Status", ""].map((h) => (
                  <th key={h} className="eyebrow border-b py-2.5 pr-4 text-[var(--muted)]" style={{ borderColor: "var(--line)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="border-b align-top" style={{ borderColor: "var(--line)" }}>
                  <td className="readout py-3 pr-4 text-xs text-muted">{r.created_at.slice(0, 10)}</td>
                  <td className="py-3 pr-4 font-medium">{r.student_first} {r.student_last}</td>
                  <td className="readout py-3 pr-4">{r.student_grade}</td>
                  <td className="py-3 pr-4">{getProgram(r.program_slug)?.shortTitle ?? r.program_slug}</td>
                  <td className="py-3 pr-4">{r.guardian_name}</td>
                  <td className="py-3 pr-4">
                    <a href={`mailto:${r.guardian_email}`} className="block hover:underline">{r.guardian_email}</a>
                    <a href={`tel:${r.guardian_phone}`} className="block text-muted hover:underline">{r.guardian_phone}</a>
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={r.status}
                      onChange={(e) => void setStatus(r.id, e.target.value)}
                      className="rounded-lg border px-2 py-1 text-xs"
                      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3">
                    <button onClick={() => void remove(r)} className="text-xs font-semibold text-[var(--purple-text)] hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shown.some((r) => r.notes) && (
        <div className="mt-10">
          <h3 className="text-base font-semibold">Notes</h3>
          <ul className="mt-3 space-y-3">
            {shown.filter((r) => r.notes).map((r) => (
              <li key={r.id} className="text-sm">
                <span className="font-medium">{r.student_first} {r.student_last}:</span>{" "}
                <span className="text-[var(--ink-body)]">{r.notes}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
