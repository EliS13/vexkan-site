"use client";

import { useCallback, useState } from "react";
import { postJson } from "@/lib/kiosk/postJson";

/**
 * The lock screen for anybody not on the club's network.
 *
 * On the club wifi the kiosk opens straight onto the roster, because standing
 * in the room is the credential. From anywhere else the roster is a list of
 * children's names, faces and movements, so it asks who is looking: a name,
 * which is written into nothing and only makes the asking deliberate, and the
 * members' code, which is the thing actually checked.
 *
 * Getting through grants reading only. Signing in and out stays pinned to the
 * network however this is answered — a code is not a substitute for being
 * there, and treating it as one would put the whole attendance record behind a
 * secret thirty-seven students know.
 */
export function VisitorGate({ onUnlock }: { onUnlock: (name: string) => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (busy) return;
      setBusy(true);
      setError(null);
      try {
        await postJson("/api/visit", { name: name.trim(), code: code.trim() });
        onUnlock(name.trim());
      } catch (err) {
        setError(err instanceof Error ? err.message : "That code is not right.");
      } finally {
        setBusy(false);
      }
    },
    [busy, code, name, onUnlock],
  );

  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <p className="font-mono text-[11px] tracking-[0.2em] text-[#ffb100] uppercase">
          VexKan sign in
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold">Who&rsquo;s looking?</h1>
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-[#8b949e]">
          You are not on the club&rsquo;s wifi. Enter your name and the club code to see hours,
          badges and awards. Signing in and out only works in the room.
        </p>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          autoComplete="name"
          className="mt-5 min-h-[56px] w-full rounded-xl border-2 border-[#2e343b] bg-[#14171a] px-4 font-serif text-lg"
        />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Club code"
          aria-label="Club code"
          type="password"
          autoComplete="off"
          className="mt-2 min-h-[56px] w-full rounded-xl border-2 border-[#2e343b] bg-[#14171a] px-4 font-mono text-lg tracking-widest"
        />

        {error && (
          <p role="alert" className="mt-3 font-mono text-[11px] text-[#e04f4f]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || name.trim().length === 0 || code.trim().length === 0}
          className="mt-3 min-h-[60px] w-full rounded-2xl bg-[#ffb100] font-serif text-xl font-bold text-[#14171a] disabled:opacity-40"
        >
          {busy ? "Checking…" : "Look around"}
        </button>
      </form>
    </div>
  );
}
