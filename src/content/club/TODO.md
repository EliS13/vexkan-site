# Content the club still needs to supply

Every item below currently renders as "Contact us for current details". Each is
a single edit in the file named.

## `programs.ts` — all seven programs

| Field | Programs affected | What to write |
| --- | --- | --- |
| `schedule` | all 7 | Day and time, e.g. `"Tuesdays, 6:00–8:00PM"` |
| `fee` | all 7 | Cost and period, e.g. `"$180 per term"`, or `"Free"` |

## `events.ts`

| Field | Events affected | What to write |
| --- | --- | --- |
| `date` | both 2025 regionals | Competition date once the REC Foundation publishes it |
| `location` | both 2025 regionals | Venue and city |
| `date`, `location` | `worlds-16688a`, `worlds-iq-teams` | The year and host city of the World Championship these placings came from |
| `achievements` | — | The old site said "two invitations" to Worlds. Three teams have since been, so no count is stated at all. Add a real figure if you want one. |

Add new competitions by appending to the `events` array. Delete a season's
events once they are past, or change `kind` to `"result"` and rewrite the
summary with the placing.

## `people.ts`

| Field | Person affected | What to confirm |
| --- | --- | --- |
| `bio` | Eli Seeliger | The bio no longer states a year count, so it cannot go stale. Add one if you want the specifics back. |

## Photographs

`src/components/club/art/RobotHero.tsx` is a drawing standing in for a photo of
a real team. Replacing it with a 4:3 team photo needs no layout change.
`PersonCard` shows initials in place of headshots.
