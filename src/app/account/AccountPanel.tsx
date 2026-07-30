"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useSession, hydrateAll } from "@/lib/useSession";

const inputClass = "w-full rounded-lg border px-3 py-2 text-sm";

export function AccountPanel() {
  const { session, loading, configured } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  if (!configured) {
    return (
      <div className="rounded-xl border p-5" style={{ borderColor: "var(--line)" }}>
        <p className="eyebrow text-[var(--muted)]">
          Accounts are not switched on yet
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-body)]">
          Everything still works. Your notebook, season plan, and recent questions save in this
          browser, and the backup file on the notebook page moves them between computers.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          To turn sign-in on, create a free Supabase project, run the SQL in{" "}
          <code className="rounded bg-[#eae6e0] px-1 py-0.5 text-[12px]">
            supabase/migrations/0001_init.sql
          </code>
          , then add your project URL and anon key to{" "}
          <code className="rounded bg-[#eae6e0] px-1 py-0.5 text-[12px]">.env.local</code>. The
          README has the exact steps.
        </p>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-muted">Checking your session...</p>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    setStatus("");

    const fn =
      mode === "in"
        ? sb.auth.signInWithPassword({ email, password })
        : sb.auth.signUp({ email, password });
    const { error } = await fn;

    setBusy(false);
    if (error) {
      setStatus(error.message);
      return;
    }
    if (mode === "up") {
      setStatus("Account made. Check your email if confirmation is switched on, then sign in.");
      setMode("in");
    } else {
      setStatus("Signed in. Pulling your saved work down...");
      const result = await hydrateAll();
      setStatus(result.ok ? "Signed in and synced." : result.error ?? "Signed in, but sync failed.");
    }
  }

  if (session) {
    return (
      <div className="space-y-4">
        <div
          className="rounded-xl border p-5"
          style={{ borderColor: "var(--teal)", background: "var(--teal-bg)" }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--teal-text)" }}>
            Signed in
          </p>
          <p className="mt-1 font-serif text-lg font-semibold text-foreground">
            {session.user.email}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-body)]">
            Your notebook, season plan, and recent questions now follow you to any computer you sign
            in on. They still save in this browser first, so the tools keep working if the network
            drops.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              setStatus("Syncing...");
              const result = await hydrateAll();
              setStatus(result.ok ? "Synced." : result.error ?? "Sync failed.");
            }}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--teal)" }}
          >
            Sync now
          </button>
          <button
            onClick={async () => {
              await getSupabase()?.auth.signOut();
              setStatus("Signed out. What is on this device stays on this device.");
            }}
            className="rounded-lg border px-4 py-2 text-sm font-semibold text-[var(--ink-body)] transition-colors hover:bg-[#efece7]"
            style={{ borderColor: "var(--line)" }}
          >
            Sign out
          </button>
        </div>
        {status && <p className="text-xs text-muted">{status}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border p-5" style={{ borderColor: "var(--line)" }}>
      <div className="flex gap-2">
        {(["in", "up"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
            style={
              mode === m
                ? { background: "var(--purple)", color: "white" }
                : { background: "var(--purple-bg)", color: "var(--purple-text)" }
            }
          >
            {m === "in" ? "Sign in" : "Make an account"}
          </button>
        ))}
      </div>

      <input
        type="email"
        required
        aria-label="Email"
        autoComplete="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
        style={{ borderColor: "var(--line)" }}
      />
      <input
        type="password"
        required
        minLength={8}
        aria-label="Password"
        autoComplete={mode === "in" ? "current-password" : "new-password"}
        placeholder="Password, at least 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputClass}
        style={{ borderColor: "var(--line)" }}
      />
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: "var(--purple)" }}
      >
        {busy ? "Working..." : mode === "in" ? "Sign in" : "Make an account"}
      </button>
      {status && <p className="text-xs text-muted">{status}</p>}
      <p className="text-[11px] leading-relaxed text-muted">
        One account per team is usually easier than one per person, since a notebook belongs to the
        team. Do not reuse a password from anywhere else.
      </p>
    </form>
  );
}
