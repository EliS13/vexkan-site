import { TBD, type Maybe } from "./types";

export type Team = {
  number: string;
  name: string;
  program: "VEX IQ" | "V5RC";
  grade: "ES" | "MS" | "HS";
  note: string;
  /**
   * Seasons the team has competed in, newest last.
   *
   * Mostly from the events each team appears in on events.vex.com, but that
   * record is not complete: it returns no events at all for 565D, and nothing
   * before 2024-25 for 595C, both of which the club competed in. Those two
   * come from the club instead.
   *
   * So VEX is the source where it has the data and the club is the source
   * where it does not. Do not "correct" this file against the API and quietly
   * drop a season the club actually competed in.
   */
  seasons: string[];
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
  { number: "565A", name: "Arctic Foxes", program: "VEX IQ", grade: "ES", note: "Elementary VEX IQ.", seasons: ["2023–24", "2024–25"] },
  { number: "565D", name: "Future Builders", program: "VEX IQ", grade: "ES", note: "Elementary VEX IQ.", seasons: ["2024–25"] },
  { number: "595A", name: "Unicorn Knight", program: "VEX IQ", grade: "ES", note: "Elementary VEX IQ.", seasons: ["2025–26"] },
  { number: "595B", name: "RTD", program: "VEX IQ", grade: "ES", note: "Elementary VEX IQ.", seasons: ["2023–24", "2024–25", "2025–26"] },
  { number: "595C", name: "BattleAce", program: "VEX IQ", grade: "MS", note: "Our most decorated VEX IQ team.", seasons: ["2023–24", "2024–25", "2025–26"] },
  { number: "595Y", name: "Croissants", program: "VEX IQ", grade: "MS", note: "Middle school VEX IQ.", seasons: ["2025–26"] },
  { number: "16688A", name: "Blue See 123", program: "V5RC", grade: "MS", note: "Inspire Award winners at the World Championship.", seasons: ["2025–26"] },
  { number: "16688K", name: "FoldX", program: "V5RC", grade: "HS", note: "Our high school V5 team.", seasons: ["2025–26"] },
  { number: "36467E", name: "All Purpose Flour", program: "V5RC", grade: "MS", note: "Middle school V5.", seasons: ["2024–25"] },
];

/**
 * The teams in the order the club actually grew, oldest first.
 *
 * The journey on the home page reads as a relay, so it has to run forwards in
 * time rather than in team-number order — otherwise 16688A, which only exists
 * because the elementary teams came first, opens the story.
 *
 * Sorted on the earliest recorded season, with the team number breaking ties so
 * the order is stable rather than dependent on the array above.
 */
export function teamsInJourneyOrder(): Team[] {
  return [...teams].sort((a, b) => {
    const first = (t: Team) => t.seasons[0] ?? "9999";
    return first(a).localeCompare(first(b)) || a.number.localeCompare(b.number);
  });
}

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
 * A floor rather than an exact count. The list below is what could be
 * evidenced, from VEX's records and the club's own certificates, and the club
 * has won more than that across the teams it has mentored over the years.
 */
export const clubAwards = {
  count: "30+",
  label: "awards",
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
   * These two are missing from VEX's own record but are on the certificates in
   * the club's photographs, so they are recorded here from those.
   */
  { team: "595B", award: "Energy Award", event: "VEX IQ Robotics Competition January Showdown" },
  { team: "565A", award: "Think Award", event: "VEX IQ Robotics Competition January Showdown" },
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

/**
 * What each award is given for, in one or two sentences.
 *
 * These describe the award, not the team. That distinction is the whole reason
 * the file can carry them: saying what a Design Award is judged on is a fact
 * about VEX, while saying why *this* team won one would be a guess about a
 * judging conversation nobody outside the room heard.
 *
 * Summarised in plain language from how the awards are judged at VEX and REC
 * Foundation events, in the same way the Inspire Award criteria above are.
 * Anything not recognised here simply shows no description rather than an
 * invented one, so adding a new award to `awards` can never fabricate text.
 */
export const awardMeanings: Record<string, string> = {
  "Excellence Award": "The top award at a VEX event, and the hardest to win. It goes to the team judged strongest across everything at once: a high-scoring robot, a thorough engineering notebook, a good interview, and the way the team behaves all day.",
  "Design Award": "For the team with the clearest design process, shown through the engineering notebook and the interview. It rewards how a robot was arrived at, not how well it scores.",
  "Innovate Award": "For a specific, clever piece of engineering on the robot — one solution the judges had not seen solved that way.",
  "Think Award": "For the programming. Judges look for autonomous routines the team can explain, with the thinking behind them written down in the notebook.",
  "Build Award": "For a robot that is genuinely well made: robust enough to survive a full day of matches, tidily assembled, and efficient with the parts it uses.",
  "Judges Award": "Chosen by the judges for a team whose story does not fit any other category. There is no scoring sheet for it.",
  "Energy Award": "For a team that brought noticeable enthusiasm to the event, in the pit and around the field as much as on it.",
  "Sportsmanship Award": "For how a team treated everybody else — alliance partners, opponents, volunteers — over the whole event.",
  "Teamwork Champion Award": "Won on the field, not by the judges. In VEX IQ every match is cooperative, so this goes to the two-team alliance with the highest combined score across qualifications.",
  "Robot Skills Champion": "The highest combined skills score at the event: one run driven, one run autonomous, added together. No alliance partner, so it is the cleanest measure of the robot itself.",
  "Tournament Champions": "Won the elimination bracket at the end of the day, with an alliance the team helped pick.",
  "Tournament Finalists": "Reached the final match of the elimination bracket and lost it.",
  "Inspire Award": inspireAward.summary,
  "Invitation to the U.S. Open": "Not an award but an invitation: a place at the U.S. Open Robotics Championship, which teams are invited to rather than qualifying for.",
};

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
