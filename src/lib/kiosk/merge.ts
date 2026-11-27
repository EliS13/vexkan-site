import type { Member, Session } from "./types";
import { totalMsFor } from "./hours";

/**
 * Folding a duplicate roster record into the real one.
 *
 * Somebody enrolled twice ends up with their hours split across two tiles, and
 * neither tile shows the truth. Merging moves every visit onto one record and
 * deactivates the other (never deletes it, the same rule as Deactivate).
 *
 * The record kept is the one with more hours, so the account people already
 * know, with its history, badges and photo, is the one that survives.
 */
export function chooseMergeTarget(
  a: Member,
  b: Member,
  sessions: Session[],
  now: number,
): { keep: Member; fold: Member } {
  const aMs = totalMsFor(sessions, a.id, now);
  const bMs = totalMsFor(sessions, b.id, now);
  // A tie keeps the older record.
  if (aMs > bMs || (aMs === bMs && a.createdAt <= b.createdAt)) return { keep: a, fold: b };
  return { keep: b, fold: a };
}

/**
 * The kept record after the merge: its own name and photo, the other's photo or
 * face scan only where it has none, and the groups of both.
 */
export function mergedFields(keep: Member, fold: Member): Pick<Member, "photoUrl" | "faceEmbedding" | "groupIds"> {
  return {
    photoUrl: keep.photoUrl ?? fold.photoUrl,
    faceEmbedding: keep.faceEmbedding ?? fold.faceEmbedding,
    groupIds: [...new Set([...keep.groupIds, ...fold.groupIds])],
  };
}

export const MERGED_NOTE = "Closed automatically: merged into another roster record that was already signed in.";
