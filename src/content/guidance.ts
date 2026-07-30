/**
 * Topic answers for the assistant: a short summary, concrete next steps, the
 * chapters that back it up, and vetted outside links for going deeper.
 *
 * These are written so a team can act without re-reading the whole chapter.
 */
import { Program } from "./sources";

export interface Guidance {
  id: string;
  title: string;
  /** Extra words to match on beyond the title. */
  keywords: string[];
  summary: string;
  nextSteps: string[];
  chapterSlugs: string[];
  toolHref?: string;
  toolLabel?: string;
  /** Links that speak directly to this problem: threads, videos, specific docs. */
  directSourceIds: string[];
  sourceIds: string[];
  /** Words used to build live YouTube and VEX Forum searches for this topic. */
  searchTerms: string;
  /** Extra line shown only for one program, where the kits genuinely differ. */
  programNote?: Partial<Record<Program, string>>;
}

export const GUIDANCE: Guidance[] = [
  {
    id: "drivetrain",
    title: "Picking a drivetrain and gear ratio",
    keywords: ["drivetrain", "drive", "gear ratio", "speed", "torque", "rpm", "wheel", "omni", "traction", "tank", "motor", "cartridge", "wattage", "55w", "fast", "slow"],
    summary:
      "Pick your target speed first, then let wheel size and gear ratio follow from it, and pick motor count to support that ratio. Build the ratio around the robot's final weight, not what it weighs on day one. In V5RC, watch the drivetrain wattage cap before you add motors.",
    nextSteps: [
      "Weigh or estimate your robot at full build, not as it sits today.",
      "Decide the speed you actually want on the field, then work backwards to a ratio.",
      "Check the total against the current season's drivetrain wattage limit before committing.",
      "Under about 62 in/sec stays controllable on almost any build. Past 70 you need excellent driving and a very stiff frame.",
      "Centre a traction pair on an omni base if you want pushing power without ruining your turning radius.",
    ],
    chapterSlugs: ["building-the-drivetrain", "advanced-drivetrains"],
    toolHref: "/tools/gear-ratio",
    toolLabel: "Model it in the gear ratio calculator",
        programNote: {
      iq: "IQ has no cartridges and no wattage cap to plan around. The IQ Smart Motor runs at one fixed speed, so your external gear ratio and wheel choice are the only levers you have. Remember IQ wheels are named by travel per turn, not diameter.",
      v5: "V5RC caps drivetrain motor power, currently 55W in Override, and you can mix 11W and 5.5W motors to land under it. Confirm the number in this season's manual before you build.",
    },
    searchTerms: "drivetrain gear ratio build",
    directSourceIds: ["thr55w", "vidDrivebase", "vidIqDrive", "motor11w", "motor55w", "iqWheels", "iqBuilds", "v5Builds"],
    sourceIds: ["motor11w", "motor55w", "manual", "v5Assembly", "sigbots", "iqWheels", "iqGame", "kb"],
  },
  {
    id: "intake",
    title: "Choosing an intake",
    keywords: ["intake", "roller", "flex wheel", "compliant", "chain", "hook", "conveyor", "claw", "pick up", "collect", "grab", "rings", "donuts", "pins", "blocks", "descore"],
    summary:
      "Start with a roller, flex wheels or rubber bands. Rollers handle odd shapes far better than people expect, and they keep working season to season. Add a second stage only once stage one is reliable, and treat polycarbonate as a scarce resource rather than a default.",
    nextSteps: [
      "Write down the job first: collecting off the floor, feeding a scorer, holding one element, or descoring. The job picks the mechanism, not the shape.",
      "Prototype the simplest roller that spans your front, flex wheels or rubber bands, before adding any second stage.",
      "Solve sizing and placement with geometry and compression before you switch mechanism type.",
      "If the scoring point is high, add a second stage to carry it up, usually a belt or another set of rubber band rollers. Keep stage one a plain roller.",
      "Tune compression before you change mechanism. On V5 that means flex wheel durometer, softer for harder objects. On either program, rubber bands are the cheapest way to add grip.",
    ],
    chapterSlugs: ["intakes", "outtake-and-scoring"],
    toolHref: "/tools/mechanism-picker",
    toolLabel: "Run the mechanism picker",
        programNote: {
      iq: "IQ has no flex wheels or polycarbonate. You build intakes from intake rollers, intake belts, tank treads on sprockets, intake flaps, and rubber bands for grip. A roller claw with a fixed friction plate on one side is a common IQ answer.",
      v5: "Flex wheels and rubber band rollers are the usual stage one, with a belt or a second roller set carrying elements up. Polycarbonate hooks work but spend your plastic allowance, recent rules require every cut piece to nest into one 12in by 24in sheet, so treat plastic as scarce.",
    },
    searchTerms: "intake build tutorial",
    directSourceIds: ["vidOverrideIntake", "thrIntakeMethods", "thrStageOne", "thrFlexIntake", "thrBuildRoller", "thrIqIntake", "sigbotsIntakes", "iqAssembly", "plasticRule"],
    sourceIds: ["sigbotsIntakes", "flexWheels", "v5Assembly", "iqAssembly", "iqClaws", "iqIntakeRoller", "forum"],
  },
  {
    id: "pto",
    title: "Adding a PTO",
    keywords: ["pto", "power take off", "motor sharing", "differential", "slide", "gravity", "latch", "shift", "share motor"],
    summary:
      "A PTO reallocates power, it does not create it. It is a late-season upgrade that makes an already-reliable robot faster, and it will not rescue a robot that is still unreliable. The highest value trade is drivetrain against a mechanism, since driving and scoring rarely happen at the same instant.",
    nextSteps: [
      "Confirm your base robot already scores reliably without one. If it does not, fix that first.",
      "Find two functions that never need full power at the same moment, that pair is your candidate.",
      "Pick the type on space and switching speed: differential, slide, gravity, or latch.",
      "Budget real tuning time for friction. The disengaged side has to actually disengage or it drags.",
      "Test the switch under match conditions, not on the bench, before you rely on it.",
    ],
    chapterSlugs: ["ptos"],
    searchTerms: "PTO power take off build",
    directSourceIds: ["thrIntakeMethods", "sigbots", "v5Assembly", "iqAssembly"],
    sourceIds: ["forum", "sigbots", "v5Assembly", "iqAssembly", "kb"],
  },
  {
    id: "pneumatics",
    title: "Wiring pneumatics",
    keywords: ["pneumatic", "cylinder", "solenoid", "air", "tank", "piston", "regulator", "tee", "expansion"],
    summary:
      "Pneumatics are a two-position tool, not a lift. Use them when a motor is too slow. Solenoids, not tanks, are your real budget constraint: one solenoid drives one double-acting cylinder, so decide what genuinely needs independent timing before you buy anything.",
    nextSteps: [
      "Sort every pneumatic function into needs-independent-timing versus always-fires-together.",
      "Anything that always fires together can share one solenoid through a tee fitting.",
      "Count the solenoids that leaves you needing, and check that against what you own.",
      "If a mechanism needs to stop partway, use a motor instead. A cylinder is only in or out.",
      "Remember every solenoid draws from the same tank, so more functions means fewer full-power fires each.",
    ],
    chapterSlugs: ["pneumatics-iq", "pneumatics-v5rc"],
    programNote: {
      iq: "IQ pneumatics show up in claws, quick latches, PTO shifts, and expanding past the starting size box.",
      v5: "A stock V5 Pneumatics Kit ships with two double-acting solenoids. More than two independently-timed functions means buying more.",
    },
    searchTerms: "pneumatics solenoid setup",
    directSourceIds: ["v5Assembly", "iqAssembly", "kb"],
    sourceIds: ["kb", "forum", "v5Assembly", "iqAssembly"],
  },
  {
    id: "notebook",
    title: "Running the engineering notebook",
    keywords: ["notebook", "journal", "log", "judging", "judges", "documentation", "design process", "rubric", "award"],
    summary:
      "Judges score the process, not the robot. The entries that score are the ones with a number attached and a record of what you rejected. A notebook only pays off if someone actually goes back and reads it.",
    nextSteps: [
      "Write the number, not just the call. A decision with no number cannot be checked next season.",
      "Record what you rejected and why, in the same entry as what you chose.",
      "Give every entry a title, a date, and the names of who was there.",
      "Log the design process end to end: identify, brainstorm, select, build, test, refine.",
      "Before a competition, read back through your own entries so you can answer a judge from memory.",
    ],
    chapterSlugs: ["the-engineering-notebook"],
    toolHref: "/tools/notebook-template",
    toolLabel: "Open the notebook tool",
    searchTerms: "engineering notebook judging",
    directSourceIds: ["thr2654e", "thrNotebook", "thrNotebookTemplate"],
    sourceIds: ["vex", "forum", "kb", "manual", "iqGame"],
  },
  {
    id: "manual",
    title: "Reading the game manual",
    keywords: ["manual", "rules", "rule", "legal", "referee", "q&a", "gdc", "scoring", "game", "season", "illegal"],
    summary:
      "The manual is a design brief, not a rulebook to comply with. Go to the scoring section first so you understand what winning looks like mechanically, then read the general rules hunting for what changed. When a rule is genuinely unclear, use the official Q&A instead of guessing.",
    nextSteps: [
      "Read the scoring section before anything else, every season starts from scratch.",
      "Read the general rules a second time looking only for wording that changed.",
      "Submit anything genuinely ambiguous to the official Q&A so you get an answer on the record.",
      "Re-read the manual after your first design meeting and again after your first scrimmage.",
      "Before you commit to a design, check it against the size, expansion, and motor rules.",
    ],
    chapterSlugs: ["season-starts-before-you-touch-a-robot"],
    programNote: {
      iq: "The 2026-27 VEX IQ game is Level Up, scored with bean bags.",
      v5: "The 2026-27 V5RC game is Override, which adds a drivetrain wattage limit.",
    },
    searchTerms: "game manual rules explained",
    directSourceIds: ["manual", "iqGame", "thrOverride", "iqLevelUp", "plasticRule"],
    sourceIds: ["manual", "iqGame", "iqLevelUp", "forum", "vex"],
  },
  {
    id: "brainstorm",
    title: "Brainstorming and picking a design",
    keywords: ["brainstorm", "idea", "design", "decide", "scoring matrix", "prototype", "concept", "strategy", "meta"],
    summary:
      "Find the right idea fast enough that you still have time to build, test, and refine it. Argue every concept before building, then put the survivors in a scoring matrix so numbers replace the loudest voice in the room.",
    nextSteps: [
      "Answer one question first: what is the highest-value thing we can consistently score?",
      "Generate rough ideas only, sketches and two-sentence descriptions. Do not polish yet.",
      "Research what other teams tried before committing six weeks to something already known to fail.",
      "Stress-test each idea against three questions: what does it do well, what breaks first, how hard is it to recover.",
      "Score the survivors across your criteria, then build a fast prototype of the winner.",
    ],
    chapterSlugs: ["brainstorming-your-robot", "research-skills-for-robotics"],
    searchTerms: "robot design reveal strategy",
    directSourceIds: ["thrOverride", "iqLevelUp", "vidChannels", "iqBuilds", "v5Builds"],
    sourceIds: ["forum", "vex", "iqLevelUp", "kb"],
  },
  {
    id: "combining",
    title: "Combining or separating mechanisms",
    keywords: ["combine", "combining", "fuse", "fusion", "modular", "integrate", "share", "space", "motor budget"],
    summary:
      "Integration is a dial, not a switch. Fuse two functions when they can share a motor without their motions conflicting, and stay modular when a function needs its own timing, direction, or speed.",
    nextSteps: [
      "List every function and mark which ones ever need to run at the same instant.",
      "Any pair that never conflicts is a candidate for sharing a motor.",
      "Anything needing its own timing or direction stays modular, do not pay the fusion cost.",
      "Check what fusing costs you in independent control before you commit to it.",
      "Watch for load you did not plan for, shared linkages are where gears deform.",
    ],
    chapterSlugs: ["combining-mechanisms"],
    toolHref: "/tools/season-planner",
    toolLabel: "Plan the season",
    searchTerms: "intake conveyor combined mechanism",
    directSourceIds: ["thrIntakeMethods", "sigbots", "iqAssembly"],
    sourceIds: ["forum", "v5Assembly", "iqAssembly", "kb"],
  },
  {
    id: "lifts",
    title: "Choosing a lift",
    keywords: ["lift", "four bar", "4 bar", "six bar", "6 bar", "dr4b", "cascade", "elevator", "arm", "raise", "height"],
    summary:
      "Match the lift to the game, not the other way around. Every lift trades build complexity for height, weight distribution, or speed. A four-bar keeps the end level and is the simplest thing that works at mid-height.",
    nextSteps: [
      "Write down the exact height you need to reach and how much weight goes up with it.",
      "Simple and reliable at mid-height means a four-bar or six-bar.",
      "Height in a tight footprint means a cascade lift.",
      "Weight kept centred while going nearly vertical means a DR4B, and extra build and tuning time.",
      "Watch a build video or two of your chosen type before cutting metal.",
    ],
    chapterSlugs: ["lifts-4-bar-6-bar-dr4b"],
    searchTerms: "lift build DR4B four bar",
    directSourceIds: ["sigbots", "v5Builds", "vidChannels", "thrIntakeMethods"],
    sourceIds: ["sigbots", "forum"],
  },
  {
    id: "launcher",
    title: "Choosing a launcher",
    keywords: ["launcher", "catapult", "flywheel", "puncher", "shoot", "shooting", "launch", "slip gear"],
    summary:
      "Match the mechanism to reload demand, not raw power. Catapults and punchers hit hard once and then reset, flywheels hit lighter but never stop.",
    nextSteps: [
      "Work out how often you need to fire in a match, that number picks the mechanism.",
      "Firing constantly under time pressure points to a flywheel.",
      "Firing once and reloading calmly points to a puncher or catapult.",
      "If you need range and accuracy, favour a flywheel or catapult over a puncher.",
      "Confirm the design against a build video before committing, especially if nobody on the team has built one.",
    ],
    chapterSlugs: ["launchers-catapults-flywheels-punchers"],
    searchTerms: "flywheel catapult puncher build",
    directSourceIds: ["sigbots", "vidChannels", "thrIntakeMethods"],
    sourceIds: ["sigbots", "forum"],
  },
  {
    id: "scouting",
    title: "Scouting and competition day",
    keywords: ["scout", "scouting", "alliance", "partner", "match", "competition", "tournament", "rankings", "skills", "strategy", "elimination"],
    summary:
      "Scouting happens in two layers. Before the event, skills standings and match history are public, so look teams up before you meet them. At the event, sync with your alliance partner two or three matches ahead, not in the queue.",
    nextSteps: [
      "Look up your division's skills standings and each team's history before you travel.",
      "Use an existing scouting app rather than building your own tracking system.",
      "Find your alliance partner two to three matches before you are on the field.",
      "Settle three things in that conversation: autonomous routines, offence or defence, and field side plus who each of you presses.",
      "Study teams near the top of your own event's skills standings, they are solving the exact field you are.",
    ],
    chapterSlugs: ["advanced-scouting-and-game-analysis"],
    searchTerms: "scouting alliance selection",
    directSourceIds: ["events", "thrOverride", "iqLevelUp"],
    sourceIds: ["events", "forum", "iqLevelUp", "manual"],
  },
  {
    id: "team",
    title: "Organising the team",
    keywords: ["team", "roles", "organise", "organize", "leadership", "specialist", "generalist", "members", "who does what"],
    summary:
      "Start generalist and let specialists emerge. Early in the season everyone should be able to build, drive, and code at a basic level. Specialising means you lead that area, not that you are the only one who touches it.",
    nextSteps: [
      "Get every member to a basic level on build, drive, and code before assigning anything.",
      "Watch for who is clearly stronger in one area, then let them lead it.",
      "Keep specialists on build night anyway, leading an area is not owning it.",
      "Write down who owns what, and the deadlines each of them is working to.",
    ],
    chapterSlugs: ["organizing-your-team"],
    toolHref: "/tools/notebook-template",
    toolLabel: "Log it under Team / resources",
    searchTerms: "team organization roles robotics",
    directSourceIds: ["thrNotebook", "thr2654e"],
    sourceIds: ["vex"],
  },
];

const STOPWORDS = new Set([
  "how", "do", "does", "did", "is", "are", "was", "were", "a", "an", "the", "to", "of", "in",
  "on", "for", "and", "or", "vs", "what", "when", "where", "why", "which", "that", "this",
  "with", "about", "you", "your", "i", "we", "our", "should", "can", "my", "me", "it", "be",
  "best", "good", "use", "using", "make", "build",
]);

export function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Simple keyword scoring. Deterministic, and good enough to route a question. */
export function matchGuidance(query: string): Guidance | null {
  const tokens = tokenize(query);
  if (tokens.length === 0) return null;

  let best: { g: Guidance; score: number } | null = null;
  for (const g of GUIDANCE) {
    const hay = [g.title.toLowerCase(), ...g.keywords.map((k) => k.toLowerCase())];
    let score = 0;
    for (const t of tokens) {
      for (const h of hay) {
        if (h === t) score += 3;
        else if (h.includes(t) || t.includes(h)) score += 1.5;
      }
    }
    if (!best || score > best.score) best = { g, score };
  }
  return best && best.score >= 3 ? best.g : null;
}
