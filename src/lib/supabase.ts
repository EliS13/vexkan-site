import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Auth runs entirely in the browser against Supabase, so the site stays a
 * static build with no server of its own. The anon key is meant to be public,
 * row level security in the database is what actually protects a team's data.
 *
 * With no keys configured the whole app still works, it just saves to this
 * browser only and the account page explains that.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isCloudConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isCloudConfigured) return null;
  if (!client) {
    client = createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}

/** Every synced blob lives in one table, keyed by user and a short name. */
export const STATE_TABLE = "user_state";

export async function pullState(key: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await sb
    .from(STATE_TABLE)
    .select("value")
    .eq("user_id", userData.user.id)
    .eq("key", key)
    .maybeSingle();

  if (error || !data) return null;
  return typeof data.value === "string" ? data.value : JSON.stringify(data.value);
}

export async function pushState(key: string, value: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) return;

  await sb.from(STATE_TABLE).upsert(
    {
      user_id: userData.user.id,
      key,
      value: JSON.parse(value || "null"),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,key" }
  );
}
