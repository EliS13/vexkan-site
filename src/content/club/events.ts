import { TBD, type Maybe } from "./types";

export type Team = {
  number: string;
  program: "VEX IQ" | "V5RC";
  status: "active" | "past";
  note: string;
};

/**
 * The club competes under four team numbers. 16688A is also the byline on the
 * field guide, which is why that number appears in both places.
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
    slug: "vrc-regional-2025",
    name: "VEX VRC Regional Competition 2025",
    kind: "competition",
    date: TBD,
    location: TBD,
    summary: "The regional V5 competition our middle and high school teams compete in.",
  },
  {
    slug: "iq-regional-2025",
    name: "VEX IQ Regional Competition 2025",
    kind: "competition",
    date: TBD,
    location: TBD,
    summary: "The regional VEX IQ competition for our elementary and middle school teams.",
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
 * The Inspire Award is a judged award, so it says something about the team
 * rather than the robot — which is why the criteria are worth showing rather
 * than just naming the trophy.
 *
 * These are summarised in our own words from the REC Foundation's Guide to
 * Judging rather than reproduced, and the page links to the source so a reader
 * can check them against the official wording.
 */
export const inspireAward = {
  name: "Inspire Award",
  team: "16688A",
  event: "VEX Robotics World Championship",
  /** What the REC Foundation says the award is for. */
  summary:
    "The Inspire Award recognises a team's passion for the competition and the " +
    "positivity they bring to the event.",
  criteria: [
    "Shows passion and a positive attitude throughout the event",
    "Acts with integrity and goodwill toward other teams, coaches and event staff",
    "Overcomes an obstacle, or reaches a goal or special accomplishment at the event",
    "Interviews well, with clear communication, real teamwork, professionalism, and students doing the talking",
  ],
  note: "Like every judged award, it requires a completed team interview.",
  sourceLabel: "REC Foundation Guide to Judging",
  sourceUrl:
    "https://v5rc-kb.recf.org/hc/en-us/articles/33153576505367-Guide-to-Judging-Judged-Awards-Appendix",
} as const;

/**
 * The "two invitations" line on the old vexkan.ca is not repeated here: three
 * teams have since been to Worlds, so the count was stale. TODO.md asks the
 * club to confirm a real figure rather than have this file guess one.
 */
export const achievements: string[] = [
  "Team 16688A, 7th out of 84 teams at the VEX Robotics World Championship",
  "Team 16688A, Inspire Award at the VEX Robotics World Championship",
  "Team 595C, 18th at the VEX Robotics World Championship",
  "Team 595Y, 31st at the VEX Robotics World Championship",
  "Tournament Championships and Excellence Awards",
  "Invitations to the U.S. Open",
];
