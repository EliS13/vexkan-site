import { getSupabase, isCloudConfigured, pullState, pushState } from "./supabase";

/**
 * A tiny localStorage-backed store for useSyncExternalStore.
 *
 * Reading through the store instead of seeding useState avoids the trap where a
 * hydration mismatch leaves React holding the server's empty value, and a
 * persist effect then writes that empty value straight over real saved data.
 * Here localStorage stays the source of truth and is only ever written on an
 * explicit save.
 *
 * When a team is signed in, the same value is mirrored to Supabase so it
 * follows them between devices. Local always wins for speed, the network write
 * happens behind it.
 */
export interface LocalStore {
  subscribe: (cb: () => void) => () => void;
  getSnapshot: () => string;
  getServerSnapshot: () => string;
  write: (value: string) => void;
  /** Pull this key down from the cloud and merge it into what is here. */
  hydrateFromCloud: () => Promise<void>;
}

type Merger = (localValue: string, remoteValue: string) => string;

/** Merge for arrays of objects with an id. Nothing is dropped on either side. */
export function mergeById(localValue: string, remoteValue: string): string {
  try {
    const local = JSON.parse(localValue || "[]");
    const remote = JSON.parse(remoteValue || "[]");
    if (!Array.isArray(local) || !Array.isArray(remote)) return remoteValue || localValue;
    const byId = new Map<string, unknown>();
    remote.forEach((item: { id?: string }) => item?.id && byId.set(item.id, item));
    local.forEach((item: { id?: string }) => item?.id && byId.set(item.id, item));
    return JSON.stringify([...byId.values()]);
  } catch {
    return localValue || remoteValue;
  }
}

/** For plain values like the team name, where merging makes no sense. */
export function preferRemote(localValue: string, remoteValue: string): string {
  return remoteValue || localValue;
}

export function createLocalStore(
  key: string,
  fallbackKeys: string[] = [],
  merge: Merger = mergeById
): LocalStore {
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());

  let pushTimer: ReturnType<typeof setTimeout> | null = null;

  /** Pure read. Falls back to older keys so a rename never orphans data. */
  function readLocal(): string {
    const direct = localStorage.getItem(key);
    if (direct !== null) return direct;
    for (const k of fallbackKeys) {
      const legacy = localStorage.getItem(k);
      if (legacy !== null) return legacy;
    }
    return "";
  }

  return {
    subscribe(cb) {
      listeners.add(cb);
      window.addEventListener("storage", cb);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", cb);
      };
    },
    getSnapshot: readLocal,
    getServerSnapshot() {
      return "";
    },
    write(value) {
      localStorage.setItem(key, value);
      notify();

      if (!isCloudConfigured) return;
      // Debounced, so typing does not fire a request per keystroke.
      if (pushTimer) clearTimeout(pushTimer);
      pushTimer = setTimeout(() => {
        void pushState(key, value).catch(() => {});
      }, 800);
    },
    async hydrateFromCloud() {
      if (!isCloudConfigured) return;
      const sb = getSupabase();
      if (!sb) return;
      const { data } = await sb.auth.getUser();
      if (!data.user) return;

      const remote = await pullState(key);
      if (remote === null) {
        // Nothing saved for this account yet, seed it from this device.
        const local = readLocal();
        if (local) void pushState(key, local).catch(() => {});
        return;
      }

      const merged = merge(readLocal(), remote);
      try {
        localStorage.setItem(key, merged);
      } catch {
        // Out of space. Leave local as it was rather than half-writing.
        throw new Error(`No room in this browser to store ${key}.`);
      }
      notify();
      if (merged !== remote) void pushState(key, merged).catch(() => {});
    },
  };
}

