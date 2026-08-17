-- The sign-in kiosk at signin.vexkan.ca.
--
-- Until now the kiosk wrote to a JSON file. On Vercel that file lives in /tmp,
-- which is per-instance and cleared on cold starts, so a member signed up on
-- one request was invisible to the next and the roster read "0 of 0" minutes
-- after someone was added. These tables are the fix.
--
-- This holds attendance records for minors: names, photographs, and the times
-- they were in a room. There is deliberately no anonymous access of any kind.
-- The kiosk reaches this through the service role key from a server route, so
-- the anon key that ships in the browser can do nothing here at all.

create table if not exists public.kiosk_groups (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  -- Weekdays it meets, 0 = Sunday.
  meets_on   smallint[]  not null default '{}',
  -- Club-local wall clock, "16:30". Stored as text on purpose: a time column
  -- would invite a timezone, and these are wall-clock times that must not shift
  -- when daylight saving changes.
  starts_at  text        not null default '16:30',
  ends_at    text        not null default '18:00',
  active     boolean     not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.kiosk_members (
  id         uuid        primary key default gen_random_uuid(),
  first_name text        not null,
  last_name  text        not null,
  photo_url  text,
  active     boolean     not null default true,
  group_ids  uuid[]      not null default '{}',
  -- Reserved. Face templates live in the iPad's own storage, never here, until
  -- written parent consent is in place. Leave null.
  face_embedding jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.kiosk_sessions (
  id            uuid        primary key default gen_random_uuid(),
  member_id     uuid        not null references public.kiosk_members (id) on delete cascade,
  signed_in_at  timestamptz not null default now(),
  -- Null means the member is still in the room. Presence is derived from this
  -- and never stored on the member, which would drift the first time a write
  -- half-failed.
  signed_out_at timestamptz,
  auto_closed   boolean     not null default false,
  -- True when a face match authorised the sign-in rather than a passcode.
  verified      boolean     not null default false,
  note          text
);

create index if not exists kiosk_sessions_member_idx on public.kiosk_sessions (member_id);
create index if not exists kiosk_sessions_open_idx on public.kiosk_sessions (member_id)
  where signed_out_at is null;

-- At most one open session per member, enforced by the database rather than by
-- application code that could race with itself.
create unique index if not exists kiosk_sessions_one_open_idx
  on public.kiosk_sessions (member_id)
  where signed_out_at is null;

alter table public.kiosk_groups   enable row level security;
alter table public.kiosk_members  enable row level security;
alter table public.kiosk_sessions enable row level security;

-- No policies are defined, deliberately.
--
-- With RLS on and no policy, anon and authenticated can do nothing. The service
-- role bypasses RLS entirely, and that key is server-only and never shipped to
-- a browser. So the kiosk's API routes can read and write, and the public anon
-- key that the club site already exposes cannot touch a single row.
--
-- LAUNCH GATE — run this before announcing the kiosk. It must return an empty
-- array or an error, never a member row:
--
--   curl -s "https://YOUR_PROJECT.supabase.co/rest/v1/kiosk_members?select=*" \
--     -H "apikey: YOUR_ANON_KEY" -H "Authorization: Bearer YOUR_ANON_KEY"
