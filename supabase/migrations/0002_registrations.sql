-- VexKan club registrations.
--
-- This table holds identifying information about minors and their guardians,
-- so it collects the minimum needed to place a child in a class and nothing
-- more: no birthdates, no home addresses, no student contact details, and no
-- medical information.
--
-- The anon key ships in the browser by design, so row level security is what
-- actually protects these rows. There is deliberately no anonymous SELECT
-- policy: an anonymous client can submit a registration and can never read one
-- back, not even its own.

create table if not exists public.registrations (
  id             uuid        primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  program_slug   text        not null,
  student_first  text        not null,
  student_last   text        not null,
  student_grade  text        not null,
  guardian_name  text        not null,
  guardian_email text        not null,
  guardian_phone text        not null,
  notes          text,
  status         text        not null default 'new'
                 check (status in ('new', 'contacted', 'enrolled', 'withdrawn'))
);

create index if not exists registrations_created_idx on public.registrations (created_at desc);

-- Who may read registration data. Rows are added by SQL only; there is no
-- self-serve path into this table.
create table if not exists public.admins (
  user_id  uuid        primary key references auth.users on delete cascade,
  added_at timestamptz not null default now()
);

alter table public.registrations enable row level security;
alter table public.admins        enable row level security;

-- A policy on `admins` must not query `admins`, because Postgres raises on the
-- recursion rather than evaluating it. Letting a user read exactly their own
-- row is non-recursive and is all the client needs to ask "am I an admin".
drop policy if exists "see own admin row" on public.admins;
create policy "see own admin row"
  on public.admins for select
  using (user_id = auth.uid());

-- Anyone may submit a registration.
drop policy if exists "anyone can register" on public.registrations;
create policy "anyone can register"
  on public.registrations for insert
  to anon, authenticated
  with check (true);

-- Only admins may read, update or delete. Subquerying `admins` from a policy
-- on `registrations` is fine; only self-reference recurses.
drop policy if exists "admins read registrations" on public.registrations;
create policy "admins read registrations"
  on public.registrations for select
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "admins update registrations" on public.registrations;
create policy "admins update registrations"
  on public.registrations for update
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "admins delete registrations" on public.registrations;
create policy "admins delete registrations"
  on public.registrations for delete
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- To grant yourself access after signing up through /admin:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'admin@vexkan.ca';
