/**
 * Deciding who a detected face belongs to.
 *
 * This is the accuracy-critical part of the kiosk, and it is deliberately
 * pessimistic. Matching one face against a whole roster is a harder problem
 * than confirming one claimed identity, and its failure mode is silent: a wrong
 * match credits a member's hours to somebody else and nobody notices. So every
 * rule below is built to refuse rather than guess.
 *
 * Four defences, in order of how much they matter:
 *
 *  1. Several descriptors per member, not one. A member enrolled from five
 *     angles is matched against their closest stored angle, which is what makes
 *     a real room's lighting and head turns survivable.
 *  2. A stricter distance than the conventional 0.6. That number is for
 *     one-to-one confirmation; against N candidates the chance that somebody
 *     unrelated falls inside it grows with the roster.
 *  3. A margin between best and runner-up. A face that is nearly as close to
 *     two members is not a match, it is a coin toss — siblings especially.
 *  4. Quality gates before any of the above. A face 30 pixels wide at the edge
 *     of the frame should never reach the matcher at all.
 *
 * Pure functions on plain arrays, so all of it is testable without a camera.
 */

/** Conventional same-person cutoff for this recognition net is 0.6. */
export const VERIFY_DISTANCE = 0.6;

/**
 * Tighter than the 0.6 one-to-one convention, because identification searches
 * the whole roster and every extra member is another chance for a stranger to
 * land inside it. Loosened from 0.5 after real use: it was refusing the person
 * standing directly in front of the camera. The margin below is what still
 * catches lookalikes, and it does that better than a hard cutoff does.
 */
export const IDENTIFY_DISTANCE = 0.56;

/**
 * How much closer the winner must be than the runner-up. Below this the two
 * candidates are not distinguishable and the answer is "ask a human".
 */
export const MIN_MARGIN = 0.06;

/** Detector confidence below this is not worth matching. */
export const MIN_DETECTION_SCORE = 0.7;

/** A face smaller than this carries too little detail for a reliable descriptor. */
export const MIN_FACE_PX = 80;

export type EnrolledFace = {
  memberId: string;
  /** One per enrollment capture. More angles means more tolerance. */
  descriptors: number[][];
};

export type Decision = "accept" | "ambiguous" | "unknown";

export type MatchResult = {
  memberId: string | null;
  distance: number;
  /** Distance to the next-closest *different* member, or null if there isn't one. */
  runnerUp: number | null;
  runnerUpMemberId: string | null;
  decision: Decision;
};

export function euclidean(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error("descriptor lengths differ");
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/** Closest of a member's enrolled angles. */
export function distanceToMember(descriptor: number[], face: EnrolledFace): number {
  let best = Infinity;
  for (const enrolled of face.descriptors) {
    const d = euclidean(descriptor, enrolled);
    if (d < best) best = d;
  }
  return best;
}

/**
 * Who this face is, or an honest refusal.
 *
 * `accept` only when the winner is inside the identification threshold *and*
 * clearly ahead of the runner-up. Anything close is `ambiguous`, which the UI
 * must route to a human rather than resolve on its own.
 */
export function identify(
  descriptor: number[],
  roster: EnrolledFace[],
  options: { threshold?: number; margin?: number } = {},
): MatchResult {
  const threshold = options.threshold ?? IDENTIFY_DISTANCE;
  const margin = options.margin ?? MIN_MARGIN;

  const scored = roster
    .filter((face) => face.descriptors.length > 0)
    .map((face) => ({ memberId: face.memberId, distance: distanceToMember(descriptor, face) }))
    .sort((a, b) => a.distance - b.distance);

  if (scored.length === 0) {
    return {
      memberId: null,
      distance: Infinity,
      runnerUp: null,
      runnerUpMemberId: null,
      decision: "unknown",
    };
  }

  const [best, second] = scored;
  const base = {
    distance: best.distance,
    runnerUp: second?.distance ?? null,
    runnerUpMemberId: second?.memberId ?? null,
  };

  if (best.distance > threshold) {
    return { ...base, memberId: null, decision: "unknown" };
  }
  if (second && second.distance - best.distance < margin) {
    // Close enough to two people that picking one would be a guess.
    return { ...base, memberId: best.memberId, decision: "ambiguous" };
  }
  return { ...base, memberId: best.memberId, decision: "accept" };
}

export type DetectionQuality = {
  score: number;
  box: { x: number; y: number; width: number; height: number };
};

export type QualityVerdict = { ok: true } | { ok: false; reason: string };

/**
 * Gate a detection before it reaches the matcher. A face that is tiny, blurry
 * enough to score low, or half outside the frame produces a descriptor that is
 * confidently wrong, which is worse than no descriptor at all.
 */
export function checkQuality(
  detection: DetectionQuality,
  frame: { width: number; height: number },
  minPx: number = MIN_FACE_PX,
  options: { allowEdge?: boolean } = {},
): QualityVerdict {
  if (detection.score < MIN_DETECTION_SCORE) {
    return { ok: false, reason: "Not clearly a face" };
  }
  const { x, y, width, height } = detection.box;
  if (Math.min(width, height) < minPx) {
    return { ok: false, reason: "Too far from the camera" };
  }
  /*
   * Skipped when one person is confirming their own tile. Standing close enough
   * to fill the frame — which is exactly what you do at a kiosk — puts the
   * detection box over an edge, and rejecting that told members holding the iPad
   * at arm's length that their face was "partly out of frame" while it filled
   * the screen. Group shots keep the check, where a half-visible face at the
   * edge really is someone walking past.
   */
  if (!options.allowEdge && (x < 0 || y < 0 || x + width > frame.width || y + height > frame.height)) {
    return { ok: false, reason: "Partly out of frame" };
  }
  return { ok: true };
}

/**
 * Agreement across several frames.
 *
 * One frame can catch a blink or a turned head. Requiring the same answer from
 * a majority of frames removes most of that, and costs only the second or two
 * the camera is already open.
 */
export function voteAcrossFrames(
  results: MatchResult[],
  minAgreeing = 2,
): { memberId: string | null; decision: Decision; agreeing: number } {
  const accepted = results.filter((r) => r.decision === "accept" && r.memberId);
  if (accepted.length === 0) {
    // Nothing was ever confidently matched, but if frames disagreed on *who*,
    // that is ambiguity rather than an unknown face.
    const sawAmbiguous = results.some((r) => r.decision === "ambiguous");
    return {
      memberId: null,
      decision: sawAmbiguous ? "ambiguous" : "unknown",
      agreeing: 0,
    };
  }

  const tally = new Map<string, number>();
  for (const r of accepted) tally.set(r.memberId!, (tally.get(r.memberId!) ?? 0) + 1);

  const ranked = [...tally.entries()].sort((a, b) => b[1] - a[1]);
  const [winnerId, count] = ranked[0];

  // Frames that confidently disagreed with each other are not evidence.
  if (ranked.length > 1 && ranked[1][1] === count) {
    return { memberId: null, decision: "ambiguous", agreeing: count };
  }
  if (count < minAgreeing) {
    return { memberId: winnerId, decision: "ambiguous", agreeing: count };
  }
  return { memberId: winnerId, decision: "accept", agreeing: count };
}
