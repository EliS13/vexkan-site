/**
 * Entry structure follows the VEX engineering notebook judging rubric, which
 * scores the design process (identify, brainstorm, select, build, test, refine)
 * plus teamwork, resource management, and formatting.
 *
 * Each stage asks for different things, because a test entry and a brainstorm
 * entry are not the same kind of record.
 */

export type Stage =
  | "identify"
  | "brainstorm"
  | "select"
  | "build"
  | "test"
  | "refine"
  | "meeting"
  | "management"
  | "strategy"
  | "driver"
  | "scouting"
  | "competition";

export interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  rows?: number;
}

export interface StageInfo {
  id: Stage;
  label: string;
  scheme: "purple" | "teal" | "amber" | "neutral";
  /** What a judge is looking for in this kind of entry. */
  rubric: string;
  fields: FieldDef[];
}

export const STAGES: StageInfo[] = [
  {
    id: "identify",
    label: "Identify the problem",
    scheme: "purple",
    rubric: "Name the challenge in your own words, before any solution exists.",
    fields: [
      { key: "problem", label: "The problem", placeholder: "What is wrong, or what does the game ask us to do?", rows: 3 },
      { key: "trigger", label: "What made us notice", placeholder: "A rule in the manual, a match we lost, a part that keeps breaking.", rows: 2 },
      { key: "constraints", label: "Rules and limits", placeholder: "Size box, motor or wattage cap, budget, time left in the season.", rows: 2 },
      { key: "success", label: "How we will know it is fixed", placeholder: "The measurable thing that has to be true. Cycle under 6 seconds, no more stalls.", rows: 2 },
    ],
  },
  {
    id: "brainstorm",
    label: "Brainstorm",
    scheme: "purple",
    rubric: "Judges want a wide list of options with labelled sketches, not one idea.",
    fields: [
      { key: "options", label: "Ideas on the table", placeholder: "One idea per line. Keep them rough, this is not a design session yet.", rows: 5 },
      { key: "sketches", label: "Sketch notes", placeholder: "What your drawings show. Reference the page or photo number.", rows: 2 },
      { key: "research", label: "Where we looked", placeholder: "Reveal videos, forum threads, other teams' builds.", rows: 2 },
      { key: "wild", label: "Long shots we kept", placeholder: "Ideas that sound silly but nobody could rule out yet.", rows: 2 },
    ],
  },
  {
    id: "select",
    label: "Select an approach",
    scheme: "purple",
    rubric: "Show why this one won and what you rejected. A decision with no reason cannot be checked later.",
    fields: [
      { key: "criteria", label: "What we judged on", placeholder: "Consistency, build complexity, cycle time, risk of failure, relevance to the meta.", rows: 2 },
      { key: "comparison", label: "How the options scored", placeholder: "Your scoring matrix, or the short version of it.", rows: 4 },
      { key: "chosen", label: "What we picked, and why it won", placeholder: "The winning idea and the reason it beat the others.", rows: 3 },
      { key: "rejected", label: "What we dropped, and why", placeholder: "Judges reward this more than anything. Say what failed the test and how.", rows: 3 },
      { key: "risks", label: "Risks we are accepting", placeholder: "What could still go wrong with this choice.", rows: 2 },
    ],
  },
  {
    id: "build",
    label: "Build / program",
    scheme: "teal",
    rubric: "Record what you actually built or coded, with the numbers you used.",
    fields: [
      { key: "built", label: "What we built or coded", placeholder: "The mechanism, the subsystem, or the routine you worked on.", rows: 3 },
      { key: "parts", label: "Parts and motors used", placeholder: "Motor count and cartridges, gear teeth, wheel sizes, what it mounts to.", rows: 2 },
      { key: "settings", label: "Numbers we set", placeholder: "RPM, gear ratio, port numbers, PID values, sensor thresholds.", rows: 2 },
      { key: "problems", label: "What went wrong while building", placeholder: "Interference, friction, a part that would not fit, code that would not compile.", rows: 3 },
      { key: "nextStep", label: "Next step", placeholder: "What the next person picking this up should do.", rows: 2 },
    ],
  },
  {
    id: "test",
    label: "Test",
    scheme: "teal",
    rubric: "Write the measurement, not the impression. Judges look for real data.",
    fields: [
      { key: "procedure", label: "How we tested it", placeholder: "Setup, starting position, what counted as one run.", rows: 3 },
      { key: "measured", label: "What we measured", placeholder: "Cycle time, score in 60 seconds, motor temperature, distance.", rows: 2 },
      { key: "results", label: "The numbers we got", placeholder: "Write down the number, not just the call. One line per trial is fine.", rows: 4 },
      { key: "trials", label: "How many runs", placeholder: "One run is not data. How many, and how consistent were they?", rows: 1 },
      { key: "observations", label: "What the numbers do not show", placeholder: "It rattled at full speed. It only jammed when the ball came in sideways.", rows: 3 },
    ],
  },
  {
    id: "refine",
    label: "Refine / iterate",
    scheme: "teal",
    rubric: "Show the loop closing: what the test told you, and what you changed because of it.",
    fields: [
      { key: "learned", label: "What the test told us", placeholder: "The conclusion you drew from the last set of numbers.", rows: 2 },
      { key: "change", label: "What we changed", placeholder: "The actual edit. New ratio, new geometry, rewritten routine.", rows: 3 },
      { key: "beforeAfter", label: "Before and after numbers", placeholder: "1200 RPM to 900 RPM. Motor temp 55C to 38C. Cycle 8.1s to 6.4s.", rows: 2 },
      { key: "worked", label: "Did it work", placeholder: "Say so plainly, including when the answer is no.", rows: 2 },
      { key: "remaining", label: "What is still broken", placeholder: "What this fix did not solve.", rows: 2 },
    ],
  },
  {
    id: "strategy",
    label: "Strategy",
    scheme: "amber",
    rubric: "Show that your robot exists to serve a scoring plan, not the other way around.",
    fields: [
      { key: "priority", label: "Highest-value thing we can consistently score", placeholder: "Not the flashiest thing, the one you can hit every match.", rows: 2 },
      { key: "whyThis", label: "Why this over the alternatives", placeholder: "What you compared it against, and the numbers behind the call.", rows: 3 },
      { key: "matchPlan", label: "How a match should go", placeholder: "Start to finish, including where you are at 15 seconds left.", rows: 4 },
      { key: "autonPlan", label: "What autonomous has to do", placeholder: "Routine, expected points, and what it must not collide with.", rows: 2 },
      { key: "risks", label: "What beats this plan", placeholder: "Defence, a faster opponent, a mechanism that jams under pressure.", rows: 2 },
    ],
  },
  {
    id: "driver",
    label: "Driver practice",
    scheme: "teal",
    rubric: "Driving is a skill you train, and the log proves you trained it.",
    fields: [
      { key: "drill", label: "What we practised", placeholder: "The specific cycle or routine, not just driving around.", rows: 2 },
      { key: "reps", label: "How many runs", placeholder: "Number of attempts, and how long the session was.", rows: 1 },
      { key: "times", label: "Times and scores", placeholder: "Cycle times or skills scores. Write every run, not just the best.", rows: 3 },
      { key: "mistakes", label: "Where time is being lost", placeholder: "Missed pickups, lining up too slowly, dropping on the way.", rows: 3 },
      { key: "nextDrill", label: "What to practise next", placeholder: "The one thing to fix before the next session.", rows: 2 },
    ],
  },
  {
    id: "scouting",
    label: "Scouting notes",
    scheme: "amber",
    rubric: "Notes on other teams, so alliance picks are evidence rather than a guess.",
    fields: [
      { key: "teams", label: "Teams watched", placeholder: "Team numbers, and which matches you saw them in.", rows: 2 },
      { key: "strengths", label: "What they do well", placeholder: "Cycle speed, autonomous, defence, consistency.", rows: 3 },
      { key: "weaknesses", label: "Where they struggle", placeholder: "What goes wrong for them, and how often.", rows: 3 },
      { key: "allianceFit", label: "How they would pair with us", placeholder: "Do they cover a gap in our robot, or duplicate what we already do?", rows: 2 },
      { key: "source", label: "Where the numbers came from", placeholder: "Skills standings, match history, or watched in person.", rows: 1 },
    ],
  },
  {
    id: "competition",
    label: "Competition results",
    scheme: "purple",
    rubric: "The debrief. What the event actually taught you, written down before you forget it.",
    fields: [
      { key: "event", label: "Event and date", placeholder: "Which competition, and when.", rows: 1 },
      { key: "results", label: "Record, ranking, awards", placeholder: "Qualification record, final rank, skills score, anything you won.", rows: 2 },
      { key: "matchData", label: "Match by match numbers", placeholder: "Scores, cycle counts, autonomous hit or miss. One line per match.", rows: 4 },
      { key: "whatWorked", label: "What worked", placeholder: "The parts of the robot and the plan that held up under pressure.", rows: 3 },
      { key: "whatBroke", label: "What broke, and when", placeholder: "Failures, and whether they happened once or every match.", rows: 3 },
      { key: "fixes", label: "Changes before the next event", placeholder: "Ranked, with the most costly problem first.", rows: 3 },
    ],
  },
  {
    id: "meeting",
    label: "Meeting log",
    scheme: "amber",
    rubric: "Who showed up, what got done, what is next. This is your team memory.",
    fields: [
      { key: "agenda", label: "Goals for today", placeholder: "What we planned to get through this meeting.", rows: 2 },
      { key: "done", label: "What actually got done", placeholder: "Per person or per subsystem.", rows: 4 },
      { key: "blockers", label: "What is blocking us", placeholder: "Missing parts, a rule we need clarified, something that will not work.", rows: 2 },
      { key: "assignments", label: "Who is doing what next", placeholder: "Name, task, and the date it is due.", rows: 3 },
    ],
  },
  {
    id: "management",
    label: "Team / resources",
    scheme: "neutral",
    rubric: "Roles, deadlines, budget, and how you split the work.",
    fields: [
      { key: "roles", label: "Who owns what", placeholder: "Leads for build, drive, code, notebook. Remember specialists still help everywhere.", rows: 3 },
      { key: "timeline", label: "Deadlines coming up", placeholder: "Next competition, when the robot has to be drive-ready.", rows: 2 },
      { key: "budget", label: "Parts, money, and inventory", placeholder: "What we ordered, what we are short on, what it cost.", rows: 3 },
      { key: "risks", label: "What could put us behind", placeholder: "A part on backorder, a teammate away, a subsystem nobody has started.", rows: 2 },
      { key: "decisions", label: "Decisions made", placeholder: "Team decisions worth remembering next season.", rows: 2 },
    ],
  },
];

export function getStage(id: Stage): StageInfo {
  return STAGES.find((s) => s.id === id) ?? STAGES[0];
}

export interface Entry {
  id: string;
  stage: Stage;
  date: string;
  title: string;
  members: string;
  /** Keyed by the stage's field keys, so each stage stores its own shape. */
  values: Record<string, string>;
  /** Resized JPEG data URLs. Judges want to see the build, not just read it. */
  images?: string[];
}

/** Labels for every field key across every stage, plus the older flat schema. */
const LABEL_LOOKUP: Record<string, string> = {
  ...Object.fromEntries(STAGES.flatMap((s) => s.fields.map((f) => [f.key, f.label]))),
  goal: "Goal",
  body: "What we did",
  data: "Data and measurements",
  decision: "Decision and reasoning",
  nextStep: "Next step",
};

function humanize(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

/**
 * The sections to show or export for an entry: the current stage's fields
 * first, then anything left over so switching stage never loses what you typed.
 */
export function entrySections(entry: Entry): Array<{ label: string; value: string }> {
  const stage = getStage(entry.stage);
  const out: Array<{ label: string; value: string }> = [];
  const seen = new Set<string>();

  for (const f of stage.fields) {
    seen.add(f.key);
    const v = (entry.values?.[f.key] ?? "").trim();
    if (v) out.push({ label: f.label, value: v });
  }
  for (const [k, raw] of Object.entries(entry.values ?? {})) {
    if (seen.has(k)) continue;
    const v = (raw ?? "").trim();
    if (v) out.push({ label: LABEL_LOOKUP[k] ?? humanize(k), value: v });
  }
  return out;
}

export function emptyEntry(stage: Stage = "meeting"): Entry {
  return {
    id: crypto.randomUUID(),
    stage,
    date: new Date().toISOString().slice(0, 10),
    title: "",
    members: "",
    values: {},
    images: [],
  };
}

/** Pulls forward entries saved under the older flat field schema. */
export function migrateEntry(raw: Record<string, unknown>): Entry {
  if (raw && typeof raw === "object" && raw.values) {
    const e = raw as unknown as Entry;
    return { ...e, images: Array.isArray(e.images) ? e.images : [] };
  }
  const legacyKeys = ["goal", "body", "data", "decision", "rejected", "nextStep"];
  const values: Record<string, string> = {};
  legacyKeys.forEach((k) => {
    const v = raw?.[k];
    if (typeof v === "string" && v.trim()) values[k] = v;
  });
  return {
    id: (raw?.id as string) ?? crypto.randomUUID(),
    stage: (raw?.stage as Stage) ?? "meeting",
    date: (raw?.date as string) ?? new Date().toISOString().slice(0, 10),
    title: (raw?.title as string) ?? "",
    members: (raw?.members as string) ?? "",
    values,
    images: [],
  };
}
