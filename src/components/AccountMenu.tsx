"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { useSession, hydrateAll } from "@/lib/useSession";

function PersonIcon() {
  return (
    <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden fill="none">
      <circle cx="10" cy="6.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.8 17c0-3.3 2.8-5.4 6.2-5.4s6.2 2.1 6.2 5.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AccountMenu() {
  const { session, configured } = useSession();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on an outside click or Escape, the way a menu is expected to behave.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const email = session?.user.email ?? "";
  const initial = email ? email[0]?.toUpperCase() : "";

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={session ? `Account, signed in as ${email}` : "Account"}
        className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-[#efece7]"
        style={
          session
            ? { background: "var(--purple)", borderColor: "var(--purple)", color: "white" }
            : { borderColor: "var(--line)", color: "#525252" }
        }
      >
        {session ? <span className="text-[13px] font-bold">{initial}</span> : <PersonIcon />}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border bg-surface shadow-lg"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="border-b px-4 py-3" style={{ borderColor: "var(--line)" }}>
            {session ? (
              <>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--teal-text)" }}>
                  Signed in
                </p>
                <p className="mt-0.5 truncate text-[13px] font-medium text-foreground">{email}</p>
                <p className="mt-1 text-[11px] leading-snug text-muted">
                  Your notebook and season plan follow you between devices.
                </p>
              </>
            ) : (
              <>
                <p className="eyebrow text-[var(--muted)]">
                  Not signed in
                </p>
                <p className="mt-1 text-[11.5px] leading-snug text-muted">
                  {configured
                    ? "Your work is saving to this browser only. Sign in to keep it across devices."
                    : "Accounts are not switched on yet. Everything saves to this browser."}
                </p>
              </>
            )}
          </div>

          <div className="p-1.5">
            {session ? (
              <>
                <button
                  role="menuitem"
                  onClick={async () => {
                    setStatus("Syncing...");
                    const result = await hydrateAll();
                    setStatus(result.ok ? "Synced." : result.error ?? "Sync failed.");
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium text-[var(--ink-body)] transition-colors hover:bg-[#eae6e0]"
                >
                  Sync now
                </button>
                <Link
                  role="menuitem"
                  href="/guide/account"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--ink-body)] transition-colors hover:bg-[#eae6e0]"
                >
                  Account settings
                </Link>
                <button
                  role="menuitem"
                  onClick={async () => {
                    await getSupabase()?.auth.signOut();
                    setOpen(false);
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors hover:bg-[#eae6e0]"
                  style={{ color: "#b91c1c" }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                role="menuitem"
                href="/guide/account"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-[13px] font-medium transition-colors hover:bg-[#eae6e0]"
                style={{ color: "var(--purple-text)" }}
              >
                {configured ? "Sign in or make an account" : "How to switch accounts on"}
              </Link>
            )}
            {status && <p className="px-3 py-1 text-[11px] text-muted">{status}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
