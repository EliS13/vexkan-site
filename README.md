# Built From the Ground Up

Interactive companion to the VEX field guide by team 16688A / VexKan Robotics.
Chapters, hand-built diagrams, calculators, an engineering notebook, a season
planner, and an assistant that answers with next steps.

## Running it

```bash
npm install
npm run dev
```

## Optional: turning on sign-in

Everything works without an account. The notebook, season plan, and recent
questions save to the browser, and the notebook page has a backup file that
moves them between computers.

Signing in makes that work follow a team between devices. It uses Supabase,
runs entirely in the browser, and stays on the free tier.

1. Create a project at https://supabase.com
2. In the SQL editor, run `supabase/migrations/0001_init.sql`
3. In Project Settings, API, copy the Project URL and the anon public key
4. Copy `.env.local.example` to `.env.local` and paste both values in
5. Restart the dev server

The anon key is meant to be public. Row level security on the `user_state`
table is what stops one account reading another's rows, and the policies are in
the migration.

### If most of your team is under 13

Have a coach or a parent own the account. The only things stored are what
someone types in: notebook entries and photos, the season plan, the team name,
and past questions. Signing out leaves everything on the device untouched.

## Layout

- `src/content` — chapters, diagrams metadata, sources, guidance topics, part specs
- `src/components/diagrams` — hand-built SVG figures, one per chapter topic
- `src/app/tools` — gear ratio calculator, mechanism picker, notebook, season planner
- `src/lib` — export helpers (Docs, Slides, Markdown, ICS), storage, Supabase
- `supabase/migrations` — database schema and row level security
