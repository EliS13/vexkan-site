import type { Group, KioskState, Member, Session } from "./types";

/**
 * Postgres-backed storage, via Supabase's REST endpoint.
 *
 * This replaces the JSON file, which on Vercel lived in /tmp: per-instance and
 * cleared on cold starts, so a member signed up on one request was invisible to
 * the next and the roster read "0 of 0" minutes later.
 *
 * Reached with the service role key from server routes only. That key bypasses
 * row level security, which is why the migration defines no policies at all —
 * the anon key the club site ships to browsers can touch nothing here.
 *
 * Plain fetch rather than @supabase/supabase-js: this needs six queries, and
 * the REST shape is stable and easier to see the intent of than a query builder
 * would be here.
 */

function config(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export function isSupabaseConfigured(): boolean {
  return config() !== null;
}

/**
 * Percent-encodes a value going into a REST filter.
 *
 * An id with a stray character produces a URL that fetch rejects outright, and
 * Safari words that rejection as "the string did not match the expected
 * pattern" — which says nothing about where it came from. Encoding removes the
 * class of failure entirely.
 */
function q(value: string): string {
  return encodeURIComponent(value);
}

async function rest(path: string, init: RequestInit = {}): Promise<unknown> {
  const cfg = config();
  if (!cfg) throw new Error("Supabase is not configured.");

  const res = await fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    // Attendance is live by definition; a cached read would show a stale room.
    cache: "no-store",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Supabase ${res.status}: ${detail.slice(0, 200)}`);
  }

  /*
   * A write without Prefer: return=representation answers 201 with an empty
   * body, and res.json() on nothing throws "Unexpected end of JSON input" —
   * which surfaced as an intermittent 500 on sign-in. Intermittent because
   * inserting a session crashed while finding somebody already signed in, which
   * inserts nothing, did not.
   */
  const text = await res.text();
  return text.length === 0 ? null : JSON.parse(text);
}

/* ------------------------------------------------------------ row mapping */

type GroupRow = {
  id: string; name: string; meets_on: number[]; starts_at: string;
  ends_at: string; active: boolean; created_at: string;
};
type MemberRow = {
  id: string; first_name: string; last_name: string; photo_url: string | null;
  active: boolean; group_ids: string[]; face_embedding: number[] | null; created_at: string;
};
type SessionRow = {
  id: string; member_id: string; signed_in_at: string; signed_out_at: string | null;
  auto_closed: boolean; verified: boolean; note: string | null;
};

const toGroup = (r: GroupRow): Group => ({
  id: r.id, name: r.name, meetsOn: r.meets_on ?? [], startsAt: r.starts_at,
  endsAt: r.ends_at, active: r.active, createdAt: r.created_at,
});
const toMember = (r: MemberRow): Member => ({
  id: r.id, firstName: r.first_name, lastName: r.last_name, photoUrl: r.photo_url,
  active: r.active, groupIds: r.group_ids ?? [], faceEmbedding: r.face_embedding,
  createdAt: r.created_at,
});
const toSession = (r: SessionRow): Session => ({
  id: r.id, memberId: r.member_id, signedInAt: r.signed_in_at,
  signedOutAt: r.signed_out_at, autoClosed: r.auto_closed, verified: r.verified,
  note: r.note,
});

/* ----------------------------------------------------------------- reads */

export async function getState(): Promise<KioskState & { now: number }> {
  const [members, sessions, groups] = await Promise.all([
    rest("kiosk_members?select=*") as Promise<MemberRow[]>,
    rest("kiosk_sessions?select=*") as Promise<SessionRow[]>,
    rest("kiosk_groups?select=*") as Promise<GroupRow[]>,
  ]);
  return {
    members: members.map(toMember),
    sessions: sessions.map(toSession),
    groups: groups.map(toGroup),
    // The database's clock, so every iPad measures against the same one.
    now: Date.now(),
  };
}

/* ---------------------------------------------------------------- writes */

export async function addMember(input: {
  firstName: string; lastName: string; photoUrl?: string | null; groupIds?: string[];
}): Promise<Member> {
  const rows = (await rest("kiosk_members", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      photo_url: input.photoUrl ?? null,
      group_ids: input.groupIds ?? [],
      face_embedding: null,
    }),
  })) as MemberRow[];
  return toMember(rows[0]);
}

export async function signOutMember(memberId: string, now = new Date()) {
  const open = (await rest(
    `kiosk_sessions?member_id=eq.${q(memberId)}&signed_out_at=is.null&order=signed_in_at.desc`,
  )) as SessionRow[];
  if (open.length === 0) throw new Error("They are not signed in.");

  const rows = (await rest(`kiosk_sessions?id=eq.${open[0].id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ signed_out_at: now.toISOString() }),
  })) as SessionRow[];

  const members = (await rest(`kiosk_members?id=eq.${q(memberId)}`)) as MemberRow[];
  return { action: "out" as const, member: toMember(members[0]), session: toSession(rows[0]) };
}

export async function signInMembers(
  memberIds: string[],
  options: { verified: boolean; note?: string | null },
  now = new Date(),
): Promise<{ signedIn: Member[]; alreadyIn: Member[] }> {
  const signedIn: Member[] = [];
  const alreadyIn: Member[] = [];

  for (const memberId of new Set(memberIds)) {
    const members = (await rest(`kiosk_members?id=eq.${q(memberId)}&active=is.true`)) as MemberRow[];
    if (members.length === 0) continue;

    const open = (await rest(
      `kiosk_sessions?member_id=eq.${q(memberId)}&signed_out_at=is.null`,
    )) as SessionRow[];
    if (open.length > 0) {
      alreadyIn.push(toMember(members[0]));
      continue;
    }

    await rest("kiosk_sessions", {
      method: "POST",
      body: JSON.stringify({
        member_id: memberId,
        signed_in_at: now.toISOString(),
        verified: options.verified,
        note: options.note ?? null,
      }),
    });
    signedIn.push(toMember(members[0]));
  }
  return { signedIn, alreadyIn };
}

export async function createGroup(input: {
  name: string; meetsOn: number[]; startsAt: string; endsAt: string;
}): Promise<Group> {
  const rows = (await rest("kiosk_groups", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      name: input.name.trim(),
      meets_on: [...new Set(input.meetsOn)].filter((d) => d >= 0 && d <= 6).sort(),
      starts_at: input.startsAt,
      ends_at: input.endsAt,
    }),
  })) as GroupRow[];
  return toGroup(rows[0]);
}

/** Retired, not deleted: sessions and members reference it. */
export async function deleteGroup(groupId: string): Promise<void> {
  await rest(`kiosk_groups?id=eq.${q(groupId)}`, {
    method: "PATCH",
    body: JSON.stringify({ active: false }),
  });
  const members = (await rest(`kiosk_members?group_ids=cs.%7B${q(groupId)}%7D`)) as MemberRow[];
  for (const m of members) {
    await rest(`kiosk_members?id=eq.${m.id}`, {
      method: "PATCH",
      body: JSON.stringify({ group_ids: (m.group_ids ?? []).filter((g) => g !== groupId) }),
    });
  }
}

/** Gives an imported member the photograph they were brought in without. */
export async function setMemberPhoto(memberId: string, photoUrl: string): Promise<Member> {
  const rows = (await rest(`kiosk_members?id=eq.${q(memberId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ photo_url: photoUrl }),
  })) as MemberRow[];
  return toMember(rows[0]);
}

export async function setMemberGroups(memberId: string, groupIds: string[]): Promise<Member> {
  const rows = (await rest(`kiosk_members?id=eq.${q(memberId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ group_ids: [...new Set(groupIds)] }),
  })) as MemberRow[];
  return toMember(rows[0]);
}

/** Never a hard delete: that would orphan the member's recorded hours. */
export async function setMemberActive(
  memberId: string,
  active: boolean,
  now = new Date(),
): Promise<Member> {
  if (!active) {
    await rest(`kiosk_sessions?member_id=eq.${q(memberId)}&signed_out_at=is.null`, {
      method: "PATCH",
      body: JSON.stringify({
        signed_out_at: now.toISOString(),
        auto_closed: true,
        note: "Closed automatically: member was deactivated.",
      }),
    });
  }
  const rows = (await rest(`kiosk_members?id=eq.${q(memberId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ active }),
  })) as MemberRow[];
  return toMember(rows[0]);
}

export async function closeAllOpen(now = new Date()): Promise<number> {
  const open = (await rest("kiosk_sessions?signed_out_at=is.null&select=id")) as { id: string }[];
  if (open.length === 0) return 0;
  await rest("kiosk_sessions?signed_out_at=is.null", {
    method: "PATCH",
    body: JSON.stringify({
      signed_out_at: now.toISOString(),
      auto_closed: true,
      note: "Closed automatically at the end of the day.",
    }),
  });
  return open.length;
}
