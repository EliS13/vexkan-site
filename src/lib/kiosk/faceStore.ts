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

const KEY = "vexkan.kiosk.faces.v1";

type Stored = Record<string, number[][]>;

function read(): Stored {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Stored) : {};
  } catch {
    return {};
  }
}

function write(data: Stored): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

/** Every enrolled member on this device, in the shape the matcher wants. */
export function loadEnrolled(): EnrolledFace[] {
  return Object.entries(read()).map(([memberId, descriptors]) => ({ memberId, descriptors }));
}

export function descriptorsFor(memberId: string): number[][] {
  return read()[memberId] ?? [];
}

export function isEnrolled(memberId: string): boolean {
  return descriptorsFor(memberId).length > 0;
}

/** Replaces a member's templates outright, so re-enrolling never mixes old angles with new. */
export function saveDescriptors(memberId: string, descriptors: number[][]): void {
  const data = read();
  data[memberId] = descriptors;
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
