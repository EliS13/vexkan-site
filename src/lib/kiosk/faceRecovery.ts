"use client";

import { detectOne } from "./face";
import { identify, type EnrolledFace } from "./matching";

/**
 * Putting orphaned face templates back on the right people.
 *
 * When the roster was rebuilt in Postgres every member came back with a new
 * id, and the templates on the iPad are keyed by the old one. From version 2
 * of the store a name travels with the descriptors and the repair is exact,
 * but the templates saved before that have nothing to match on but the faces
 * themselves — and re-enrolling a whole club is five captures a head.
 *
 * There is one thing left that ties a member to their face: the photograph
 * taken when they signed up, which lives on their row and is not a biometric
 * template but a picture. Reading a descriptor out of that photo gives a
 * known-good sample of each member, and the orphaned templates can be matched
 * against it with the same rules that match a face at the camera.
 */

/** One orphaned template set, keyed by the id it was saved under. */
export type Orphan = EnrolledFace;

/** A member's face as read from their own sign-up photograph. */
export type PhotoFace = { memberId: string; descriptor: number[] };

export type Link = { orphanId: string; memberId: string; distance: number };

/**
 * Decides which orphan belongs to whom, and refuses every close call.
 *
 * Two refusals, both deliberate. `identify` already declines when the best
 * match is not clearly better than the runner-up, so an orphan that could be
 * either of two people is left alone. On top of that, an orphan claimed by two
 * different members is dropped even if each claim looked clean on its own —
 * one of them is wrong, and there is no way to tell which.
 *
 * The cost of refusing is that somebody enrolls again. The cost of guessing is
 * a face that signs the wrong child into the room, which is not a trade worth
 * making for a minute of somebody's time.
 */
export function planRecovery(
  orphans: Orphan[],
  photos: PhotoFace[],
): { links: Link[]; contested: number } {
  const claims = new Map<string, Link[]>();

  for (const photo of photos) {
    const match = identify(photo.descriptor, orphans);
    if (match.decision !== "accept" || !match.memberId) continue;
    const existing = claims.get(match.memberId) ?? [];
    existing.push({ orphanId: match.memberId, memberId: photo.memberId, distance: match.distance });
    claims.set(match.memberId, existing);
  }

  const links: Link[] = [];
  let contested = 0;
  for (const [, forOrphan] of claims) {
    if (forOrphan.length === 1) links.push(forOrphan[0]);
    else contested++;
  }
  return { links, contested };
}

/**
 * A face descriptor read from a member's sign-up photograph.
 *
 * The photo is a data: URL on the member's row, so this never leaves the
 * device and no cross-origin canvas rules apply. Returns null when the picture
 * has no readable face in it — an old crop, or one taken too dark — and the
 * caller treats that member as simply not recoverable this way.
 */
export async function descriptorFromPhoto(photoUrl: string): Promise<number[] | null> {
  const image = await loadImage(photoUrl);
  if (!image) return null;
  try {
    /*
     * allowEdge because a sign-up photo is already cropped tight to the face,
     * so every one of them touches the frame's edge by definition.
     */
    const { face } = await detectOne(image, { allowEdge: true });
    return face ? face.descriptor : null;
  } catch {
    return null;
  }
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}
