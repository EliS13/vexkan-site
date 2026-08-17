/**
 * Who competed for which team, and when.
 *
 * None of this is in the attendance record — the kiosk knows who was in the
 * room, never which robot they were building. It is written down from Eli's
 * own account, so it is only as right as that, and a wrong line here is
 * invisible once it turns into a badge.
 *
 * Seasons are named the way the club names them: "2025-26" runs May 2025 to
 * April 2026, matching seasonOf() in badges.ts.
 */

export type Team = {
  /** Team number as it appears at competition. */
  number: string;
  season: string;
  /** Full names, matching kiosk_members exactly. */
  members: string[];
  /** Set when the team competed at the VEX World Championship. */
  worlds?: boolean;
  program?: "IQ" | "V5RC";
};

export const TEAMS: Team[] = [
  { program: "IQ", number: "595C", season: "2023-24", members: ["Eli Seeliger"] },
  { program: "IQ", number: "595C", season: "2024-25", members: ["Eli Seeliger", "Chris Shang", "Nicholas Ma"] },
  { program: "IQ", number: "595C", season: "2025-26", members: ["Eric Lin", "Cyrus Yu", "Alex Fang"] },
  { program: "IQ", number: "595C", season: "2026-27", members: ["Evia Seeliger", "Zhizhi Gao", "Laura Kaastra"] },

  { program: "IQ", number: "595A", season: "2025-26", members: ["Winston Wei", "Richard Pan", "Max Sun"] },
  { program: "IQ", number: "595B", season: "2025-26", members: ["Turing Xu", "Daniel Huang", "Ryan Shen"] },

  { program: "IQ", number: "565A", season: "2024-25", members: ["Evia Seeliger", "Ryan Feng", "Ella Wang"] },
  {
    number: "565D",
    season: "2024-25",
    members: ["Ethan Han", "Graham Xiong", "Ashton Zhou", "Matthias Liew"],
  },

  { program: "IQ", number: "595Y", season: "2025-26", members: ["Eli Seeliger", "Ryan Feng"] },
  { program: "V5RC",
    number: "16688A", season: "2025-26", members: ["Eli Seeliger", "Michael Lian", "Michael Li"] },
  { program: "V5RC",
    number: "16688K", season: "2025-26", members: ["Alex Han", "Michael Li"] },
  {
    program: "V5RC",
    number: "36467E",
    season: "2024-25",
    members: ["Nicholas Ma", "Michael Li", "Michael Lian", "Eli Seeliger"],
  },
];

/*
 * Trips to the VEX World Championship, by season and by person.
 *
 * Qualification was individual, not by team: the 2024-25 squad came from
 * several different teams, so a season's Worlds list cannot be read back onto
 * the teams that ran that season. 36467E ran in 2024-25 and did not go.
 */
export const WORLDS: { season: string; program: "IQ" | "V5RC"; members: string[] }[] = [
  {
    season: "2024-25",
    program: "IQ",
    members: ["Michael Li", "Eli Seeliger", "Ethan Han"],
  },
  {
    season: "2025-26",
    program: "IQ",
    members: ["Eric Lin", "Cyrus Yu", "Luke Shen", "Alex Fang", "Eli Seeliger"],
  },
  {
    season: "2025-26",
    program: "V5RC",
    members: ["Eli Seeliger", "Michael Lian", "Michael Li"],
  },
];

/** Every team a member has competed for, newest season first. */
export function teamsFor(fullName: string): Team[] {
  return TEAMS.filter((t) => t.members.includes(fullName)).sort((a, b) =>
    b.season.localeCompare(a.season),
  );
}

/** Every Worlds trip a member made, as "2025-26 V5RC". */
export function worldsFor(fullName: string): string[] {
  return WORLDS.filter((w) => w.members.includes(fullName)).map(
    (w) => `${w.season} ${w.program}`,
  );
}
