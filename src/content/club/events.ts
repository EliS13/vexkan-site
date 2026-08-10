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
    note: "Placed 7th in Division at the World Championship in Dallas, Texas.",
  },
  {
    number: "595Y",
    program: "VEX IQ",
    status: "active",
    note: "Qualified for the World Championship this season.",
  },
  {
    number: "16688A",
    program: "V5RC",
    status: "active",
    note: "The club's V5 competition team, and the byline on our field guide.",
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
    slug: "worlds-dallas-595c",
    name: "VEX Robotics World Championship — Dallas, TX",
    kind: "result",
    date: TBD,
    location: "Dallas, Texas",
    summary: "Team 595C finished 7th in their Division at the World Championship.",
  },
];

/**
 * The "two invitations" line is taken from the current vexkan.ca. 595Y has
 * since qualified as well, so the count is very likely stale — TODO.md flags it
 * for the club to confirm rather than have this file guess at a new number.
 */
export const achievements: string[] = [
  "Tournament Championships and Excellence Awards",
  "Multiple invitations to the VEX Robotics World Championship",
  "Invitations to the U.S. Open",
  "Team 595C, 7th in Division at the World Championship in Dallas, Texas",
  "Team 595Y qualified for the World Championship this season",
];
