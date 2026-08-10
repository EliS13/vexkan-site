import { TBD, type Maybe } from "./types";

export type ProgramTrack = "iq-foundation" | "iq-competition" | "v5rc" | "camp";

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
  fee: Maybe<string>;
  /**
   * The Google Form the club used before this site had its own registration.
   * Not linked in normal operation; the register page falls back to it when
   * Supabase is unconfigured, so a signup is never simply lost.
   */
  legacyFormUrl: string | null;
};

export const TRACK_LABELS: Record<ProgramTrack, string> = {
  "iq-foundation": "VEX IQ Foundation Classes",
  "iq-competition": "VEX IQ Competition Teams",
  v5rc: "VEX V5RC Competition Teams",
  camp: "Summer Camp",
};

export const TRACK_ORDER: ProgramTrack[] = ["iq-foundation", "iq-competition", "v5rc", "camp"];

/**
 * The foundation classes share their curriculum across all four grade bands,
 * which is how the club describes them. The wording stays identical on purpose.
 */
const FOUNDATION_DESCRIPTION =
  "VEX IQ Foundation Class is a good pathway to the Competition teams. Through " +
  "learning the functions of different VEX parts, tools and accessories, clubbers " +
  "learn how to brainstorm, design and snap together using pegs and pins, noting " +
  "Engineering Logbooks, making it easy to construct a robot to fulfill a task.";

const FOUNDATION_LEARN = [
  "The functions of VEX parts, tools and accessories",
  "Brainstorming and designing before building",
  "Assembly with pegs and pins",
  "Keeping an Engineering Logbook",
  "Programming the finished robot",
  "Competing in regular internal competitions",
];

function foundation(
  slug: string,
  gradeMin: number,
  gradeMax: number,
  legacyFormUrl: string | null
): Program {
  return {
    slug,
    title: "VEX IQ Foundation Class",
    shortTitle: `Foundation, Grades ${gradeMin}–${gradeMax}`,
    track: "iq-foundation",
    gradeLabel: `Grades ${gradeMin}–${gradeMax}`,
    gradeMin,
    gradeMax,
    summary:
      "Hands-on introduction to VEX IQ, and the usual route onto a competition team. " +
      "Clubbers build, program, keep a logbook, and compete internally for certificates.",
    description: FOUNDATION_DESCRIPTION,
    learn: FOUNDATION_LEARN,
    prerequisites: null,
    schedule: TBD,
    fee: TBD,
    legacyFormUrl,
  };
}

export const programs: Program[] = [
  foundation("vex-iq-foundation-g1-2", 1, 2, "https://forms.gle/nYaKofbC96VfLwLm8"),
  foundation("vex-iq-foundation-g3-4", 3, 4, null),
  foundation("vex-iq-foundation-g5-6", 5, 6, "https://forms.gle/p1W6PR2kDA3tHUC29"),
  foundation("vex-iq-foundation-g7-8", 7, 8, "https://forms.gle/p1W6PR2kDA3tHUC29"),

  {
    slug: "vex-iq-competition-es",
    title: "VEX IQ Competition Team — Elementary",
    shortTitle: "IQ Competition, Elementary",
    track: "iq-competition",
    gradeLabel: "Grades 3–6",
    gradeMin: 3,
    gradeMax: 6,
    summary:
      "A team of 3–4 clubbers chosen from the Grade 3–6 Foundation Classes, " +
      "representing VexKan at regional, provincial and out-of-province events.",
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
    prerequisites: "Selected from the Grade 3–6 Foundation Classes.",
    schedule: TBD,
    fee: TBD,
    legacyFormUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSfKw2kGi8jhkNtxTmPYE1otpKju-cQXqTWUud1VtyQLfROKjQ/viewform",
  },
  {
    slug: "vex-iq-competition-ms",
    title: "VEX IQ Competition Team — Middle School",
    shortTitle: "IQ Competition, Middle School",
    track: "iq-competition",
    gradeLabel: "Grades 7–8",
    gradeMin: 7,
    gradeMax: 8,
    summary:
      "A team of 3–4 clubbers chosen from the Grade 7–8 Foundation Classes, " +
      "competing locally, nationally and internationally.",
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
    prerequisites: "Selected from the Grade 7–8 Foundation Classes.",
    schedule: TBD,
    fee: TBD,
    legacyFormUrl: null,
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
      "The club's senior teams, 1–5 members each, building metal V5 robots for the " +
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
    fee: TBD,
    legacyFormUrl: "https://forms.gle/VxGq6iRduycambFK6",
  },
  {
    slug: "summer-camp",
    title: "Ms. Cecci's Summer Camp — English and Math",
    shortTitle: "Summer Camp",
    track: "camp",
    gradeLabel: "Contact us for eligible grades",
    gradeMin: null,
    gradeMax: null,
    summary:
      "A summer camp built on a customised English and Math curriculum, with snack, " +
      "lunch, materials and prizes included.",
    description:
      "Customized curriculum with morning snack, lunch, work materials and prizes included.",
    learn: [
      "A customised English and Math curriculum",
      "Small-group work with materials provided",
      "Daily activities with prizes",
    ],
    prerequisites: null,
    schedule: TBD,
    fee: TBD,
    legacyFormUrl: "https://forms.gle/LUWJUHzDj3NtchEz8",
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
