# Content the club still needs to supply

Every item below currently renders as "Contact us for current details". Each is
a single edit in the file named.

## `programs.ts` — all eight programs

| Field | Programs affected | What to write |
| --- | --- | --- |
| `schedule` | all 8 | Day and time, e.g. `"Tuesdays, 6:00–8:00PM"` |
| `fee` | all 8 | Cost and period, e.g. `"$180 per term"`, or `"Free"` |
| `gradeLabel` | `summer-camp` | The grades the camp accepts |

## `events.ts`

| Field | Events affected | What to write |
| --- | --- | --- |
| `date` | both 2025 regionals | Competition date once the REC Foundation publishes it |
| `location` | both 2025 regionals | Venue and city |
| `date` | `worlds-dallas-595c` | The year 595C placed 7th |
| `achievements` | — | The old site said "two invitations" to Worlds. 595Y has since qualified, so confirm the real count and replace the word "Multiple". |
| `note` | `595Y` | Add the placing once the season's result is known |

Add new competitions by appending to the `events` array. Delete a season's
events once they are past, or change `kind` to `"result"` and rewrite the
summary with the placing.

## Photographs

`src/components/club/art/RobotHero.tsx` is a drawing standing in for a photo of
a real team. Replacing it with a 4:3 team photo needs no layout change.
`PersonCard` shows initials in place of headshots.
