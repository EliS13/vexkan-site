import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Group, KioskState, Member, ToggleResult } from "./types";
import { seedState } from "./seed";
import { openSessionFor } from "./hours";
import * as db from "./supabaseStore";

/**
 * Development storage: one JSON file on disk.
 *
 * This exists so the kiosk can be used and judged before the club's Postgres is
 * provisioned. Every function below is the exact call the database-backed store
 * will expose, so swapping the implementation does not touch the API routes or
 * the UI. It is a single file with a write lock, which is fine for one iPad in
 * one room and is not fine for anything else.
 */

/*
 * Locally this sits in the repo so the data survives restarts and can be
 * inspected. On Vercel the filesystem is read-only apart from /tmp, so writing
 * anywhere else throws and every route 500s.
 *
 * /tmp works, but it is per-instance and cleared between cold starts: sign-ins
 * made on a deployed kiosk will disappear. That is fine for showing people the
 * thing and unacceptable for recording real hours, which is what the Postgres
 * swap is for.
 */
/*
 * The file store is for local development only now.
 *
 * On Vercel /tmp is per-instance and cleared on cold starts, so a member signed
 * up on one request was invisible to the next and the roster read "0 of 0"
 * minutes after someone was added. Deployed, this module delegates to Postgres
 * and the path below is never used.
 */
const DATA_DIR = process.env.VERCEL ? "/tmp/kiosk" : path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "kiosk.json");

/**
 * Serialises read-modify-write cycles. Two taps landing together would
 * otherwise both read the old state and the second write would lose the first.
 */
let queue: Promise<unknown> = Promise.resolve();

function serialise<T>(work: () => Promise<T>): Promise<T> {
  const run = queue.then(work, work);
  // Keep the chain alive even when a caller's promise rejects.
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readState(): Promise<KioskState> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as KioskState;
    if (Array.isArray(parsed.members) && Array.isArray(parsed.sessions) && Array.isArray(parsed.groups)) return parsed;
    throw new Error("malformed");
  } catch {
    // First run, or the file was damaged. Start from the seed rather than
    // leaving the kiosk with an empty roster and no way to sign anyone in.
    const fresh = seedState();
    await writeState(fresh);
    return fresh;
  }
}

async function writeState(state: KioskState): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Write to a temp file and rename, so a crash mid-write cannot leave a
  // half-written roster behind.
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
  await fs.rename(tmp, DATA_FILE);
}

/**
 * State plus the server's clock. The two travel together on purpose: every
 * duration is measured against `now`, and reading the clock separately in a
 * component would both break React's purity rule and let each render disagree
 * about the time. When this moves to Postgres, `now` becomes the database's
 * clock, which is the only one all the iPads can agree on.
 */
/**
 * Refuses to fall back to the file store on Vercel.
 *
 * Silently writing to /tmp there is how the roster came to read "0 of 0" after
 * a successful sign-up: every write appeared to work and every read landed on a
 * different instance. A loud error naming the missing variable is far better
 * than a kiosk that quietly forgets people.
 */
function writesToDatabase(): boolean {
  if (db.isSupabaseConfigured()) return true;
  if (process.env.VERCEL) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set, so there is nowhere durable to save. " +
        "Set it and SUPABASE_URL in the project's environment variables.",
    );
  }
  return false;
}

export function getState(): Promise<KioskState & { now: number }> {
  if (writesToDatabase()) return db.getState();
  return serialise(async () => ({ ...(await readState()), now: Date.now() }));
}

/**
 * Signs a member out. This is the one action a plain tap can take.
 *
 * Signing *in* goes through the camera (or an organizer passcode override) and lands
 * in signInMembers, because an unverified tap would let anyone credit hours to
 * anyone. Signing out is left deliberately frictionless: the risk of a member
 * ending someone else's session is a nuisance, not a falsified record, and
 * making people queue for a camera on the way out the door would just mean
 * nobody signs out at all.
 */
export function signOutMember(memberId: string, now: Date = new Date()): Promise<ToggleResult> {
  if (writesToDatabase()) return db.signOutMember(memberId, now);
  return serialise(async () => {
    const state = await readState();
    const member = state.members.find((m) => m.id === memberId);
    if (!member) throw new Error(`no such member: ${memberId}`);
    if (!member.active) throw new Error(`member is deactivated: ${memberId}`);

    const stamp = now.toISOString();
    const open = state.sessions.filter((s) => s.memberId === memberId && s.signedOutAt === null);

    if (open.length === 0) {
      throw new Error(`${member.firstName} is not signed in.`);
    }

    // Newest open session is the real visit; anything older is a duplicate that
    // should never have existed, so it is closed and flagged rather than left
    // to inflate the member's hours forever.
    const sorted = [...open].sort((a, b) => Date.parse(b.signedInAt) - Date.parse(a.signedInAt));
    const [current, ...strays] = sorted;
    current.signedOutAt = stamp;
    for (const stray of strays) {
      stray.signedOutAt = stamp;
      stray.autoClosed = true;
      stray.note = "Closed automatically: a duplicate open session.";
    }
    await writeState(state);
    return { action: "out" as const, member, session: current };
  });
}

/**
 * Adds a member. A photo is required — a tile with no face on it cannot be
 * found across a room, and a member with no photo can never be enrolled for
 * camera sign-in.
 */
export function addMember(input: {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  groupIds?: string[];
}): Promise<Member> {
  if (writesToDatabase()) return db.addMember(input);
  return serialise(async () => {
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    if (!firstName || !lastName) throw new Error("A first and last name are both required.");

    const state = await readState();
    const known = new Set(state.groups.filter((g) => g.active).map((g) => g.id));
    const member: Member = {
      id: randomUUID(),
      firstName,
      lastName,
      photoUrl: input.photoUrl ?? null,
      active: true,
      groupIds: [...new Set(input.groupIds ?? [])].filter((id) => known.has(id)),
      // Stays null on purpose. Templates live on the iPad, not in the database,
      // until written parent consent is in place. See faceStore.ts.
      faceEmbedding: null,
      createdAt: new Date().toISOString(),
    };
    state.members.push(member);
    await writeState(state);
    return member;
  });
}

/**
 * Signs several members in at once, from one camera frame.
 *
 * Members already in the room are skipped rather than re-opened, so pointing
 * the camera at the room twice does not double anyone's hours or strand an
 * earlier session. `verified` records that a face confirmed this, which is what
 * lets an organizer tell camera sign-ins from passcode overrides later.
 */
export function signInMembers(
  memberIds: string[],
  options: { verified: boolean; note?: string | null },
  now: Date = new Date(),
): Promise<{ signedIn: Member[]; alreadyIn: Member[] }> {
  if (writesToDatabase()) return db.signInMembers(memberIds, options, now);
  return serialise(async () => {
    const state = await readState();
    const stamp = now.toISOString();
    const signedIn: Member[] = [];
    const alreadyIn: Member[] = [];

    for (const memberId of new Set(memberIds)) {
      const member = state.members.find((m) => m.id === memberId);
      if (!member || !member.active) continue;

      if (state.sessions.some((s) => s.memberId === memberId && s.signedOutAt === null)) {
        alreadyIn.push(member);
        continue;
      }
      state.sessions.push({
        id: randomUUID(),
        memberId,
        signedInAt: stamp,
        signedOutAt: null,
        autoClosed: false,
        verified: options.verified,
        note: options.note ?? null,
      });
      signedIn.push(member);
    }

    if (signedIn.length > 0) await writeState(state);
    return { signedIn, alreadyIn };
  });
}

/* -------------------------------------------------------------------- admin */

export function createGroup(input: {
  name: string;
  meetsOn: number[];
  startsAt: string;
  endsAt: string;
}): Promise<Group> {
  if (writesToDatabase()) return db.createGroup(input);
  return serialise(async () => {
    const name = input.name.trim();
    if (!name) throw new Error("A group needs a name.");

    const state = await readState();
    const group: Group = {
      id: randomUUID(),
      name,
      meetsOn: [...new Set(input.meetsOn)].filter((d) => d >= 0 && d <= 6).sort(),
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      active: true,
      createdAt: new Date().toISOString(),
    };
    state.groups.push(group);
    await writeState(state);
    return group;
  });
}

/**
 * Retires a group. Deactivated rather than spliced out, because sessions and
 * members reference it and a hard delete would orphan that history. Members
 * keep their other groups and simply stop being listed under this one.
 */
export function deleteGroup(groupId: string): Promise<void> {
  if (writesToDatabase()) return db.deleteGroup(groupId);
  return serialise(async () => {
    const state = await readState();
    const group = state.groups.find((g) => g.id === groupId);
    if (!group) throw new Error("No such group.");

    group.active = false;
    for (const member of state.members) {
      member.groupIds = member.groupIds.filter((id) => id !== groupId);
    }
    await writeState(state);
  });
}

/**
 * Gives an existing member a photograph.
 *
 * Members imported from the old system arrive with names and history but no
 * picture, and a tile with no face cannot be found across a room. This is the
 * path that fixes that, without going through sign-up and creating a duplicate.
 */
export function setMemberPhoto(memberId: string, photoUrl: string): Promise<Member> {
  if (writesToDatabase()) return db.setMemberPhoto(memberId, photoUrl);
  return serialise(async () => {
    const state = await readState();
    const member = state.members.find((m) => m.id === memberId);
    if (!member) throw new Error("No such member.");
    member.photoUrl = photoUrl;
    await writeState(state);
    return member;
  });
}

/** Replaces a member's group membership outright. */
export function setMemberGroups(memberId: string, groupIds: string[]): Promise<Member> {
  if (writesToDatabase()) return db.setMemberGroups(memberId, groupIds);
  return serialise(async () => {
    const state = await readState();
    const member = state.members.find((m) => m.id === memberId);
    if (!member) throw new Error("No such member.");

    const known = new Set(state.groups.filter((g) => g.active).map((g) => g.id));
    member.groupIds = [...new Set(groupIds)].filter((id) => known.has(id));
    await writeState(state);
    return member;
  });
}

/**
 * Takes a member off the kiosk without destroying their hours.
 *
 * Never a hard delete: the brief is explicit that removing a member would
 * orphan their session history, and those hours are the whole record. An open
 * session is closed first so a deactivated member cannot sit in the room count
 * forever.
 */
export function setMemberActive(
  memberId: string,
  active: boolean,
  now: Date = new Date(),
): Promise<Member> {
  if (writesToDatabase()) return db.setMemberActive(memberId, active, now);
  return serialise(async () => {
    const state = await readState();
    const member = state.members.find((m) => m.id === memberId);
    if (!member) throw new Error("No such member.");

    member.active = active;
    if (!active) {
      for (const session of state.sessions) {
        if (session.memberId === memberId && session.signedOutAt === null) {
          session.signedOutAt = now.toISOString();
          session.autoClosed = true;
          session.note = "Closed automatically: member was deactivated.";
        }
      }
    }
    await writeState(state);
    return member;
  });
}

/** Closes every open session. Stands in for the nightly cron until it is built. */
export function closeAllOpen(now: Date = new Date()): Promise<number> {
  if (writesToDatabase()) return db.closeAllOpen(now);
  return serialise(async () => {
    const state = await readState();
    const open = state.sessions.filter((s) => s.signedOutAt === null);
    for (const session of open) {
      session.signedOutAt = now.toISOString();
      session.autoClosed = true;
      session.note = "Closed automatically at the end of the day.";
    }
    if (open.length > 0) await writeState(state);
    return open.length;
  });
}

/** Test and demo helper. Throws away all sessions and restores the fake roster. */
export function resetToSeed(): Promise<KioskState> {
  return serialise(async () => {
    const fresh = seedState();
    await writeState(fresh);
    return fresh;
  });
}

export { openSessionFor };
