import { TBD, type Maybe } from "./types";

export type Team = {
  number: string;
  program: "VEX IQ" | "V5RC";
  status: "active" | "past";
  note: string;
};

/**
 * Every number the club has competed under, active and retired. 16688A is also
 * the byline on the field guide, which is why it appears in both places.
 */
export const teams: Team[] = [
  {
    number: "595C",
    program: "VEX IQ",
    status: "active",
    note: "Finished 18th at the VEX Robotics World Championship.",
  },
  {
    number: "595Y",
    program: "VEX IQ",
    status: "active",
    note: "Finished 31st at the VEX Robotics World Championship.",
  },
  {
    number: "16688A",
    program: "V5RC",
    status: "active",
    note:
      "Finished 7th out of 84 teams at the VEX Robotics World Championship and won " +
      "the Inspire Award. Also the byline on our field guide.",
  },
  {
    number: "36467E",
    program: "V5RC",
    status: "past",
    note: "An earlier V5 team that competed before 16688A.",
  },
  {
    number: "595B",
    program: "VEX IQ",
    status: "past",
    note: "Competed through to the Alberta provincial championship.",
  },
  {
    number: "565D",
    program: "VEX IQ",
    status: "past",
    note: "Competed through to the Alberta provincial championship.",
  },
  {
    number: "565A",
    program: "VEX IQ",
    status: "past",
    note: "Competed through to the Alberta provincial championship.",
  },
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
  count: "30+",
  label: "awards across the teams we have mentored",
} as const;

export const achievements: string[] = [
  `${clubAwards.count} ${clubAwards.label}`,
  "Team 16688A, 7th out of 84 teams at the VEX Robotics World Championship",
  "Team 16688A, Inspire Award at the VEX Robotics World Championship",
  "Team 595C, 18th at the VEX Robotics World Championship",
  "Team 595Y, 31st at the VEX Robotics World Championship",
  "Tournament Championships and Excellence Awards",
  "Invitations to the U.S. Open",
];
