"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, isCloudConfigured } from "./supabase";
import { getStore, STORE_NAMES } from "./stores";

/** Pulls every synced key down after a sign-in, so a new device fills itself in. */
export async function hydrateAll(): Promise<{ ok: boolean; error?: string }> {
  const results = await Promise.allSettled(
    STORE_NAMES.map((name) => getStore(name).hydrateFromCloud())
  );
  const failed = results.find((r) => r.status === "rejected");
  // Stores notify their own subscribers, this catches anything mounted late.
  window.dispatchEvent(new Event("storage"));
  return failed
    ? { ok: false, error: (failed as PromiseRejectedResult).reason?.message ?? "Sync failed." }
    : { ok: true };
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  // Nothing to wait for when the cloud is not configured.
  const [loading, setLoading] = useState(isCloudConfigured);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;

    let active = true;

    sb.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
      if (data.session) void hydrateAll();
    });

    const { data: sub } = sb.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === "SIGNED_IN") void hydrateAll();
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, loading, configured: isCloudConfigured };
}
