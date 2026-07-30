export type Program = "iq" | "v5";

/**
 * The only outside sites this assistant points at.
 *
 * Tagged by program, because VEX IQ and V5RC are different kits with different
 * parts and different manuals. Sending an IQ team to a V5RC flex wheel page is
 * worse than sending them nowhere.
 *
 * VEX split from the REC Foundation in 2026, so RECF-run resources now describe
 * a separate set of competitions and are deliberately not listed here.
 */
export type SourceKind = "official" | "community" | "video" | "thread";

export interface Source {
  id: string;
  name: string;
  url: string;
  what: string;
  official: boolean;
  kind: SourceKind;
  /** Broad reference sites, useful for anything but specific to nothing. */
  general?: boolean;
  programs: Program[];
}

export const SOURCES: Record<string, Source> = {
  // ---- Both programs ----
  kb: {
    id: "kb",
    name: "VEX Library",
    url: "https://kb.vex.com/",
    what: "Official documentation for every part, motor, and sensor VEX sells, split by product line. The first place to check a spec.",
    official: true,
    kind: "official",
    general: true,
    programs: ["iq", "v5"],
  },
  forum: {
    id: "forum",
    name: "VEX Forum",
    url: "https://www.vexforum.com/",
    what: "Official rule clarifications from the Game Design Committee, plus build threads. Search before you post, most questions are already answered.",
    official: true,
    kind: "official",
    general: true,
    programs: ["iq", "v5"],
  },
  vex: {
    id: "vex",
    name: "VEX Robotics",
    url: "https://www.vexrobotics.com/",
    what: "The parts catalogue and season hub. Useful for checking what a part actually is before you design around it.",
    official: true,
    kind: "official",
    general: true,
    programs: ["iq", "v5"],
  },
  events: {
    id: "events",
    name: "RobotEvents",
    url: "https://www.robotevents.com/",
    what: "Skills standings and match history, and still the name most people know. Since the 2026 split it points toward both organisations, so check which one is actually running your event.",
    official: true,
    kind: "official",
    general: true,
    programs: ["iq", "v5"],
  },

  vexEvents: {
    id: "vexEvents",
    name: "VEX Events",
    url: "https://events.vex.com/",
    what: "VEX's own event platform after the 2026 split from the REC Foundation. This is where VEX-run competitions are listed now.",
    official: true,
    kind: "official",
    general: true,
    programs: ["iq", "v5"],
  },

  // ---- VEX IQ ----
  iqGame: {
    id: "iqGame",
    name: "VIQRC Current Game",
    url: "https://www.vexrobotics.com/iq/competition/viqc-current-game",
    what: "The current VEX IQ game, field, and manual. The 2026-27 game is Level Up, scored with bean bags.",
    official: true,
    kind: "official",
    general: true,
    programs: ["iq"],
  },
  iqLevelUp: {
    id: "iqLevelUp",
    name: "VEX Forum: Level Up discussion",
    url: "https://www.vexforum.com/t/2026-2027-vex-iq-robotics-competition-game-level-up/146038",
    what: "Where IQ teams are working out strategy for the current game, in the open.",
    official: true,
    kind: "official",
    programs: ["iq"],
  },
  iqAssembly: {
    id: "iqAssembly",
    name: "VEX Library: Selecting a VEX IQ Assembly",
    url: "https://kb.vex.com/hc/en-us/articles/360035953411-Selecting-a-VEX-IQ-Assembly",
    what: "Official walkthrough of IQ intakes, claws, conveyors, and passive assemblies, with what each is suited to.",
    official: true,
    kind: "official",
    programs: ["iq"],
  },
  iqClaws: {
    id: "iqClaws",
    name: "VEX Library: Building VEX IQ Claws",
    url: "https://kb.vex.com/hc/en-us/articles/14552264210580-Building-VEX-IQ-Claws",
    what: "How IQ claws go together, including roller claws that spin game pieces in rather than just pinching.",
    official: true,
    kind: "official",
    programs: ["iq"],
  },
  iqWheels: {
    id: "iqWheels",
    name: "VEX Library: VEX IQ Wheels",
    url: "https://kb.vex.com/hc/en-us/articles/360035955171-Understanding-VEX-IQ-Wheels",
    what: "Travel sizes, omni versus traction, and which hub each tire needs. Remember IQ wheels are named by travel per turn, not diameter.",
    official: true,
    kind: "official",
    programs: ["iq"],
  },
  iqIntakeRoller: {
    id: "iqIntakeRoller",
    name: "VEX: IQ Intake Roller",
    url: "https://www.vexrobotics.com/intake-roller.html",
    what: "The stock IQ intake roller part, so you can see what you are working with before designing around it.",
    official: true,
    kind: "official",
    programs: ["iq"],
  },

  // ---- V5RC ----
  manual: {
    id: "manual",
    name: "V5RC Override Game Manual",
    url: "https://www.vexrobotics.com/override-manual",
    what: "The current V5RC manual, including this season's drivetrain wattage limit. Final word over anything on this site.",
    official: true,
    kind: "official",
    general: true,
    programs: ["v5"],
  },
  v5Assembly: {
    id: "v5Assembly",
    name: "VEX Library: Selecting a V5 Assembly",
    url: "https://kb.vex.com/hc/en-us/articles/360035592932-Selecting-a-V5-Assembly",
    what: "Official rundown of V5 intakes, lifts, and drivetrains, and when each is the right call.",
    official: true,
    kind: "official",
    programs: ["v5"],
  },
  flexWheels: {
    id: "flexWheels",
    name: "VEX Library: Flex Wheels for V5",
    url: "https://kb.vex.com/hc/en-us/articles/10487034781076-Flex-Wheels-for-V5",
    what: "Durometer choices and how much a flex wheel squishes. Softer wheels grip harder objects better.",
    official: true,
    kind: "official",
    programs: ["v5"],
  },
  motor11w: {
    id: "motor11w",
    name: "VEX Library: 11W Motor Performance",
    url: "https://kb.vex.com/hc/en-us/articles/360044325872-Understanding-V5-Smart-Motor-11W-Performance",
    what: "Speed, torque, and heat behaviour of the 11W Smart Motor across its three cartridges.",
    official: true,
    kind: "official",
    programs: ["v5"],
  },
  motor55w: {
    id: "motor55w",
    name: "VEX Library: 5.5W Motor Performance",
    url: "https://kb.vex.com/hc/en-us/articles/10002101702932-Understanding-V5-Smart-Motor-5-5W-Performance",
    what: "What the smaller motor can and cannot do. Fixed speed, no cartridges, half the power.",
    official: true,
    kind: "official",
    programs: ["v5"],
  },
  sigbots: {
    id: "sigbots",
    name: "Purdue SIGBots Wiki",
    url: "https://wiki.purduesigbots.com/",
    what: "Long-running community engineering reference for V5RC. Deeper on mechanism theory than anything official.",
    official: false,
    kind: "community",
    programs: ["v5"],
  },
  sigbotsIntakes: {
    id: "sigbotsIntakes",
    name: "SIGBots: Intakes",
    url: "https://wiki.purduesigbots.com/hardware/intakes.md",
    what: "Side roller versus top-down roller intakes, with the compression and range tradeoffs spelled out.",
    official: false,
    kind: "community",
    programs: ["v5"],
  },
  sigbotsOdom: {
    id: "sigbotsOdom",
    name: "SIGBots: Odometry",
    url: "https://wiki.purduesigbots.com/software/odometry",
    what: "The standard community write-up on tracking robot position during autonomous.",
    official: false,
    kind: "community",
    programs: ["v5"],
  },
  // ---- Build instructions ----
  iqBuilds: {
    id: "iqBuilds",
    name: "Official VEX IQ build instructions",
    url: "https://www.vexrobotics.com/iq/downloads/build-instructions",
    what: "Step-by-step builds including this season's Hero Bot. The fastest way to see a working drivetrain before you design your own.",
    official: true,
    kind: "official",
    programs: ["iq"],
  },
  v5Builds: {
    id: "v5Builds",
    name: "Official V5 build instructions",
    url: "https://www.vexrobotics.com/v5/downloads/build-instructions",
    what: "Official Hero Bot builds for the current season, useful as a known-good starting point.",
    official: true,
    kind: "official",
    programs: ["v5"],
  },

  // ---- Videos ----
  vidOverrideIntake: {
    id: "vidOverrideIntake",
    name: "Video: How to Build an Intake (Override)",
    url: "https://www.youtube.com/watch?v=cyowYoaz7Y8",
    what: "Walks through building an intake for this season's game, start to finish.",
    official: false,
    kind: "video",
    programs: ["v5"],
  },
  vidDrivebase: {
    id: "vidDrivebase",
    name: "Video: VEX drivebase tutorial",
    url: "https://www.youtube.com/watch?v=ajI2Czg_384",
    what: "Building a drivebase from scratch, including gearing and keeping friction down.",
    official: false,
    kind: "video",
    programs: ["v5"],
  },
  vidIqDrive: {
    id: "vidIqDrive",
    name: "Video: IQ drivetrain and friction",
    url: "https://www.youtube.com/watch?v=OUsRR_Fr8Xk",
    what: "An IQ reveal that focuses on drivetrain gearing, minimising friction, and a compact base.",
    official: false,
    kind: "video",
    programs: ["iq"],
  },
  vidChannels: {
    id: "vidChannels",
    name: "Best VEX YouTube channels (forum thread)",
    url: "https://www.vexforum.com/t/what-are-the-best-youtube-channels-for-robotics-v5/145226",
    what: "Teams comparing which channels are actually worth following. A good place to find more video than one link.",
    official: false,
    kind: "thread",
    programs: ["v5"],
  },

  // ---- Specific forum threads ----
  thrIntakeMethods: {
    id: "thrIntakeMethods",
    name: "Forum: Intake methods compared",
    url: "https://www.vexforum.com/t/intake-methods/128147",
    what: "Teams arguing the tradeoffs between roller, chain, and hook intakes on real robots.",
    official: false,
    kind: "thread",
    programs: ["v5"],
  },
  thrStageOne: {
    id: "thrStageOne",
    name: "Forum: Stage one intake design",
    url: "https://www.vexforum.com/t/stage-1-intake-for-high-stakes/129737",
    what: "A long thread on getting the first stage of an intake right, which is where most stacks fail.",
    official: false,
    kind: "thread",
    programs: ["v5"],
  },
  thrFlexIntake: {
    id: "thrFlexIntake",
    name: "Forum: Flex wheel intakes",
    url: "https://www.vexforum.com/t/flex-wheel-intake-for-high-stakes/128929",
    what: "Durometer picks, spacing, and compression settings teams landed on.",
    official: false,
    kind: "thread",
    programs: ["v5"],
  },
  thrBuildRoller: {
    id: "thrBuildRoller",
    name: "Forum: How to build an intake roller",
    url: "https://www.vexforum.com/t/how-do-you-build-an-intake-roller/108805",
    what: "Practical answers on assembling rollers, including rubber band and sprocket versions.",
    official: false,
    kind: "thread",
    programs: ["v5"],
  },
  thrIqIntake: {
    id: "thrIqIntake",
    name: "Forum: IQ intake kit and how to use it",
    url: "https://www.vexforum.com/t/intake-kit-and-how-to/69294",
    what: "IQ teams working out how to get the intake kit parts to actually grip.",
    official: false,
    kind: "thread",
    programs: ["iq"],
  },
  thr55w: {
    id: "thr55w",
    name: "Forum: 55W drivetrain ideas",
    url: "https://www.vexforum.com/t/55w-drivetrains/145788",
    what: "How teams are spending the drivetrain wattage budget this season, with real motor and ratio combinations.",
    official: false,
    kind: "thread",
    programs: ["v5"],
  },
  thrOverride: {
    id: "thrOverride",
    name: "Forum: Override strategy thread",
    url: "https://www.vexforum.com/t/2026-27-vex-v5-robotics-competition-game-override/145743",
    what: "The main thread for this season's V5RC game, where strategy gets worked out in the open.",
    official: false,
    kind: "thread",
    programs: ["v5"],
  },
  thrNotebook: {
    id: "thrNotebook",
    name: "Forum: Notebook advice",
    url: "https://www.vexforum.com/t/notebook-advice/139171",
    what: "Teams and judges discussing what actually scores in a notebook.",
    official: false,
    kind: "thread",
    programs: ["iq", "v5"],
  },
  thr2654e: {
    id: "thr2654e",
    name: "Forum: 2654E notebook and explanation video",
    url: "https://www.vexforum.com/t/2654e-engineering-notebook-explanation-video-release/136688",
    what: "A team that won Design at Worlds sharing their full notebook and walking through why it is structured that way.",
    official: false,
    kind: "thread",
    programs: ["iq", "v5"],
  },
  thrNotebookTemplate: {
    id: "thrNotebookTemplate",
    name: "Forum: Notebook templates",
    url: "https://www.vexforum.com/t/engineering-notebook-template/115405",
    what: "Templates other teams have shared, worth stealing structure from.",
    official: false,
    kind: "thread",
    programs: ["iq", "v5"],
  },
  plasticRule: {
    id: "plasticRule",
    name: "Q&A: Non-shattering plastic limit",
    url: "https://www.robotevents.com/V5RC/2022-2023/QA/1113",
    what: "Official ruling on the plastic allowance. Recent seasons require every cut piece to nest into one 12in by 24in sheet, so spend it carefully.",
    official: true,
    kind: "official",
    programs: ["v5"],
  },
};

/** Sources for these ids, keeping only ones that apply to the chosen program. */
export function sourcesFor(ids: string[], program?: Program): Source[] {
  return ids
    .map((id) => SOURCES[id])
    .filter(Boolean)
    .filter((s) => !program || s.programs.includes(program));
}


/** Broad references, parked at the bottom of the page rather than in an answer. */
export function generalSourcesFor(program: Program): Source[] {
  return Object.values(SOURCES).filter((s) => s.general && s.programs.includes(program));
}
