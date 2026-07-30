/**
 * Every machine 16688A has written about, in one place.
 *
 * Nothing here is new. It is compiled from the chapters so a reader can see one
 * robot at a time instead of meeting the same season scattered across Chapter
 * 8, 9, 11 and 15. Every entry says which chapter it came from.
 */
export interface SeasonMechanism {
  label: string;
  detail: string;
  chapter: string;
  slug: string;
}

export interface Season {
  id: string;
  name: string;
  program: "VEX IQ" | "V5RC";
  /** The one-line description of what the robot was built to do. */
  premise: string;
  fusion?: string;
  mechanisms: SeasonMechanism[];
  lesson: string;
}

export const SEASONS: Season[] = [
  {
    id: "rapid-relay",
    name: "Rapid Relay",
    program: "VEX IQ",
    premise:
      "Balls scored in all four zones of the goal, so range and flexibility mattered more than raw power.",
    fusion: "Nearly the whole robot",
    mechanisms: [
      {
        label: "Concepts we put on the table",
        detail:
          "A standard catapult with adjustable tension, a double catapult for two balls at once, a flywheel, and a backroller combining a catapult for the upper goal with a rubber band roller on the back for the lower goal.",
        chapter: "Chapter 3, Brainstorming",
        slug: "brainstorming-your-robot",
      },
      {
        label: "What we cut, and why",
        detail:
          "A long-range launcher. Alignment was hard to program consistently, and small angle errors at distance caused dramatic accuracy loss. The debate killed it, not a vote.",
        chapter: "Chapter 3, Brainstorming",
        slug: "brainstorming-your-robot",
      },
      {
        label: "Mechanism fusion",
        detail:
          "Modular first, one mechanism to pick up and one to score. Then a shared motor link tied intake, drivetrain, and catapult together. Gears deformed under catapult tension, fixed by changing the pull-down method.",
        chapter: "Chapter 8, Combining Mechanisms",
        slug: "combining-mechanisms",
      },
      {
        label: "PTO",
        detail:
          "The first PTO split one motor bank across intake, outtake, and catapult. Partway through the season the drivetrain needed more power too, so it folded into the same shared system, four mechanisms instead of three.",
        chapter: "Chapter 9, PTOs",
        slug: "ptos",
      },
    ],
    lesson: "More complexity, but it unlocked speed we could not get any other way.",
  },
  {
    id: "full-volume",
    name: "Full Volume",
    program: "VEX IQ",
    premise:
      "Red blocks unlocked the big bonuses, but were too large to handle alongside green and purple in the same match. Green and purple were similar enough to share one intake, so that is what we built for.",
    fusion: "Fully separate",
    mechanisms: [
      {
        label: "Concepts we worked through",
        detail:
          "A green-block-only robot, a purple-block-only robot, and several elevator configurations before settling on a direction. The core concept stabilised early, the mechanisms serving it kept improving all season.",
        chapter: "Chapter 3, Brainstorming",
        slug: "brainstorming-your-robot",
      },
      {
        label: "Intake",
        detail: "Reworked intake geometry, one mechanism to pick up and a separate one to sort and score by colour.",
        chapter: "Chapter 6, Intakes",
        slug: "intakes",
      },
      {
        label: "Mechanism fusion",
        detail: "Modular by design. No fusion needed, and it scored both colours better that way.",
        chapter: "Chapter 8, Combining Mechanisms",
        slug: "combining-mechanisms",
      },
      {
        label: "PTO",
        detail:
          "Motor-sharing between intake and lift meant 4 full motors on intake, then 4 full motors on lift, instead of a fixed 2/2 split. Scoring got faster on both ends.",
        chapter: "Chapter 9, PTOs",
        slug: "ptos",
      },
    ],
    lesson: "The right call was reading which elements could share one mechanism, not chasing the biggest bonus.",
  },
  {
    id: "mix-and-match",
    name: "Mix and Match",
    program: "VEX IQ",
    premise:
      "The bonus structure rewarded pairing beams with pins, so a robot handling both object types was worth more than one that specialised.",
    fusion: "Two mechanisms fused",
    mechanisms: [
      {
        label: "Claw",
        detail: "A pivot claw with an extended arm.",
        chapter: "Chapter 6, Intakes",
        slug: "intakes",
      },
      {
        label: "Mechanism fusion",
        detail:
          "Started modular, one to stake the pin and one to clamp the beam. A shared motor link tied the drivetrain to the back beam arm. The pivot and rotation point changed so the pin slipped cleanly onto the standoff goal, scoring pin and beam in one pass.",
        chapter: "Chapter 8, Combining Mechanisms",
        slug: "combining-mechanisms",
      },
      {
        label: "PTO",
        detail:
          "4-motor drivetrain with the lift down, 2-motor drivetrain plus 2 lift motors when raising the beam lift to score. Field speed nearly doubled, and that is what got the max-score runs.",
        chapter: "Chapter 9, PTOs",
        slug: "ptos",
      },
    ],
    lesson: "The highest-value PTO trade is drivetrain against a mechanism, because driving and scoring rarely happen at the same instant.",
  },
  {
    id: "slapshot",
    name: "Slapshot",
    program: "VEX IQ",
    premise: "A flywheel game where space was the constraint.",
    fusion: "One fusion",
    mechanisms: [
      {
        label: "Flywheel and dispenser",
        detail:
          "Mostly modular. The flywheel shared a motor with the dispenser to save space, tuned so the dispenser never slowed the flywheel's shot. Freed motors and space while shot speed held.",
        chapter: "Chapter 8, Combining Mechanisms",
        slug: "combining-mechanisms",
      },
    ],
    lesson: "Fusing cost nothing here because the two motions never conflicted.",
  },
  {
    id: "high-stakes",
    name: "High Stakes",
    program: "V5RC",
    premise: "Our first V5RC drivetrain built around a specific field strategy rather than a general-purpose base.",
    mechanisms: [
      {
        label: "Drivetrain",
        detail:
          "6-motor tank drive at 450 RPM, 8 wheels, 6 omni and 2 traction centred. 450 gave the speed the field strategy needed, and the centred traction pair gave pushing power at the goal without killing the turning radius.",
        chapter: "Chapter 15, Advanced Drivetrains",
        slug: "advanced-drivetrains",
      },
    ],
    lesson: "Centre a traction pair on an omni base and the robot pivots cleanly around that line.",
  },
  {
    id: "push-back",
    name: "Push Back",
    program: "V5RC",
    premise: "A field with a barrier obstacle, so crossing it mattered more than top speed.",
    mechanisms: [
      {
        label: "Drivetrain",
        detail:
          "6-motor drive at 320 RPM on 4 inch wheels, all four omni. Geared down for torque instead of top speed, and full omni kept us mobile crossing the barrier instead of fighting for traction on the ramp.",
        chapter: "Chapter 15, Advanced Drivetrains",
        slug: "advanced-drivetrains",
      },
      {
        label: "Roller speeds",
        detail:
          "One speed, 1200 RPM, ran every roller on the robot, and it burned motors out early because splitting the drivetrain motors from the intake cut torque to each roller. The fix was dropping most rollers to 900 for torque and leaving the front intake at 1800, since it only ever pushes a ball that is already stuck.",
        chapter: "Chapter 11, The Engineering Notebook",
        slug: "the-engineering-notebook",
      },
      {
        label: "Odometry, rejected",
        detail:
          "We tested odometry pods on this robot and wrote down that we weighed the pros and cons and decided against it. That one sentence is what stops someone re-testing the same dead end two seasons from now.",
        chapter: "Chapter 11, The Engineering Notebook",
        slug: "the-engineering-notebook",
      },
    ],
    lesson: "Gear for the obstacle in front of you, not for the top speed you wish you had.",
  },
];
