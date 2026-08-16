/**
 * Shapes mirror the planned `members` and `sessions` tables one to one, so the
 * move from the dev store to Postgres is a change of storage and nothing else.
 *
 * There is deliberately no `isPresent` field on Member. Presence is derived
 * from whether the member has an open session; a stored flag drifts out of sync
 * the first time a write half-fails.
 */
/**
 * A class, team, or lesson block. Groups carry a meeting time so the kiosk can
 * put whoever is about to arrive at the top of the screen.
 */
export type Group = {
  id: string;
  name: string;
  /** Weekdays it meets, 0 = Sunday. Empty means no fixed schedule. */
  meetsOn: number[];
  /** Club-local wall clock, "16:30". */
  startsAt: string;
  endsAt: string;
  active: boolean;
  createdAt: string;
};

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  active: boolean;
  /**
   * Groups this member belongs to. A list rather than one id, because a member
   * can be in a lesson block and a competition team at the same time.
   */
  groupIds: string[];
  /** Reserved for face verification. Never populated in this version. */
  faceEmbedding: number[] | null;
  createdAt: string;
};

export type Session = {
  id: string;
  memberId: string;
  signedInAt: string;
  /** Null means the member is still in the room. */
  signedOutAt: string | null;
  /** True when the nightly job closed this rather than a real sign-out tap. */
  autoClosed: boolean;
  /** Reserved for face verification. Every session written now is false. */
  verified: boolean;
  note: string | null;
};

export type KioskState = {
  members: Member[];
  sessions: Session[];
  groups: Group[];
};

/** What one tap produced, so the confirmation can name the person and action. */
export type ToggleResult = {
  action: "in" | "out";
  member: Member;
  session: Session;
};
