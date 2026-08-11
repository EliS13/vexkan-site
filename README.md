# Built From the Ground Up

Interactive companion to the VEX field guide by team 16688A / VexKan Robotics.
Chapters, hand-built diagrams, calculators, an engineering notebook, a season
planner, and an assistant that answers with next steps.

## Two sites, one repository

This repository serves two things:

- **The club site**, at the root (`/`, `/about`, `/programs`, `/events`,
  `/register`, `/contact`, `/admin`) — VexKan Robotics' public site and
  registration form.
- **The field guide**, under `/guide` — the interactive companion described
  below.

They share a codebase but have separate headers, footers, and layouts via
Next.js route groups; see [Layout](#layout).

For content the club hasn't published yet, see
[`src/content/club/TODO.md`](src/content/club/TODO.md). For taking the club
site live at vexkan.ca, see [`DEPLOY.md`](DEPLOY.md).

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

- `src/app/(club)` — the club site: home, about, programs, events, register,
  contact, admin. Its own layout, header, and footer.
- `src/app/(guide)/guide` — the field guide: chapters, tools, notebook, season
  planner, ask. Its own layout, header, and footer.
- `src/content/club` — club programs, events, teams, people, and the TBD
  placeholder used wherever the club hasn't published a value yet
- `src/content` — guide chapters, diagrams metadata, sources, guidance topics, part specs
- `src/components/club` — club site components (cards, hero art, registration form)
- `src/components/diagrams` — hand-built SVG figures, one per chapter topic
- `src/app/(guide)/guide/tools` — gear ratio calculator, mechanism picker, notebook, season planner
- `src/lib` — export helpers (Docs, Slides, Markdown, ICS), storage, Supabase
- `supabase/migrations` — database schema and row level security
# vexkan-site
