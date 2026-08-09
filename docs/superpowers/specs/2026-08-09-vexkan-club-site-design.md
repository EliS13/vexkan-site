# VexKan Robotics Club — Public Site

Design for the site that will replace the WordPress install currently serving
vexkan.ca.

## Why

vexkan.ca today is WordPress 7.0.3 running Elementor on the Astra theme, hosted
at SiteGround. It carries the right information but the club has outgrown it:
program pages are thin, registration is a scatter of Google Form links, and
there is no way to see who has signed up without opening each form.

This replaces it with a static Next.js site in this repository, plus a
registration path the club actually controls.

## Audience

Parents choosing an after-school program for a child in Grades 1–12, and
students old enough to read about the competition teams themselves. They arrive
wanting three answers: what is this, is it right for my kid, and how do we join.
Every page is judged against those three.

## Scope

In scope: the public club site, program pages, an events page, a registration
form with a private dashboard, and the deployment path onto vexkan.ca.

Out of scope: rewriting the field guide's content, a CMS, payments, a public
member portal, and any change to the club's Microsoft 365 email.

## Architecture

One repository, one Next.js application, one deployment. Two route groups keep
the club site and the existing field guide fully separate at the layout level.

```
src/app/
  (club)/                 club site, owns the root URLs
    layout.tsx            ClubHeader + ClubFooter
    page.tsx              /
    about/page.tsx        /about
    programs/page.tsx     /programs
    programs/[slug]/      /programs/vex-iq-foundation-g1-2 etc.
    events/page.tsx       /events
    register/page.tsx     /register
    contact/page.tsx      /contact
    admin/page.tsx        /admin
  (guide)/                existing field guide, relocated
    layout.tsx            SiteHeader + SiteFooter (today's chrome)
    guide/page.tsx        /guide
    guide/chapters/...    /guide/chapters
    guide/tools/...       /guide/tools
    guide/ask/...         /guide/ask
    guide/seasons/...     /guide/seasons
    guide/account/...     /guide/account
```

Route groups are parentheses-named directories that do not appear in the URL,
so `(club)/about/page.tsx` serves `/about`. Each group has its own `layout.tsx`,
which is what gives the two sites separate headers, footers, and metadata
without either importing from the other.

`src/app/layout.tsx` stays as the root layout. It keeps the font variables, the
`globals.css` import, the skip link, and the `<html>`/`<body>` shell, and drops
the `SiteHeader`/`SiteFooter` that move down into `(guide)/layout.tsx`.

### Why not two apps or two repositories

The club site and the guide share a palette, a font stack, and a set of
primitives. Splitting them into separate builds means maintaining two Vercel
projects, two dependency trees, and making every shared token change twice, for
an organisation with roughly twenty students and three volunteers running it.
Route groups give the separation that actually matters — no shared chrome, no
shared nav, independent metadata — at no ongoing cost.

The field guide is not deployed publicly today, so moving it under `/guide`
breaks no existing links.

### Rendering

Every club page is statically prerendered. The registration form and the admin
dashboard are client components that talk to Supabase directly from the browser,
which is the pattern `src/lib/supabase.ts` already establishes. No API routes,
no server runtime required.

## Content

All copy lives under `src/content/club/`, one module per concern, typed and
imported by the pages. Components never hold prose. This is the same separation
`src/content/chapters.ts` already uses.

```
src/content/club/
  org.ts        name, tagline, mission, contact, hours, founding
  programs.ts   the eight programs
  people.ts     the three leaders
  events.ts     competitions and results
  faq.ts        questions parents ask
```

Everything below is taken from the current vexkan.ca. Nothing about the club is
invented.

### Organisation

- Name: VexKan Robotics Club
- Tagline: "Engineered for Everyone"
- Mission: "Make STEM education accessible and inspiring for all students by
  providing free robotics support, mentorship, and learning opportunities that
  foster creativity, problem-solving, teamwork, and confidence."
- Nonprofit, serving Grades 1–12
- Founded 2023 by Eli Seeliger; grown to roughly 20 students
- Phone 403-404-9033, email admin@vexkan.ca
- Strathcona Park, Calgary, Alberta, Canada
- Hours: Monday–Thursday 8AM–5PM, Friday 11AM–4PM, closed weekends and holidays

### People

- Eli Seeliger, Founder. Fourth year VEX participant, second year running the club.
- Alex Han, Outreach Leader. Third year in VEX; competed at World Championships
  in VEX IQ before moving to VRC.
- Michael Li, Organizer. High school student focused on community building and
  member support.

### Programs

Eight entries, each with slug, title, grade range, description, what students
learn, prerequisites, and a registration route.

| Slug | Program | Grades |
| --- | --- | --- |
| `vex-iq-foundation-g1-2` | VEX IQ Foundation Class | 1–2 |
| `vex-iq-foundation-g3-4` | VEX IQ Foundation Class | 3–4 |
| `vex-iq-foundation-g5-6` | VEX IQ Foundation Class | 5–6 |
| `vex-iq-foundation-g7-8` | VEX IQ Foundation Class | 7–8 |
| `vex-iq-competition-es` | VEX IQ Competition Team, Elementary | 3–6 |
| `vex-iq-competition-ms` | VEX IQ Competition Team, Middle School | 7–8 |
| `v5rc-competition` | VEX V5RC Competition Teams | 7–12 |
| `summer-camp` | Ms. Cecci's Summer Camp, English and Math | — |

Foundation classes are described as a pathway to the competition teams: students
learn the functions of VEX parts, tools and accessories, then brainstorm, design
and snap together using pegs and pins, keep Engineering Logbooks, program the
finished robot, and compete internally for certificates and awards.

Competition teams select 3–4 members from the matching Foundation Class and
compete regionally, provincially, and out of province. V5RC takes 1–5 members
from previous competitive teams or the IQ Competition Teams.

Summer Camp runs a customised curriculum with morning snack, lunch, work
materials and prizes included.

### Teams

The club competes under four numbers:

| Team | Program | Status |
| --- | --- | --- |
| 595C | VEX IQ | Active — 7th in Division at Worlds, Dallas TX |
| 595Y | VEX IQ | Active — qualified for Worlds this season |
| 16688A | V5RC | Active — also the byline on the field guide |
| 36467E | V5RC | Past |

### Events and achievements

- VEX VRC Regional Competition 2025
- VEX IQ Regional Competition 2025
- Team 595C, 7th in Division, World Championship, Dallas TX
- Team 595Y qualified for the World Championship this season
- Tournament Championships and Excellence Awards
- Invitations to the U.S. Open

The current site says "two invitations" to Worlds. With 595Y since qualifying,
that count is likely stale, so the site says "multiple" and `TODO.md` asks the
club to confirm the real figure rather than guessing at a new one.

### Unknown values

The current site does not publish class times, session lengths, fees, term
dates, or 2026 event dates. These are represented by a single exported constant:

```ts
export const TBD = "Contact us for current details" as const;
```

Any field set to `TBD` renders as that sentence with a link to `/contact`.
`src/content/club/TODO.md` lists every field currently holding it, so filling
them in is one pass through one list. No fee or schedule is guessed.

## Visual design

The club site keeps the palette and type already defined in `globals.css` — the
putty background, graphite ink, safety orange brand, pine and brass accents, all
of which already clear AA — and relaxes the presentation for a parent audience.

Differences from the guide:

- Larger body type, 17px base against the guide's 16px, and wider line height
- Generous section spacing; the club site breathes where the guide is dense
- Softer cards: larger radius, subtler borders, no instrument-panel readouts
- The `.tile-grid` field texture appears once, behind the home hero, as it does
  in the guide — it is the shared signature between the two sites
- The `.eyebrow` and `.readout` utilities are used sparingly, for stat figures
  and section labels only

`ClubHeader` carries a wordmark and the nav: About, Programs, Events, Contact,
a Register call to action, and a single outbound link to the field guide.
`ClubFooter` carries contact details, hours, program links, the guide link, and
the nonprofit line.

### Imagery

There are no usable photographs on the current site. Rather than stock imagery,
the site uses SVG illustrations built in the manner of
`src/components/diagrams/`, living in `src/components/club/art/`. Each sits in a
correctly proportioned container so a real team photo can replace it later
without touching layout.

## Registration

### Data

```sql
create table public.registrations (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  program_slug      text not null,
  student_first     text not null,
  student_last      text not null,
  student_grade     text not null,
  guardian_name     text not null,
  guardian_email    text not null,
  guardian_phone    text not null,
  notes             text,
  status            text not null default 'new'
);
```

Nothing beyond what is needed to place a child in a class. No birthdates, no home
addresses, no student contact details, no medical information.

### Privacy

This table holds identifying information about minors and their guardians, which
brings Alberta PIPA and PIPEDA obligations: collect only what is needed, use it
only for the stated purpose, keep it secure, and delete it when it is no longer
needed. The design's answers are minimal collection, the access rules below, an
explicit purpose statement on the form, and a documented deletion path in the
dashboard.

### Access rules

Row level security carries the whole burden, because the anon key is public by
design.

```sql
alter table public.registrations enable row level security;

-- Anyone may submit. Nobody anonymous may read.
create policy "anon can submit"
  on public.registrations for insert
  to anon, authenticated
  with check (true);

-- Reads, updates and deletes require membership in admins.
create policy "admins read"
  on public.registrations for select
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));
```

There is deliberately no anonymous `SELECT` policy, so an anonymous client can
write a row and can never read one back — not its own, not anyone else's.

```sql
create table public.admins (
  user_id uuid primary key references auth.users on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- Deliberately not `exists (select 1 from admins ...)`. A policy on admins that
-- queries admins recurses, and Postgres raises rather than evaluating it. A
-- signed-in user may read exactly their own row, which is all the client needs
-- to answer "am I an admin".
create policy "see own admin row"
  on public.admins for select
  using (user_id = auth.uid());
```

The `registrations` policies may still subquery `admins`, because the recursion
only occurs when a table's policy reads that same table.

Admins are added by SQL insert only; there is no self-serve path into the table.
Initially one account, Eli's. Adding Alex or Michael later is one statement.

### Abuse

A hidden honeypot field, a minimum time-on-form check, and Supabase's per-IP
rate limits. This is a club registration form, not a public API; the aim is to
stop drive-by bots, not a determined attacker.

### Form

`/register` takes an optional `?program=<slug>` so program pages can link
straight into a pre-selected form. Client-side validation on every field,
inline errors, a disabled button while submitting, and a success state that
tells the guardian what happens next. If Supabase is not configured the form
explains that and falls back to the contact details, matching how the guide
degrades without keys.

### Dashboard

`/admin` requires a Supabase session and a row in `admins`. Non-admins see a
plain "not authorised" message. Admins get a table of submissions, filters by
program and status, status changes between new / contacted / enrolled /
withdrawn, per-row deletion, and CSV export. It is `noindex`.

## Deployment

The safe path, given what the DNS actually shows.

Current state:

- Registrar: Go Daddy Domains Canada
- Nameservers: `ns1.siteground.net`, `ns2.siteground.net` — DNS is managed at
  SiteGround, not GoDaddy
- Web: `35.208.229.19`, SiteGround, WordPress
- Mail: `vexkan-ca.mail.protection.outlook.com`, Microsoft 365, with
  `v=spf1 include:spf.protection.outlook.com -all`

**Nameservers stay at SiteGround.** Only the `A` and `CNAME` records change, so
the `MX` and SPF records are never touched and club email keeps working
throughout. Moving nameservers to Vercel would silently break `admin@vexkan.ca`
unless mail records were recreated first, which is an unnecessary risk here.

Steps:

1. Push the repository to GitHub and import it as a Vercel project.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
3. Verify the Vercel preview URL end to end, including a real registration.
4. Add `vexkan.ca` and `www.vexkan.ca` as domains in Vercel and read off the
   records it asks for.
5. In SiteGround's DNS zone editor, repoint the apex `A` record and the `www`
   record to Vercel's values. Change nothing else in the zone.
6. Wait for propagation, confirm HTTPS is issued, and send a test email to
   `admin@vexkan.ca` to prove mail is unaffected.
7. Leave the WordPress install in place, unpublished, until the new site has run
   clean for a couple of weeks.

Rollback is restoring the two DNS records to `35.208.229.19`.

Steps 1, 2, 4, 5 and 7 need account access and are the club's to perform. The
implementation delivers the build, the verification, and the exact record values.

## Testing

- `npm run build` succeeds and every club route prerenders
- `npm run lint` clean
- Each of the eight program slugs resolves; unknown slugs 404
- Registration submits against a real Supabase project and the row appears
- An anonymous client attempting to read `registrations` is refused
- `/admin` refuses a signed-out visitor and a signed-in non-admin
- Every guide route answers under `/guide` and no guide link points at an old URL
- Keyboard navigation and visible focus on every interactive element
- Layouts hold at 360px, 768px and 1280px

## Risks

**Content gaps.** The site ships with `TBD` in the places the club has never
published. It is honest, but a parent looking for a price does not find one.
Mitigated by a single TODO list and a prominent contact route.

**Guide URL move.** Everything under `/guide` is new. Nothing links there today,
so the exposure is limited to any local bookmarks.

**Registration data.** Addressed above by minimal collection and admin-only
reads. The residual risk is an admin account being compromised, which is why
there is one admin to start.
