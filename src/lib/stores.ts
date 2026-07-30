import { createLocalStore, LocalStore, mergeById, preferRemote } from "./localStore";

/**
 * Every persisted key, declared once.
 *
 * Two things depend on getting this right. Components need the legacy
 * `fallbackKeys` so a rename never orphans saved work, and cloud sync needs the
 * same fallbacks, or signing in would write a fresh empty value over the key a
 * team's older entries were hiding behind. Declaring them in two places is how
 * that bug happens, so there is only one place.
 *
 * Instances are memoised because a store owns its listener set and its pending
 * push timer. Two instances for one key means notifications that reach half the
 * subscribers and debounced writes that race each other.
 */
const CONFIG = {
  notebookEntries: {
    key: "vex-notebook-entries-v3",
    fallbackKeys: ["vex-notebook-entries-v2", "vex-notebook-entries"],
    merge: mergeById,
  },
  team: {
    key: "vex-notebook-team",
    fallbackKeys: [],
    // A plain string, so there is nothing to merge by id.
    merge: preferRemote,
  },
  seasonPlan: {
    key: "vex-season-plan-v1",
    fallbackKeys: [],
    merge: mergeById,
  },
  recentQuestions: {
    key: "vex-recent-questions-v1",
    fallbackKeys: [],
    merge: mergeById,
  },
} as const;

export type StoreName = keyof typeof CONFIG;

const instances = new Map<StoreName, LocalStore>();

export function getStore(name: StoreName): LocalStore {
  const existing = instances.get(name);
  if (existing) return existing;
  const cfg = CONFIG[name];
  const store = createLocalStore(cfg.key, [...cfg.fallbackKeys], cfg.merge);
  instances.set(name, store);
  return store;
}

export const STORE_NAMES = Object.keys(CONFIG) as StoreName[];
