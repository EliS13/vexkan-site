-- Competition teams, and who was on them.
--
-- The kiosk knows who was in the room and never which robot they were
-- building, so this is the one thing about the club that no session row can
-- answer. It lived in a TypeScript file, which meant a roster change needed a
-- deploy and could only be made by somebody who could edit code.
--
-- Deliberately no RLS policies, like the other kiosk tables: the service role
-- bypasses RLS and the anon key the club site ships to browsers can read
-- nothing.

create table if not exists public.kiosk_teams (
  id         uuid        primary key default gen_random_uuid(),
  -- "595C" as it appears at competition.
  number     text        not null,
  -- The club's own season naming, "2025-26", matching seasonOf() in badges.ts.
  season     text        not null,
  -- "IQ" or "V5RC". Team numbers do not say which.
  program    text        not null default 'IQ',
  member_ids uuid[]      not null default '{}',
  created_at timestamptz not null default now(),
  -- One row per team per season. 595C in 2024-25 and 595C in 2025-26 are two
  -- different sets of people and must not collapse into one.
  unique (number, season)
);

create index if not exists kiosk_teams_season_idx on public.kiosk_teams (season);
