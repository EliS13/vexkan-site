import { getSupabase, isCloudConfigured } from "@/lib/supabase";
import type { RegistrationInput, RegistrationRow } from "@/lib/registration";

export const REGISTRATIONS_TABLE = "registrations";

export type SubmitResult = { ok: true } | { ok: false; message: string };

export async function submitRegistration(input: RegistrationInput): Promise<SubmitResult> {
  const sb = getSupabase();
  if (!sb) {
    return { ok: false, message: "Online registration isn't set up yet." };
  }

  // No .select() here: it would ask postgrest for the inserted row back
  // (Prefer: return=representation), which needs a SELECT policy. Anonymous
  // users deliberately have none, so that would turn a valid insert into a
  // 42501 error and silently lose the registration.
  const { error } = await sb.from(REGISTRATIONS_TABLE).insert({
    program_slug: input.programSlug.trim(),
    student_first: input.studentFirst.trim(),
    student_last: input.studentLast.trim(),
    student_grade: input.studentGrade.trim(),
    guardian_name: input.guardianName.trim(),
    guardian_email: input.guardianEmail.trim(),
    guardian_phone: input.guardianPhone.trim(),
    notes: input.notes.trim() || null,
  });

  if (error) {
    return {
      ok: false,
      message: "We couldn't save that. Please try again, or email us and we'll sign you up.",
    };
  }
  return { ok: true };
}

export type ActionResult = { ok: true } | { ok: false; message: string };
export type ListResult = { ok: true; rows: RegistrationRow[] } | { ok: false; message: string };

/**
 * Admin only. Row level security refuses this for everyone else, which comes
 * back as a Postgrest error, not an empty result — so a failure here must
 * never look the same as "there are zero registrations". Callers need to be
 * able to tell an expired token or a network drop apart from a genuinely
 * empty table.
 */
export async function listRegistrations(): Promise<ListResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, message: "Online registration isn't set up yet." };
  const { data, error } = await sb
    .from(REGISTRATIONS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    return {
      ok: false,
      message: "We couldn't load registrations. Check your connection and try again.",
    };
  }
  return { ok: true, rows: (data ?? []) as RegistrationRow[] };
}

export async function isAdmin(): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) return false;
  const { data } = await sb.from("admins").select("user_id").eq("user_id", userData.user.id).maybeSingle();
  return Boolean(data);
}

export async function updateRegistrationStatus(id: string, status: string): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, message: "Online registration isn't set up yet." };
  const { error } = await sb.from(REGISTRATIONS_TABLE).update({ status }).eq("id", id);
  if (error) {
    return { ok: false, message: "We couldn't update that status. Please try again." };
  }
  return { ok: true };
}

export async function deleteRegistration(id: string): Promise<ActionResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, message: "Online registration isn't set up yet." };
  const { error } = await sb.from(REGISTRATIONS_TABLE).delete().eq("id", id);
  if (error) {
    return { ok: false, message: "We couldn't delete that registration. Please try again." };
  }
  return { ok: true };
}

export { isCloudConfigured };
