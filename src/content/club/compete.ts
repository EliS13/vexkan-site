/**
 * How the competition season is actually shaped.
 *
 * Most parents have never seen this path written down anywhere, and VEX does
 * not explain it on a page aimed at families. A Grade 4 parent and a Grade 11
 * student should both be able to find their own row here.
 *
 * Everything below describes how VEX runs its competitions, not how the club
 * performs in them, so no result or placing belongs in this file.
 */

export type LadderStep = {
  step: string;
  title: string;
  what: string;
};

/**
 * Three rungs, in the order a season climbs them.
 *
 * Deliberately not promised as automatic: qualification rules change season to
 * season and vary by program, so each step says what generally earns the next
 * one rather than stating a guarantee the club cannot make.
 */
export const ladder: LadderStep[] = [
  {
    step: "01",
    title: "Qualifying tournaments",
    what:
      "One-day events run across Alberta through the autumn and winter, most of them at a school. " +
      "A team plays a set of qualification matches, is interviewed by judges, and can enter robot " +
      "skills. Doing well here, or winning a judged award, is what earns a place at provincials.",
  },
  {
    step: "02",
    title: "Alberta Provincial Championship",
    what:
      "The province's teams in one room, once a season, with separate championships for the " +
      "elementary, middle school and high school levels. The strongest results and the top judged " +
      "awards here are what send a team on.",
  },
  {
    step: "03",
    title: "VEX Robotics World Championship",
    what:
      "Teams from around the world, split across divisions. Getting there is the end of the ladder " +
      "for a season, and it is where our teams have finished 7th, 18th and 31st in their divisions.",
  },
];

/**
 * The two competition programs, told apart.
 *
 * The kit is the difference a parent notices, and the match format is the
 * difference a student notices, so both are stated rather than just the age
 * range.
 */
export const programFamilies = [
  {
    name: "VEX IQ",
    who: "Grades 3 to 9",
    kit: "Plastic parts that snap together with pins, no tools needed.",
    format:
      "Matches are cooperative. Two teams are paired and score together against the clock, so " +
      "there is no opposing alliance to beat — the score is the score. Teams also run robot skills " +
      "on their own, driven and autonomous.",
  },
  {
    name: "V5RC",
    who: "Grades 7 to 12",
    kit: "Metal parts, cut and drilled to fit, driven by a programmable brain.",
    format:
      "Head to head. Two alliances of two teams play each other, starting with a short autonomous " +
      "period where the robot runs its own code before drivers take over.",
  },
] as const;

/**
 * Watching, which costs nothing at the events the club attends.
 *
 * Worded as what is usually true plus where to check, rather than as a promise.
 * Admission is set by whoever hosts the event, so the club cannot state it for
 * an event it is not running.
 */
export const spectating = {
  headline: "Spectators are welcome, and it is normally free",
  detail:
    "Nearly every qualifying tournament in Alberta is open to anyone who wants to walk in and " +
    "watch, at no charge. It is the cheapest way to find out whether your child would enjoy this, " +
    "and nobody will ask you to sign up for anything. Admission is set by whoever hosts the event, " +
    "so check the listing before travelling.",
} as const;
