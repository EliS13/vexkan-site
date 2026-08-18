"use client";

import type { EnrolledFace } from "./matching";

/**
 * Where face descriptors live: this iPad, and nowhere else.
 *
 * The brief's position is that storing biometric templates for minors
 * server-side is a decision that needs written parent consent in place first,
 * so `members.face_embedding` stays null and the templates sit in the kiosk
 * device's own storage instead. Deleting the app's site data on the iPad
 * destroys every template, which is the retention story the consent policy
 * needs to be able to promise.
 *
 * The consequence to be aware of: enrollment is per-device. A second iPad, or
 * a wiped one, starts with an empty set and members must be re-enrolled.
 */

/**
 * Version 2 keeps the member's name beside the descriptors.
 *
 * Version 1 keyed everything by member id alone, which turned out to be a key
 * that moves: the roster was rebuilt in Postgres and every member came back
 * with a new id, so every template on the iPad pointed at somebody who no
 * longer existed. The group photo then reported that nobody had ever been
 * enrolled, when in fact everybody had. A name survives that, so an id change
 * can be repaired instead of being re-enrolled one face at a time.
 *
 * Both versions are read from the same key. A v1 entry is a bare array of
 * descriptors and is upgraded in place the first time the roster confirms who
 * it belongs to.
 */
const KEY = "vexkan.kiosk.faces.v1";

/** What a member's templates are stored as. `name` is "" for un-upgraded v1 rows. */
export type Entry = { name: string; descriptors: number[][] };
type Stored = Record<string, Entry>;
/** On disk a value is either a v2 entry or a v1 bare descriptor list. */
type StoredRaw = Record<string, Entry | number[][]>;

/** Who the store may be reconciled against. The roster, minus everything else. */
export type Person = { id: string; firstName: string; lastName: string };

/** Compared folded and trimmed, so "  Ada  Lovelace" and "ada lovelace" are one person. */
export function personKey(person: { firstName: string; lastName: string }): string {
  return `${person.firstName} ${person.lastName}`.trim().toLowerCase().replace(/\s+/g, " ");
}

function read(): Stored {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredRaw;
    const out: Stored = {};
    for (const [id, value] of Object.entries(parsed)) {
      // A v1 row: descriptors with nothing to identify them but the id.
      if (Array.isArray(value)) out[id] = { name: "", descriptors: value };
      else if (value && Array.isArray(value.descriptors)) out[id] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function write(data: Stored): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

/** What the store looks like once it has been squared against the roster. */
export type Reconciled = {
  /** Templates belonging to somebody currently on the roster. */
  enrolled: EnrolledFace[];
  /**
   * Templates that match nobody, returned whole rather than counted, because
   * they are what the photo match works on. Kept rather than deleted: a roster
   * that failed to load is indistinguishable from a roster where everybody
   * left, and throwing away every face on the iPad because of a bad fetch is
   * not a mistake that can be undone.
   */
  orphaned: EnrolledFace[];
};

/**
 * Squares what is on the iPad against who is actually on the roster.
 *
 * Templates whose id still exists are used as they are. Templates whose id has
 * gone are re-linked by name and rewritten under the new id, which is what
 * makes the roster being rebuilt survivable. A name held by two members
 * re-links neither of them — a face attached to the wrong person signs the
 * wrong person in, and that is worse than asking those two to enroll again.
 */
export function relink(
  stored: Stored,
  members: Person[],
): { next: Stored; changed: boolean; result: Reconciled } {
  const byId = new Map(members.map((m) => [m.id, m]));

  /** Name to id, but only for names exactly one member holds. */
  const byName = new Map<string, string | null>();
  for (const m of members) {
    const key = personKey(m);
    byName.set(key, byName.has(key) ? null : m.id);
  }

  const next: Stored = {};
  const enrolled: EnrolledFace[] = [];
  const orphaned: EnrolledFace[] = [];
  let changed = false;

  for (const [id, entry] of Object.entries(stored)) {
    const member = byId.get(id);
    if (member) {
      /* Still theirs. Stamp the name on while the roster is here to confirm
         it, so the next id change repairs itself instead of asking. */
      const name = personKey(member);
      if (entry.name !== name) changed = true;
      next[id] = { name, descriptors: entry.descriptors };
      enrolled.push({ memberId: id, descriptors: entry.descriptors });
      continue;
    }

    const movedTo = entry.name ? byName.get(entry.name) : undefined;
    if (movedTo && !next[movedTo]) {
      next[movedTo] = { name: entry.name, descriptors: entry.descriptors };
      enrolled.push({ memberId: movedTo, descriptors: entry.descriptors });
      changed = true;
      continue;
    }

    next[id] = entry;
    orphaned.push({ memberId: id, descriptors: entry.descriptors });
  }

  return { next, changed, result: { enrolled, orphaned } };
}

/** relink, against the real store. Writes back only when something moved. */
export function reconcile(members: Person[]): Reconciled {
  const { next, changed, result } = relink(read(), members);
  if (changed) write(next);
  return result;
}

/**
 * Hands an orphaned template to the member a photo match placed it with.
 *
 * The name goes on at the same time, which is the point: once a template
 * carries the name of the person it belongs to, the next time ids move it is
 * repaired by `relink` without anybody's photograph being read at all.
 */
export function adopt(links: { orphanId: string; member: Person }[]): number {
  if (links.length === 0) return 0;
  const data = read();
  let moved = 0;
  for (const { orphanId, member } of links) {
    const entry = data[orphanId];
    if (!entry) continue;
    delete data[orphanId];
    data[member.id] = { name: personKey(member), descriptors: entry.descriptors };
    moved++;
  }
  if (moved > 0) write(data);
  return moved;
}

/** Every enrolled member on this device, in the shape the matcher wants. */
export function loadEnrolled(): EnrolledFace[] {
  return Object.entries(read()).map(([memberId, entry]) => ({
    memberId,
    descriptors: entry.descriptors,
  }));
}

export function descriptorsFor(memberId: string): number[][] {
  return read()[memberId]?.descriptors ?? [];
}

export function isEnrolled(memberId: string): boolean {
  return descriptorsFor(memberId).length > 0;
}

/** Replaces a member's templates outright, so re-enrolling never mixes old angles with new. */
export function saveDescriptors(member: Person, descriptors: number[][]): void {
  const data = read();
  data[member.id] = { name: personKey(member), descriptors };
  write(data);
}

export function forgetMember(memberId: string): void {
  const data = read();
  delete data[memberId];
  write(data);
}

/** Wipes every template on this device. Backs the deletion half of a retention policy. */
export function forgetEveryone(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function enrolledCount(): number {
  return Object.keys(read()).length;
}
