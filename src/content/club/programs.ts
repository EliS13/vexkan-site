import { TBD, type Maybe } from "./types";

export type ProgramTrack = "iq-foundation" | "iq-competition" | "v5rc";

export type Program = {
  slug: string;
  title: string;
  /** Disambiguates the four identically titled foundation classes in lists. */
  shortTitle: string;
  track: ProgramTrack;
  gradeLabel: string;
  gradeMin: number | null;
  gradeMax: number | null;
  summary: string;
  description: string;
  learn: string[];
  prerequisites: string | null;
  schedule: Maybe<string>;
  /**
   * What a family pays, and the term that buys.
   *
   * The field was removed from this file once, on the reasoning that money
   * should not be the first thing a parent reads. It is back because the
   * opposite failure is worse: a parent who finds the cost on the program page
   * feels informed, and a parent who finds it after filling in a signup form
   * feels handled.
   *
   * TBD until the club publishes a figure. Write the number and the term
   * together — `"$220 per term"`, not `"$220"` — because a bare figure invites
   * a family to guess which one it is.
   */
  cost: Maybe<string>;
};

/**
 * What the fee actually buys, in nouns rather than adjectives.
 *
 * The same for every program, so it lives here once. Competition teams consume
 * all of these; a foundation class consumes the first two.
 */
export const COST_COVERS = [
  "VEX parts, and replacing what breaks",
  "Field elements to practise on",
  "Event registration",
  "Tournament entry fees",
];

/**
 * The line that makes the figure make sense. The club is a nonprofit, so the
 * fee is cost recovery rather than revenue, and saying so is the difference
 * between a price and an explanation.
 */
export const COST_NOTE =
  "VexKan is a nonprofit. The fee covers what a season actually costs to run rather than " +
  "producing revenue, and the guides, calculators and community workshops stay free to everyone " +
  "whether or not anyone in your family ever joins.";

/**
 * Financial assistance. The club has not published a policy, so the site does
 * not claim one either way — it says to ask, which is true and costs a family
 * nothing to act on.
 */
export const COST_ASSISTANCE =
  "If the fee is what is standing in the way, write to us before deciding against it.";

export const TRACK_LABELS: Record<ProgramTrack, string> = {
  "iq-foundation": "VEX IQ Foundation Classes",
  "iq-competition": "VEX IQ Competition Teams",
  v5rc: "VEX V5RC Competition Teams",
};

export const TRACK_ORDER: ProgramTrack[] = ["iq-foundation", "iq-competition", "v5rc"];

/**
 * One foundation class rather than a band per grade pair. Grades 1 and 2 were
 * too young for the kit, and everyone from Grade 3 to 6 learns it together, so
 * splitting the listing only made a parent guess which one to read.
 */
export const programs: Program[] = [
  {
    slug: "vex-iq-foundation",
    title: "VEX IQ Foundation Class",
    shortTitle: "Foundation Class",
    track: "iq-foundation",
    gradeLabel: "Grades 3–6",
    gradeMin: 3,
    gradeMax: 6,
    summary:
      "Where most clubbers start, and the usual route onto a competition team. " +
      "Build, program, keep a logbook, and compete internally for certificates.",
    description:
      "VEX IQ Foundation Class is a good pathway to the Competition teams. Through " +
      "learning the functions of different VEX parts, tools and accessories, clubbers " +
      "learn how to brainstorm, design and snap together using pegs and pins, noting " +
      "Engineering Logbooks, making it easy to construct a robot to fulfill a task.",
    learn: [
      "The functions of VEX parts, tools and accessories",
      "Brainstorming and designing before building",
      "Assembly with pegs and pins",
      "Keeping an Engineering Logbook",
      "Programming the finished robot",
      "Competing in regular internal competitions",
    ],
    prerequisites: "Open to any student in Grades 3 to 6.",
    schedule: TBD,
    cost: TBD,
  },
  {
    slug: "vex-iq-competition-es",
    title: "VEX IQ Competition Team, Elementary",
    shortTitle: "IQ Competition, Elementary",
    track: "iq-competition",
    gradeLabel: "Grades 3–6",
    gradeMin: 3,
    gradeMax: 6,
    summary:
      "A team of 3 to 4 clubbers chosen from the Foundation Class, representing VexKan " +
      "at regional, provincial and out-of-province events.",
    description:
      "Members consist of 3-4 team members selected from the Foundation Class of Grade 3-6. " +
      "The team represents the Club against outside teams at regional, provincial and " +
      "out-of-province competitions.",
    learn: [
      "Designing a robot against a competition game",
      "Iterating a build across a season",
      "Driving practice and match strategy",
      "Presenting an Engineering Logbook to judges",
    ],
    prerequisites: "Selected from the Foundation Class.",
    schedule: TBD,
    cost: TBD,
  },
  {
    slug: "vex-iq-competition-ms",
    title: "VEX IQ Competition Team, Middle School",
    shortTitle: "IQ Competition, Middle School",
    track: "iq-competition",
    gradeLabel: "Grades 7–8",
    gradeMin: 7,
    gradeMax: 8,
    summary: "A team of 3 to 4 clubbers competing locally, nationally and internationally.",
    description:
      "Members consist of 3-4 team members selected from the Foundation Class of Grade 7-8. " +
      "The team represents the Club against outside teams at local, national and " +
      "international competitions.",
    learn: [
      "Designing a robot against a competition game",
      "Iterating a build across a season",
      "Driving practice and match strategy",
      "Presenting an Engineering Logbook to judges",
    ],
    prerequisites: "Selected from the Foundation Class.",
    schedule: TBD,
    cost: TBD,
  },
  {
    slug: "v5rc-competition",
    title: "VEX V5RC Competition Teams",
    shortTitle: "V5RC Competition",
    track: "v5rc",
    gradeLabel: "Grades 7–12",
    gradeMin: 7,
    gradeMax: 12,
    summary:
      "The club's senior teams, 1 to 5 members each, building metal V5 robots for the " +
      "middle and high school competition season.",
    description:
      "Members consist of 1-5 team members selected from the previous competitive teams " +
      "and/or IQ Competition Teams. Build up teamwork, leadership, coding ability, " +
      "hands-on ability, problem-solving skills through teamwork and competitions.",
    learn: [
      "Designing and machining a metal V5 robot",
      "Programming autonomous routines",
      "Season-long iteration and testing",
      "Leadership and team management",
      "Competing at regional, national and international events",
    ],
    prerequisites: "Selected from previous competitive teams or the IQ Competition Teams.",
    schedule: TBD,
    cost: TBD,
  },
];

export function getProgram(slug: string): Program | undefined {
  return programs.find((p) => p.slug === slug);
}

export function programSlugs(): string[] {
  return programs.map((p) => p.slug);
}

export function programsByTrack(track: ProgramTrack): Program[] {
  return programs.filter((p) => p.track === track);
}
