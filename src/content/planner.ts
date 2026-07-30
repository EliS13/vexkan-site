export type EventKind = "competition" | "deadline" | "meeting" | "scrimmage" | "build";

export interface PlannerEvent {
  id: string;
  date: string;
  title: string;
  kind: EventKind;
  /** Older single-note field, still shown if an event has one. */
  notes: string;
  /** Keyed by the kind's field keys, so each kind captures its own goals. */
  values?: Record<string, string>;
}

export interface PlannerField {
  key: string;
  label: string;
  placeholder: string;
  rows?: number;
}

export interface EventKindInfo {
  id: EventKind;
  label: string;
  scheme: "purple" | "teal" | "amber" | "neutral";
  /** One line on what this kind is for, shown under the chips. */
  what: string;
  titlePlaceholder: string;
  /** The concrete things that have to be decided for this kind of day. */
  fields: PlannerField[];
  /** Prompts worth thinking through before the day arrives. */
  checklist: string[];
}

export const EVENT_KINDS: EventKindInfo[] = [
  {
    id: "competition",
    label: "Competition",
    scheme: "purple",
    what: "A real tournament. Everything else on the calendar is working backwards from these.",
    titlePlaceholder: "Event name, e.g. Signature Event or State Championship",
    fields: [
      { key: "goal", label: "What counts as a good day", placeholder: "A target you can check afterwards. Qualify top 8, beat our skills score, autonomous scoring every match.", rows: 2 },
      { key: "ready", label: "What has to be ready, and by when", placeholder: "Robot drive-ready by the Thursday before. Autonomous tested on a real field. Notebook printed.", rows: 3 },
      { key: "driver", label: "Who is driving, and who is backup", placeholder: "Names. A driver who has not practised this week is not ready.", rows: 1 },
      { key: "pack", label: "Packing list and who brings it", placeholder: "Spare motors, charged batteries, tools, the notebook, tape. Put a name against each.", rows: 3 },
      { key: "logistics", label: "Leave time and travel", placeholder: "When you leave, who is driving there, when inspection opens.", rows: 2 },
    ],
    checklist: [
      "Is the robot passing inspection rules, size and motor or wattage limits?",
      "Is autonomous actually tested on a real field, not just in theory?",
      "Is the notebook up to date and readable by a judge?",
      "Who is driving, and have they had real practice this week?",
      "Spares packed: what broke last time is what will break again.",
    ],
  },
  {
    id: "scrimmage",
    label: "Scrimmage",
    scheme: "amber",
    what: "Practice against other teams. The cheapest place to find out what breaks.",
    titlePlaceholder: "Where, e.g. scrimmage at the high school",
    fields: [
      { key: "goal", label: "The goal for the day", placeholder: "One sentence. Not just turn up and play matches.", rows: 2 },
      { key: "testing", label: "What we are testing", placeholder: "One or two things, chosen before you get there.", rows: 2 },
      { key: "measure", label: "The number we are recording", placeholder: "Cycle time, points per match, how many autonomous runs hit. Decide who writes it down.", rows: 2 },
      { key: "fixCheck", label: "Failure we are checking is fixed", placeholder: "The thing that broke last time. Did the fix hold under match pressure?", rows: 2 },
    ],
    checklist: [
      "What one number are you trying to improve, and how will you record it?",
      "Which failure from last time are you checking is fixed?",
      "Bring the notebook, this is where the good entries come from.",
    ],
  },
  {
    id: "deadline",
    label: "Deadline",
    scheme: "amber",
    what: "Something due on a date, whether or not you are ready for it.",
    titlePlaceholder: "What is due, e.g. parts order, notebook submission",
    fields: [
      { key: "deliverable", label: "Exactly what is due", placeholder: "Be specific enough that anyone can tell whether it happened. Not \"work on notebook\".", rows: 2 },
      { key: "owner", label: "Who owns it", placeholder: "One name, not the whole team. Shared ownership is how deadlines get missed.", rows: 1 },
      { key: "done", label: "Definition of done", placeholder: "What has to be true for this to be finished. Submitted, ordered, tested, printed.", rows: 2 },
      { key: "blocks", label: "What this blocks if it slips", placeholder: "So future you knows how bad it is to miss. If it blocks nothing, ask why it is on the calendar.", rows: 2 },
      { key: "before", label: "What has to happen first", placeholder: "The step before this one, and who is doing it.", rows: 2 },
    ],
    checklist: [
      "Who specifically owns this, not just the whole team?",
      "What does this block if it is late?",
      "Is there a step before it that has to happen first?",
    ],
  },
  {
    id: "build",
    label: "Build session",
    scheme: "teal",
    what: "Time at the table with the robot. Give each one a single goal.",
    titlePlaceholder: "What you are building, e.g. intake stage two",
    fields: [
      { key: "goal", label: "The one goal for this session", placeholder: "One goal, not five. Something you can hold up at the end and say yes or no to.", rows: 2 },
      { key: "subsystem", label: "Subsystem you are working on", placeholder: "Drivetrain, intake stage two, the lift, autonomous routine.", rows: 1 },
      { key: "done", label: "How you will know it worked", placeholder: "The test you will run before you pack up. Ten cycles without a jam, holds at full speed.", rows: 2 },
      { key: "parts", label: "Parts that must be on hand", placeholder: "List them now. A session that stops because a gear is on order is a wasted session.", rows: 2 },
      { key: "who", label: "Who is coming, and who writes the notebook entry", placeholder: "Names. Pick the notebook person before you start, not after everyone leaves.", rows: 2 },
    ],
    checklist: [
      "Do you have every part you need, or is something still on order?",
      "What is the one thing that has to work by the end of the session?",
      "Who is writing the notebook entry while it is still fresh?",
    ],
  },
  {
    id: "meeting",
    label: "Meeting",
    scheme: "neutral",
    what: "Talking, not building. Design reviews, strategy, planning.",
    titlePlaceholder: "Purpose, e.g. design review or strategy for the next event",
    fields: [
      { key: "decision", label: "The decision that has to come out of this", placeholder: "If nothing gets decided, it was a chat. Name the call you need to make.", rows: 2 },
      { key: "attendees", label: "Who must be there", placeholder: "Only the people the decision needs. Everyone else can read the outcome.", rows: 1 },
      { key: "agenda", label: "Agenda", placeholder: "In order, with rough timings. Longest item first while everyone is fresh.", rows: 3 },
      { key: "record", label: "Where the decision gets written down", placeholder: "Notebook entry, which stage, and who writes it.", rows: 2 },
    ],
    checklist: [
      "What decision has to come out of this?",
      "Who has to be there for that decision to hold?",
      "Where does the decision get written down afterwards?",
    ],
  },
];

export function kindInfo(kind: EventKind): EventKindInfo {
  return EVENT_KINDS.find((k) => k.id === kind) ?? EVENT_KINDS[0];
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "Tuesday, 28 July 2026" from a YYYY-MM-DD key, without timezone drift. */
export function formatDateLong(key: string): string {
  const d = new Date(key + "T00:00:00");
  if (Number.isNaN(d.getTime())) return key;
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * The shape of a season, straight out of Chapter 2. Shown as a reference strip
 * so a team can see which phase they are supposed to be in right now.
 */
export const SEASON_PHASES = [
  {
    label: "Manual drops",
    when: "Late April or early May",
    what: "Read the scoring section first, then the general rules hunting for what changed.",
  },
  {
    label: "Brainstorm",
    when: "First few meetings",
    what: "Analyse the game, generate rough ideas, research, debate, score them, then prototype.",
  },
  {
    label: "Build",
    when: "Summer into autumn",
    what: "Drivetrain first, then the scoring mechanisms. Get it reliable before you get it fast.",
  },
  {
    label: "Iterate",
    when: "After the first scrimmage",
    what: "Test, measure, change one thing at a time. Re-read the manual now, it reads differently.",
  },
  {
    label: "Late season",
    when: "Before your last events",
    what: "Speed upgrades like a PTO belong here, only once the base robot already scores reliably.",
  },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** RFC 5545 section 3.3.11: backslash, semicolon, comma and newlines are special. */
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** RFC 5545 section 3.1: content lines wrap at 75 octets, continued with a space. */
function foldIcsLine(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;

  const out: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const size = enc.encode(ch).length;
    // Continuation lines carry a leading space, so they hold one byte less.
    const limit = out.length === 0 ? 75 : 74;
    if (bytes + size > limit) {
      out.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  if (current) out.push(current);
  return out.join("\r\n ");
}

/**
 * An .ics file, so the season imports straight into Google Calendar rather than
 * living only in this browser. All-day events, which is how these actually work.
 */
export function toIcs(events: PlannerEvent[], teamName: string): string {
  const stamp =
    new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const body = events
    .map((e) => {
      const start = e.date.replace(/-/g, "");
      const next = new Date(e.date + "T00:00:00");
      next.setDate(next.getDate() + 1);
      const end = `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;
      const summary = escapeIcsText(`${kindInfo(e.kind).label}: ${e.title}`.replace(/\r?\n/g, " "));
      const desc = escapeIcsText(
        eventSections(e)
          .map((sec) => `${sec.label}: ${sec.value}`)
          .join("\n")
      );
      return [
        "BEGIN:VEVENT",
        `UID:${e.id}@vex-field-guide`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${start}`,
        `DTEND;VALUE=DATE:${end}`,
        foldIcsLine(`SUMMARY:${summary}`),
        desc ? foldIcsLine(`DESCRIPTION:${desc}`) : "",
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\r\n");
    })
    .join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${teamName}//VEX Season Planner//EN`,
    "CALSCALE:GREGORIAN",
    body,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function daysUntil(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}


/** Field label and value pairs to show or export for an event. */
export function eventSections(event: PlannerEvent): Array<{ label: string; value: string }> {
  const info = kindInfo(event.kind);
  const out: Array<{ label: string; value: string }> = [];
  for (const f of info.fields) {
    const v = (event.values?.[f.key] ?? "").trim();
    if (v) out.push({ label: f.label, value: v });
  }
  const legacy = (event.notes ?? "").trim();
  if (legacy) out.push({ label: "Notes", value: legacy });
  return out;
}
