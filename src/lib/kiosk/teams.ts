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
  /**
   * Set when this team competed at the World Championship that season.
   *
   * Per team, not per season. Qualification was individual — the 2024-25 squad
   * came from several teams — so "somebody from this club went to Worlds in
   * 2024-25" says nothing about whether this particular team was there. Marking
   * it by season credited 36467E for a trip it never made.
   */
  worlds?: boolean;
  program?: "IQ" | "V5RC";
};

export const TEAMS: Team[] = [
  { program: "IQ", number: "595C", season: "2023-24", members: ["Eli Seeliger"] },
  {
    program: "IQ",
    number: "595C",
    season: "2024-25",
    members: ["Eli Seeliger", "Chris Shang", "Nicholas Ma"],
    /* VEX lists 595C at the 2025 World Championship. */
    worlds: true,
  },
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

  {
    program: "IQ",
    number: "595Y",
    season: "2025-26",
    members: ["Eli Seeliger", "Ryan Feng"],
    /* VEX lists 595Y at the 2026 World Championship. */
    worlds: true,
  },
  {
    program: "V5RC",
    number: "16688A",
    season: "2025-26",
    members: ["Eli Seeliger", "Michael Lian", "Michael Li"],
    /* Proven by VEX: 16688A won the Inspire Award at the 2026 Worlds. */
    worlds: true,
  },
  { program: "V5RC",
    number: "16688K", season: "2025-26", members: ["Alex Han", "Michael Li"] },
  {
    program: "V5RC",
    number: "36467E",
    season: "2024-25",
    members: ["Nicholas Ma", "Michael Li", "Michael Lian", "Eli Seeliger"],
  },
];


/** Every team a member has competed for, newest season first. */
export function teamsFor(fullName: string): Team[] {
  return TEAMS.filter((t) => t.members.includes(fullName)).sort((a, b) =>
    b.season.localeCompare(a.season),
  );
}

/**
 * Every Worlds trip a member made, as "2025-26 V5RC".
 *
 * Derived from the teams they were on rather than kept as its own list. The
 * two disagreed the moment they existed side by side — the hand-written list
 * had people at the 2024-25 Worlds who were not on the team VEX records as
 * having gone. A team either went or it did not, and its roster says who was
 * there.
 */
export function worldsFor(fullName: string): string[] {
  return TEAMS.filter((t) => t.worlds && t.members.includes(fullName)).map(
    (t) => `${t.season} ${t.program ?? "IQ"}`,
  );
}
