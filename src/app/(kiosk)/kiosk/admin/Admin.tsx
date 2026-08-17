"use client";

/*
 * Plain anchors, not next/link, for every link that crosses the subdomain
 * rewrite. Client-side navigation resolves the literal href against the app's
 * own route tree without applying rewrites, so on signin.vexkan.ca a <Link
 * href="/"> walked into the club site's routes instead of the kiosk and the
 * button appeared to do nothing. A full navigation lets the server rewrite it.
 */

import { useCallback, useMemo, useState } from "react";
import { describeSchedule, orderGroups } from "@/lib/kiosk/schedule";
import { alphabetical, clubTotals, formatDuration, formatHours, isSignedIn } from "@/lib/kiosk/hours";
import { postJson, type AdminReply } from "@/lib/kiosk/postJson";
import { AddPhoto } from "./AddPhoto";
import type { Group, KioskState, Member } from "@/lib/kiosk/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Admin({ initial, initialNow }: { initial: KioskState; initialNow: number }) {
  const [state, setState] = useState(initial);
  const [passcode, setPasscode] = useState("");
  /*
   * The passcode is entered once on the lock screen and kept in memory for the
   * rest of the visit. Deliberately not localStorage: an admin session should
   * not outlive the tab on an iPad the whole club can pick up.
   */
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<"roster" | "analytics">("roster");
  const [photoFor, setPhotoFor] = useState<Member | null>(null);
  /** Which row's menu is open. One at a time, so the list stays readable. */
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<Member | null>(null);
  const [groupMenuFor, setGroupMenuFor] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [gName, setGName] = useState("");
  const [gDays, setGDays] = useState<number[]>([]);
  const [gFrom, setGFrom] = useState("16:30");
  const [gTo, setGTo] = useState("18:00");
  const [draftFirst, setDraftFirst] = useState("");
  const [draftLast, setDraftLast] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [meetsOn, setMeetsOn] = useState<number[]>([2]);
  const [startsAt, setStartsAt] = useState("16:30");
  const [endsAt, setEndsAt] = useState("18:00");

  const standings = useMemo(
    () => orderGroups(state.groups, initialNow),
    [state.groups, initialNow],
  );

  const send = useCallback(
    async (payload: Record<string, unknown>) => {
      if (passcode.length === 0) {
        setError("The admin session was locked. Unlock again.");
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const body = await postJson<AdminReply>("/api/admin", { ...payload, passcode });
        setState({ members: body.members, sessions: body.sessions, groups: body.groups });
      } catch (err) {
        setError(err instanceof Error ? err.message : "That did not save.");
      } finally {
        setBusy(false);
      }
    },
    [passcode],
  );

  const unlock = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const body = await postJson<AdminReply>("/api/admin", { action: "unlock", passcode });
      setState({ members: body.members, sessions: body.sessions, groups: body.groups });
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That passcode is not right.");
      setPasscode("");
    } finally {
      setBusy(false);
    }
  }, [passcode]);

  const activeGroups = state.groups.filter((g) => g.active);

  /* Nothing about the roster renders until the passcode is accepted. */
  if (!unlocked) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 p-6">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#ffb100] uppercase">
            Administrator
          </p>
          <h1 className="font-serif text-3xl font-bold">Enter the passcode</h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (passcode.length > 0 && !busy) unlock();
          }}
          className="flex flex-col gap-3"
        >
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            aria-label="Administrator passcode"
            className="min-h-[72px] rounded-xl border-2 border-[#2e343b] bg-[#1d2126] px-4 text-center font-mono text-3xl tracking-[0.3em] text-[#e8eaed]"
          />
          <button
            type="submit"
            disabled={busy || passcode.length === 0}
            className="min-h-[72px] rounded-xl bg-[#ffb100] font-serif text-2xl font-bold text-[#14171a] disabled:opacity-40"
          >
            {busy ? "Checking…" : "Unlock"}
          </button>
        </form>

        {error && (
          <p role="alert" className="rounded-lg border-2 border-[#e04f4f] bg-[#e04f4f]/15 px-4 py-3 text-sm text-[#ffb4b4]">
            {error}
          </p>
        )}

        <a
          href="/"
          className="text-center font-mono text-xs tracking-widest text-[#8b949e] uppercase"
        >
          Back to kiosk
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-5 p-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#ffb100] uppercase">
            Administrator
          </p>
          <h1 className="font-serif text-3xl font-bold">Groups and roster</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setUnlocked(false);
              setPasscode("");
            }}
            className="rounded-lg border-2 border-[#2e343b] px-4 py-3 font-mono text-xs tracking-widest text-[#8b949e] uppercase"
          >
            Lock
          </button>
          <a
            href="/"
            className="grid place-items-center rounded-lg border-2 border-[#2e343b] px-4 font-mono text-xs tracking-widest text-[#8b949e] uppercase"
          >
            Back to kiosk
          </a>
        </div>
      </header>

      <nav className="flex gap-2">
        {(["roster", "analytics"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`min-h-[52px] rounded-xl border-2 px-5 font-serif font-semibold capitalize ${
              tab === t
                ? "border-[#ffb100] bg-[#ffb100] text-[#14171a]"
                : "border-[#2e343b] bg-[#1d2126] text-[#8b949e]"
            }`}
          >
            {t === "roster" ? "Groups & roster" : "Analytics"}
          </button>
        ))}
      </nav>

      {error && (
        <p role="alert" className="rounded-lg border-2 border-[#e04f4f] bg-[#e04f4f]/15 px-4 py-3 text-sm text-[#ffb4b4]">
          {error}
        </p>
      )}

      {tab === "analytics" && <Analytics state={state} now={initialNow} />}

      {tab === "roster" && (
      <>
      <section>
        <h2 className="mb-2 font-serif text-xl font-semibold">Groups</h2>
        <ul className="mb-4 flex flex-col gap-2">
          {standings.map(({ group, phase }) => (
            <li
              key={group.id}
              className="flex items-center gap-3 rounded-xl border-2 border-[#2e343b] bg-[#1d2126] p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg font-semibold">{group.name}</p>
                <p className="font-mono text-[11px] text-[#8b949e]">
                  {describeSchedule(group)}
                  {phase === "in-session" && <span className="text-[#35c17a]"> · on now</span>}
                </p>
              </div>
              <span className="font-mono text-[11px] text-[#8b949e]">
                {state.members.filter((m) => m.active && m.groupIds.includes(group.id)).length}{" "}
                members
              </span>
              {/* Imported groups arrived with no schedule at all, so editing
                  one is not an edge case — it is the first thing to do. */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setGroupMenuFor(groupMenuFor === group.id ? null : group.id)}
                  aria-label={`Options for ${group.name}`}
                  aria-expanded={groupMenuFor === group.id}
                  className="min-h-[44px] w-11 rounded-lg border-2 border-[#2e343b] text-lg leading-none text-[#8b949e]"
                >
                  ⋯
                </button>

                {groupMenuFor === group.id && (
                  <div className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-xl border-2 border-[#2e343b] bg-[#1d2126] shadow-xl">
                    <button
                      onClick={() => {
                        setEditingGroup(group);
                        setGName(group.name);
                        setGDays(group.meetsOn);
                        setGFrom(group.startsAt);
                        setGTo(group.endsAt);
                        setGroupMenuFor(null);
                      }}
                      className="block w-full px-4 py-3 text-left font-serif text-sm hover:bg-[#2e343b]"
                    >
                      Rename and set the time
                    </button>
                    <button
                      onClick={() => {
                        send({ action: "deleteGroup", groupId: group.id });
                        setGroupMenuFor(null);
                      }}
                      disabled={busy}
                      className="block w-full border-t border-[#2e343b] px-4 py-3 text-left font-serif text-sm text-[#e04f4f] hover:bg-[#2e343b] disabled:opacity-40"
                    >
                      Retire this group
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
          {standings.length === 0 && (
            <li className="font-mono text-sm text-[#8b949e]">No groups yet.</li>
          )}
        </ul>

        <div className="flex flex-wrap items-end gap-3 rounded-xl border-2 border-dashed border-[#2e343b] p-3">
          <label className="font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
            New group
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="V5RC Build"
              className="mt-1 block min-h-[48px] rounded-lg border-2 border-[#2e343b] bg-[#14171a] px-3 font-serif text-lg text-[#e8eaed]"
            />
          </label>
          <div className="font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
            Meets
            <div className="mt-1 flex gap-1">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  onClick={() =>
                    setMeetsOn((prev) =>
                      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i],
                    )
                  }
                  className={`min-h-[48px] w-11 rounded-lg border-2 text-[11px] ${
                    meetsOn.includes(i)
                      ? "border-[#ffb100] bg-[#ffb100] text-[#14171a]"
                      : "border-[#2e343b] text-[#8b949e]"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <label className="font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
            From
            <input
              type="time"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="mt-1 block min-h-[48px] rounded-lg border-2 border-[#2e343b] bg-[#14171a] px-3 font-mono text-[#e8eaed]"
            />
          </label>
          <label className="font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
            To
            <input
              type="time"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="mt-1 block min-h-[48px] rounded-lg border-2 border-[#2e343b] bg-[#14171a] px-3 font-mono text-[#e8eaed]"
            />
          </label>
          <button
            onClick={() => {
              send({ action: "createGroup", name, meetsOn, startsAt, endsAt });
              setName("");
            }}
            disabled={busy || name.trim().length === 0}
            className="min-h-[48px] rounded-lg bg-[#ffb100] px-5 font-serif font-bold text-[#14171a] disabled:opacity-40"
          >
            Add group
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-serif text-xl font-semibold">Roster</h2>
        {state.members.length === 0 && (
          <p className="mb-2 font-mono text-sm text-[#8b949e]">
            Nobody signed up yet. Members are added from the kiosk&rsquo;s Sign up
            screen, which captures the photo and the face templates.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {[...state.members]
            .sort((a, b) => Number(b.active) - Number(a.active) || a.firstName.localeCompare(b.firstName))
            .map((member) => {
              const here = isSignedIn(state.sessions, member.id);
              return (
                <li
                  key={member.id}
                  className={`rounded-xl border-2 p-3 ${
                    member.active ? "border-[#2e343b] bg-[#1d2126]" : "border-[#2e343b]/50 opacity-50"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded-lg">
                      {member.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- stored crop
                        <img src={member.photoUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="grid size-full place-items-center rounded-lg border-2 border-dashed border-[#4a525b] font-mono text-[10px] text-[#8b949e]">
                          ?
                        </div>
                      )}
                    </div>
                    <p className="min-w-0 flex-1 truncate font-serif text-lg font-semibold">
                      {member.firstName} {member.lastName}
                      {here && <span className="ml-2 font-mono text-[11px] text-[#35c17a]">in the room</span>}
                    </p>

                    {/*
                      * One menu rather than a row of buttons. Every member needs
                      * renaming, a photo and deactivating available, and three
                      * controls per row across a roster of twenty-eight is a wall
                      * of buttons nobody reads.
                      */}
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setMenuFor(menuFor === member.id ? null : member.id)}
                        aria-label={`Options for ${member.firstName} ${member.lastName}`}
                        aria-expanded={menuFor === member.id}
                        className="min-h-[44px] w-11 rounded-lg border-2 border-[#2e343b] text-lg leading-none text-[#8b949e]"
                      >
                        ⋯
                      </button>

                      {menuFor === member.id && (
                        <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border-2 border-[#2e343b] bg-[#1d2126] shadow-xl">
                          <button
                            onClick={() => { setPhotoFor(member); setMenuFor(null); }}
                            disabled={!member.active}
                            className="block w-full px-4 py-3 text-left font-serif text-sm hover:bg-[#2e343b] disabled:opacity-40"
                          >
                            {member.photoUrl ? "Replace photo" : "Add photo"}
                          </button>
                          <button
                            onClick={() => {
                              setRenaming(member);
                              setDraftFirst(member.firstName);
                              setDraftLast(member.lastName === "—" ? "" : member.lastName);
                              setMenuFor(null);
                            }}
                            className="block w-full border-t border-[#2e343b] px-4 py-3 text-left font-serif text-sm hover:bg-[#2e343b]"
                          >
                            Rename
                          </button>
                          <button
                            onClick={() => {
                              send({ action: "setMemberActive", memberId: member.id, active: !member.active });
                              setMenuFor(null);
                            }}
                            disabled={busy}
                            className="block w-full border-t border-[#2e343b] px-4 py-3 text-left font-serif text-sm text-[#e04f4f] hover:bg-[#2e343b] disabled:opacity-40"
                          >
                            {member.active ? "Deactivate" : "Restore"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activeGroups.map((group) => {
                      const inGroup = member.groupIds.includes(group.id);
                      return (
                        <button
                          key={group.id}
                          onClick={() =>
                            send({
                              action: "setMemberGroups",
                              memberId: member.id,
                              groupIds: inGroup
                                ? member.groupIds.filter((id) => id !== group.id)
                                : [...member.groupIds, group.id],
                            })
                          }
                          disabled={busy || !member.active}
                          className={`min-h-[40px] rounded-lg border-2 px-3 font-mono text-[11px] disabled:opacity-40 ${
                            inGroup
                              ? "border-[#ffb100] bg-[#ffb100]/15 text-[#ffb100]"
                              : "border-[#2e343b] text-[#8b949e]"
                          }`}
                        >
                          {group.name}
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
        </ul>
      </section>

      {editingGroup && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#14171a]/90 p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send({
                action: "updateGroup",
                groupId: editingGroup.id,
                name: gName,
                meetsOn: gDays,
                startsAt: gFrom,
                endsAt: gTo,
              });
              setEditingGroup(null);
            }}
            className="flex w-full max-w-md flex-col gap-3 rounded-2xl border-2 border-[#2e343b] bg-[#1d2126] p-5"
          >
            <p className="font-mono text-[11px] tracking-widest text-[#ffb100] uppercase">
              Edit group
            </p>
            <label className="font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
              Name
              <input
                autoFocus
                value={gName}
                onChange={(e) => setGName(e.target.value)}
                className="mt-1 min-h-[56px] w-full rounded-lg border-2 border-[#2e343b] bg-[#14171a] px-3 font-serif text-xl text-[#e8eaed]"
              />
            </label>

            <div className="font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
              Meets
              <div className="mt-1 flex gap-1">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setGDays((prev) =>
                        prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i],
                      )
                    }
                    className={`min-h-[48px] flex-1 rounded-lg border-2 text-[11px] ${
                      gDays.includes(i)
                        ? "border-[#ffb100] bg-[#ffb100] text-[#14171a]"
                        : "border-[#2e343b] text-[#8b949e]"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <label className="flex-1 font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
                From
                <input
                  type="time"
                  value={gFrom}
                  onChange={(e) => setGFrom(e.target.value)}
                  className="mt-1 block min-h-[56px] w-full rounded-lg border-2 border-[#2e343b] bg-[#14171a] px-3 font-mono text-[#e8eaed]"
                />
              </label>
              <label className="flex-1 font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
                To
                <input
                  type="time"
                  value={gTo}
                  onChange={(e) => setGTo(e.target.value)}
                  className="mt-1 block min-h-[56px] w-full rounded-lg border-2 border-[#2e343b] bg-[#14171a] px-3 font-mono text-[#e8eaed]"
                />
              </label>
            </div>

            <p className="font-mono text-[10px] leading-relaxed text-[#8b949e]">
              The kiosk opens on whichever group is meeting or about to. A group
              with no days set never rises to the top.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingGroup(null)}
                className="min-h-[56px] flex-1 rounded-xl border-2 border-[#2e343b] font-mono text-xs tracking-widest text-[#8b949e] uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || !gName.trim()}
                className="min-h-[56px] flex-1 rounded-xl bg-[#ffb100] font-serif font-bold text-[#14171a] disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {renaming && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#14171a]/90 p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send({
                action: "renameMember",
                memberId: renaming.id,
                firstName: draftFirst,
                lastName: draftLast,
              });
              setRenaming(null);
            }}
            className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border-2 border-[#2e343b] bg-[#1d2126] p-5"
          >
            <p className="font-mono text-[11px] tracking-widest text-[#ffb100] uppercase">Rename</p>
            <label className="font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
              First name
              <input
                autoFocus
                value={draftFirst}
                onChange={(e) => setDraftFirst(e.target.value)}
                className="mt-1 min-h-[56px] w-full rounded-lg border-2 border-[#2e343b] bg-[#14171a] px-3 font-serif text-xl text-[#e8eaed]"
              />
            </label>
            <label className="font-mono text-[11px] tracking-widest text-[#8b949e] uppercase">
              Last name
              <input
                value={draftLast}
                onChange={(e) => setDraftLast(e.target.value)}
                className="mt-1 min-h-[56px] w-full rounded-lg border-2 border-[#2e343b] bg-[#14171a] px-3 font-serif text-xl text-[#e8eaed]"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRenaming(null)}
                className="min-h-[56px] flex-1 rounded-xl border-2 border-[#2e343b] font-mono text-xs tracking-widest text-[#8b949e] uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || !draftFirst.trim() || !draftLast.trim()}
                className="min-h-[56px] flex-1 rounded-xl bg-[#ffb100] font-serif font-bold text-[#14171a] disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {photoFor && (
        <AddPhoto
          member={photoFor}
          busy={busy}
          onClose={() => setPhotoFor(null)}
          onSave={(photoUrl) =>
            send({ action: "setMemberPhoto", memberId: photoFor.id, photoUrl })
          }
        />
      )}

      <p className="border-t border-[#2e343b] pt-4 font-mono text-[11px] text-[#8b949e]">
        Retiring a group and deactivating a member both keep every recorded hour.
        Nothing here deletes session history.
      </p>
      </>
      )}
    </div>
  );
}

/**
 * Season totals.
 *
 * Everything is derived from the session rows, so the club total and the sum of
 * the rows below it cannot disagree. Deactivated members stay in the table:
 * their hours happened, and a season report that silently dropped someone who
 * left in March would be wrong rather than tidy.
 */
function Analytics({ state, now }: { state: KioskState; now: number }) {
  const totals = clubTotals(state.members, state.sessions, now);
  const rows = alphabetical(state.members, state.sessions, now);

  const stats: [string, string, string?][] = [
    ["Total hours", formatHours(totals.totalMs) + "h", formatDuration(totals.totalMs)],
    ["People who came", String(totals.attendees), totals.neverAttended + " never signed in"],
    ["Sessions", String(totals.sessions), totals.openSessions + " open now"],
    ["Average visit", formatDuration(totals.averageSessionMs)],
  ];

  return (
    <>
      <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {stats.map(([label, value, sub]) => (
          <div key={label} className="rounded-xl border-2 border-[#2e343b] bg-[#1d2126] p-3">
            <p className="font-mono text-[10px] tracking-widest text-[#8b949e] uppercase">{label}</p>
            <p className="font-serif text-3xl font-bold tabular-nums">{value}</p>
            {sub && <p className="font-mono text-[10px] text-[#8b949e]">{sub}</p>}
          </div>
        ))}
      </section>

      {totals.autoClosed > 0 && (
        <p className="rounded-lg border-2 border-[#ffb100]/40 bg-[#ffb100]/10 px-4 py-3 font-mono text-[11px] text-[#ffb100]">
          {totals.autoClosed} {totals.autoClosed === 1 ? "session was" : "sessions were"} closed
          automatically rather than by a real sign-out, so those hours are estimates.
        </p>
      )}

      <section>
        <h2 className="mb-2 font-serif text-xl font-semibold">Hours per member</h2>
        {rows.length === 0 ? (
          <p className="font-mono text-sm text-[#8b949e]">Nobody is signed up yet.</p>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-[#2e343b] font-mono text-[10px] tracking-widest text-[#8b949e] uppercase">
                <th className="py-2">Member</th>
                <th className="py-2 text-right">Visits</th>
                <th className="py-2 text-right">Hours</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ member, totalMs, visits, signedIn }) => (
                <tr key={member.id} className="border-b border-[#2e343b]">
                  <td className="py-2 font-serif">
                    {member.firstName} {member.lastName}
                    {!member.active && (
                      <span className="ml-2 font-mono text-[10px] text-[#8b949e]">inactive</span>
                    )}
                    {signedIn && (
                      <span className="ml-2 font-mono text-[10px] text-[#35c17a]">here now</span>
                    )}
                  </td>
                  <td className="py-2 text-right font-mono tabular-nums text-[#8b949e]">{visits}</td>
                  <td className="py-2 text-right font-mono font-bold tabular-nums">
                    {formatHours(totalMs)}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
