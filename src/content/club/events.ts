import { TBD, type Maybe } from "./types";

export type Team = {
  number: string;
  name: string;
  program: "VEX IQ" | "V5RC";
  grade: "ES" | "MS" | "HS";
  note: string;
};

/**
 * Every team the club currently runs.
 *
 * Team numbers are not unique across programs: 595B, 16688A and 16688K each
 * also exist as another club's team in the other program. Anything looked up
 * against VEX must match the program and team name too, or it credits someone
 * else's results to us.
 */
export const teams: Team[] = [
  { number: "565A", name: "Arctic Foxes", program: "VEX IQ", grade: "ES", note: "Elementary VEX IQ." },
  { number: "565D", name: "Future Builders", program: "VEX IQ", grade: "ES", note: "Elementary VEX IQ." },
  { number: "595A", name: "Unicorn Knight", program: "VEX IQ", grade: "ES", note: "Elementary VEX IQ." },
  { number: "595B", name: "RTD", program: "VEX IQ", grade: "ES", note: "Elementary VEX IQ." },
  { number: "595C", name: "BattleAce", program: "VEX IQ", grade: "MS", note: "Our most decorated VEX IQ team." },
  { number: "595Y", name: "Croissants", program: "VEX IQ", grade: "MS", note: "Middle school VEX IQ." },
  { number: "16688A", name: "Blue See 123", program: "V5RC", grade: "MS", note: "Inspire Award winners at the World Championship." },
  { number: "16688K", name: "FoldX", program: "V5RC", grade: "HS", note: "Our high school V5 team." },
  { number: "36467E", name: "All Purpose Flour", program: "V5RC", grade: "MS", note: "Middle school V5." },
];

export type ClubEvent = {
  slug: string;
  name: string;
  kind: "competition" | "result";
  date: Maybe<string>;
  location: Maybe<string>;
  summary: string;
};

export const events: ClubEvent[] = [
  {
    slug: "mecha-mayhem-2027",
    name: "Mecha Mayhem 2027 Signature Event",
    kind: "competition",
    date: "February 13 to 14, 2027",
    location: "BMO Centre, Calgary, Alberta",
    summary:
      "A VEX Signature Event at the BMO Centre in Calgary, with VEX IQ, middle school, " +
      "high school and VEX U divisions.",
  },
  {
    slug: "worlds-16688a",
    name: "VEX Robotics World Championship, 16688A",
    kind: "result",
    date: TBD,
    location: TBD,
    summary:
      "Team 16688A finished 7th out of 84 teams and won the Inspire Award, the " +
      "judged award for how a team carries itself across the whole event.",
  },
  {
    slug: "worlds-iq-teams",
    name: "VEX Robotics World Championship, 595C and 595Y",
    kind: "result",
    date: TBD,
    location: TBD,
    summary: "Our VEX IQ teams finished 18th (595C) and 31st (595Y) at the World Championship.",
  },
];

/**
 * The Inspire Award is judged, so it says something about the team rather than
 * the robot, which is why the criteria are worth showing rather than just
 * naming the trophy.
 *
 * The criteria are summarised in our own words from the REC Foundation's Guide
 * to Judging rather than reproduced, and the page links to the source so a
 * reader can check them. VEX and the REC Foundation now run separate
 * competitions; TODO.md tracks adding VEX's own published wording once it
 * exists, rather than assuming it matches.
 */
export const inspireAward = {
  name: "Inspire Award",
  team: "16688A",
  event: "VEX Robotics World Championship",
  /** What the REC Foundation says the award is for. */
  summary:
    "The Inspire Award recognises a team's passion for the competition and the " +
    "positivity they bring to the event.",
  /** Why the club thinks it landed, in the club's own words. */
  meaning:
    "Winning it means VEX saw our impact, and our contribution to helping students " +
    "excel in robotics.",
  criteria: [
    "Shows passion and a positive attitude throughout the event",
    "Acts with integrity and goodwill toward other teams, coaches and event staff",
    "Overcomes an obstacle, or reaches a goal or special accomplishment at the event",
    "Interviews well, with clear communication, real teamwork, professionalism, and students doing the talking",
  ],
  note: "Like every judged award, it requires a completed team interview.",
  criteriaLabel: "Judged the same way at VEX and REC Foundation events",
  sourceLabel: "REC Foundation Guide to Judging",
  sourceUrl:
    "https://v5rc-kb.recf.org/hc/en-us/articles/33153576505367-Guide-to-Judging-Judged-Awards-Appendix",
} as const;

/**
 * Counted across every team the club has mentored, not just the ones competing
 * now, which is why it is a floor rather than an exact figure.
 */
export const clubAwards = {
  /** Derived, so it can never disagree with the list below it. */
  get count() {
    return String(awards.length);
  },
  label: "awards across the teams we have mentored",
} as const;

export type Award = {
  team: string;
  award: string;
  event: string;
};

/**
 * Every award, with the team that won it and the event it came from. Kept as a
 * table rather than a prose list so nothing can end up crediting the club for
 * something a specific team earned.
 */
export const awards: Award[] = [
  /*
   * Club-supplied, not from VEX's award records. The U.S. Open invitation is
   * something the club states about itself; everything below it was read from
   * the VEX Events API.
   */
  { team: "16688A", award: "Invitation to the U.S. Open", event: "U.S. Open Robotics Championship" },
  { team: "565A", award: "Sportsmanship Award", event: "Alberta VEX IQ Blended Provincial Championship" },
  { team: "595B", award: "Innovate Award", event: "Alberta VIQRC Mix and Match Open - December Blended Qualifier" },
  { team: "595B", award: "Judges Award", event: "Alberta VIQRC ES Provincial Championship" },
  { team: "595C", award: "Teamwork Champion Award", event: "VEX IQ Robotics Competition Ten Ton Last Chance (MS)" },
  { team: "595C", award: "Robot Skills Champion", event: "VEX IQ Robotics Competition Ten Ton Last Chance (MS)" },
  { team: "595C", award: "Build Award", event: "VEX IQ Robotics Competition Ten Ton Last Chance (MS)" },
  { team: "595C", award: "Robot Skills Champion", event: "VEX IQ Robotics Competition January Showdown" },
  { team: "595C", award: "Teamwork Champion Award", event: "Alberta VEX IQ Blended Provincial Championship" },
  { team: "595C", award: "Robot Skills Champion", event: "Alberta VEX IQ Blended Provincial Championship" },
  { team: "595C", award: "Judges Award", event: "Alberta VEX IQ Blended Provincial Championship" },
  { team: "595C", award: "Teamwork Champion Award", event: "Alberta VIQRC Mix and Match Open - December Blended Qualifier" },
  { team: "595C", award: "Robot Skills Champion", event: "Alberta VIQRC Mix and Match Open - December Blended Qualifier" },
  { team: "595C", award: "Design Award", event: "Alberta VIQRC Mix and Match MS Provincial Championships" },
  { team: "595Y", award: "Design Award", event: "Alberta VIQRC Mix and Match Open - December Blended Qualifier" },
  { team: "595Y", award: "Teamwork Champion Award", event: "Alberta VIQRC Mix and Match Open - December Blended Qualifier" },
  { team: "595Y", award: "Teamwork Champion Award", event: "Alberta VIQRC Mix and Match MS Provincial Championships" },
  { team: "595Y", award: "Robot Skills Champion", event: "Alberta VIQRC Mix and Match MS Provincial Championships" },
  { team: "595Y", award: "Innovate Award", event: "Alberta VIQRC Mix and Match MS Provincial Championships" },
  { team: "595Y", award: "Excellence Award", event: "Alberta VIQRC Mix and Match MS Provincial Championships" },
  { team: "16688A", award: "Excellence Award", event: "STEM Innovation Academy VEX V5 Robotics Competition (MS)" },
  { team: "16688A", award: "Tournament Champions", event: "STEM Innovation Academy VEX V5 Robotics Competition (MS)" },
  { team: "16688A", award: "Robot Skills Champion", event: "STEM Innovation Academy VEX V5 Robotics Competition (MS)" },
  { team: "16688A", award: "Tournament Champions", event: "STEM Collegiate – V5RC Push Back" },
  { team: "16688A", award: "Robot Skills Champion", event: "STEM Collegiate – V5RC Push Back" },
  { team: "16688A", award: "Robot Skills Champion", event: "Alberta V5RC MS Provincial Championship" },
  { team: "16688A", award: "Inspire Award", event: "2026 VEX Robotics World Championship" },
  { team: "16688K", award: "Tournament Champions", event: "STEM Collegiate – V5RC Push Back" },
  { team: "36467E", award: "Tournament Finalists", event: "STEM Innovation Academy VEX V5 Robotics Competition (MS)" },
  { team: "36467E", award: "Judges Award", event: "Alberta VEX V5 Robotics Competition Provincial Championships (MS)" },
];

/** Finishing positions, which are not awards and are counted separately. */
export type Placing = { team: string; place: string; event: string };

export const placings: Placing[] = [
  { team: "16688A", place: "7th of 84", event: "VEX Robotics World Championship" },
  { team: "595C", place: "18th", event: "VEX Robotics World Championship" },
  { team: "595Y", place: "31st", event: "VEX Robotics World Championship" },
];

/**
 * Only the headline figure now. The U.S. Open invitation moved into `awards`
 * under 16688A, and the rest was crediting the club for what specific teams
 * earned.
 */
export const achievements: string[] = [`${clubAwards.count} ${clubAwards.label}`];
