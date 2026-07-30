-- Built From the Ground Up: storage for signed-in teams.
--
-- One row per user per saved thing (notebook, season plan, recent questions).
-- Row level security is what actually protects a team's data, since the anon
-- key ships in the browser by design.

create table if not exists public.user_state (
  user_id    uuid        not null references auth.users on delete cascade,
  key        text        not null,
  value      jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_state enable row level security;

-- A signed-in user can only ever touch rows whose user_id is their own.
drop policy if exists "read own state" on public.user_state;
create policy "read own state"
  on public.user_state for select
  using (auth.uid() = user_id);

drop policy if exists "insert own state" on public.user_state;
create policy "insert own state"
  on public.user_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own state" on public.user_state;
create policy "update own state"
  on public.user_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "delete own state" on public.user_state;
create policy "delete own state"
  on public.user_state for delete
  using (auth.uid() = user_id);

create index if not exists user_state_user_idx on public.user_state (user_id);
