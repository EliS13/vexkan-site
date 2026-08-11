# Content the club still needs to supply

Every item below currently renders as "Contact us for current details". Each is
a single edit in the file named.

## `programs.ts`, all four programs

| Field | Programs affected | What to write |
| --- | --- | --- |
| `schedule` | all 4 | Day and time, e.g. `"Tuesdays, 6:00–8:00PM"` |
| `cost` | all 4 | The figure **and** the term, e.g. `"$220 per term"` |

`cost` is back, having been removed once. A parent who finds the cost on the
program page feels informed; a parent who finds it after handing over a name
feels handled. Until a figure is written, the "What it costs" block says so
plainly and gives two ways to ask — it never goes silent about money.

Write the number and the term together. A bare `"$220"` makes a family guess
whether that is a month, a term or a season.

## `community.ts`

| Field | What to write |
| --- | --- |
| `upcomingWorkshops` | One entry per booked workshop. Empty is a normal state, not a broken one — the page leads with the request form when there is nothing here. |
| `pastWorkshops` | One entry per workshop already run, oldest last. `reached` only where somebody actually counted heads. |

Nothing is listed yet. The club has run summer camps — there are photographs of
the certificates — but no dates or headcounts were written down, and a number
invented here would be a public claim about the club.

The impact strip needs no maintenance: every figure in it is counted from this
repository rather than typed, so it cannot drift.

The workshop request form composes an email rather than writing to a table. If
it ever moves to Supabase, it needs a table somebody actually reads — a request
landing in an unwatched table is worse than no form at all, because a teacher
would think they had asked.

## `events.ts`

| Field | Events affected | What to write |
| --- | --- | --- |
| `date`, `location` | `worlds-16688a`, `worlds-iq-teams` | The year and host city of the World Championship these placings came from |
| `achievements` | — | The old site said "two invitations" to Worlds. Three teams have since been, so no count is stated at all. Add a real figure if you want one. |

Only one Alberta competition is listed, Mecha Mayhem 2027, because it is the
only one that could be verified on events.vex.com. Add the rest from the map
search there, with the event name, dates, venue and city for each. Nothing goes
in this file that has not been checked against a real listing.

VEX and the REC Foundation now run separate competitions. The Inspire Award
criteria on the results page come from the REC Foundation's judging guide. If
VEX publishes its own wording, add it as a second labelled set rather than
assuming the two match.

Add new competitions by appending to the `events` array. Delete a season's
events once they are past, or change `kind` to `"result"` and rewrite the
summary with the placing.

## `events.ts`, the `seasons` field on each team

Five teams carry a season because the club's own award list proves it: VEX
names each season after its game, so an award won at a "Mix and Match" or
"Push Back" event dates itself, and 36467E's trophy reads High Stakes.

| Team | Seasons recorded |
| --- | --- |
| `595B`, `595C`, `595Y`, `16688A`, `16688K` | `2025–26` |
| `36467E` | `2024–25` |
| `565A`, `565D`, `595A` | none yet |

Nothing here says a team competed in **only** those seasons — it says that is
all the record proves. Add the rest by hand; a team with an empty list simply
shows no season on its panel rather than a wrong one.

## `people.ts`

| Field | Person affected | What to confirm |
| --- | --- | --- |
| `bio` | Eli Seeliger | The bio no longer states a year count, so it cannot go stale. Add one if you want the specifics back. |

## Photographs

`src/components/club/art/RobotHero.tsx` is a drawing standing in for a photo of
a real team. Replacing it with a 4:3 team photo needs no layout change.
`PersonCard` shows initials in place of headshots.
