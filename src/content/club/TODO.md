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
| `date` | `worlds-dallas-595c` | The year 595C placed 7th |
| `achievements` | — | The old site said "two invitations" to Worlds. 595Y has since qualified, so confirm the real count and replace the word "Multiple". |
| `note` | `595Y` | Add the placing once the season's result is known |

Add new competitions by appending to the `events` array. Delete a season's
events once they are past, or change `kind` to `"result"` and rewrite the
summary with the placing.

## `people.ts`

| Field | Person affected | What to confirm |
| --- | --- | --- |
| `bio` | Eli Seeliger | "second year running the club" was accurate when this bio was written (club founded 2023). Confirm the current year count before publishing and update it. |
| `bio` | Alex Han | "Third year in VEX robotics" — confirm this is still the current count. |

## Photographs

`src/components/club/art/RobotHero.tsx` is a drawing standing in for a photo of
a real team. Replacing it with a 4:3 team photo needs no layout change.
`PersonCard` shows initials in place of headshots.
