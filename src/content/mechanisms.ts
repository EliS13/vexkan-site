import { Program } from "./sources";

/**
 * Intake and outtake options as teams actually build them, split by program
 * because IQ and V5RC are different kits. IQ has no flex wheels and no
 * polycarbonate. V5RC has no tank treads or intake flaps.
 *
 * The big correction over a naive "what shape is it" tree: rollers handle odd
 * shapes fine. 16688A ran roller intakes on donut-shaped rings one season and
 * on pins the next. Shape is rarely what decides the mechanism, the job is.
 */

export type Job = "floor" | "loader" | "feed" | "hold" | "descore";
export type Volume = "one" | "stream";
export type Travel = "flat" | "lift";
export type BuildStage = "pickup" | "transport" | "release";

export interface Mechanism {
  id: string;
  name: string;
  program: Program | "both";
  scheme: "purple" | "teal" | "amber" | "neutral";
  what: string;
  /** Which parts of the build stack this can cover on its own. */
  covers: BuildStage[];
  goodAt: string[];
  costs: string[];
  tune: string;
  sourceIds: string[];
}

export const MECHANISMS: Record<string, Mechanism> = {
  /* ---------------- V5RC ---------------- */
  v5TopDown: {
    id: "v5TopDown",
    name: "Flex wheel roller",
    program: "v5",
    scheme: "teal",
    what: "Flex wheels spanning the front of the robot that press elements down and back as you drive over them.",
    covers: ["pickup"],
    goodAt: [
      "The standard stage one, most competitive stacks start here",
      "Grabbing anything you drive into, without lining up first",
      "Covering the full width of the robot",
    ],
    costs: [
      "Can jam an element between the roller and the floor",
      "Less compression control than a two-sided intake",
      "Fewer contact points, so it holds on less tightly",
    ],
    tune: "Ride height, then flex wheel durometer. Softer wheels grip harder objects better.",
    sourceIds: ["sigbotsIntakes", "flexWheels"],
  },
  v5RubberBandRoller: {
    id: "v5RubberBandRoller",
    name: "Rubber band roller",
    program: "v5",
    scheme: "teal",
    what: "Rubber bands stretched between two hubs or sprockets on a shaft, making a grippy roller for almost nothing in parts.",
    covers: ["pickup", "transport"],
    goodAt: [
      "Gripping hard without crushing, the bands give where a hard wheel would not",
      "Costing almost nothing and being rebuildable in minutes",
      "Handling odd shapes, the bands wrap around whatever they meet",
    ],
    costs: ["Bands stretch and snap, so keep spares in the pit", "Grip changes as the bands wear through a day"],
    tune: "Band count and how tight you stretch them. More bands means more grip and more friction on the motor.",
    sourceIds: ["forum", "v5Assembly"],
  },
  v5SideRollers: {
    id: "v5SideRollers",
    name: "Side rollers",
    program: "v5",
    scheme: "teal",
    what: "Two rollers facing each other that pinch the element as it passes between them.",
    covers: ["pickup", "transport"],
    goodAt: [
      "Squeezing hard, which is what descoring needs",
      "Holding an element while you drive",
      "Adjustable grip, just move the rollers closer",
    ],
    costs: [
      "You have to drive fairly straight at the element",
      "Roller spacing is tied to the element size",
      "More compression means less reach",
    ],
    tune: "Roller spacing sets compression. Start loose and tighten until it stops slipping.",
    sourceIds: ["sigbotsIntakes"],
  },
  v5ChainHook: {
    id: "v5ChainHook",
    name: "Chain intake with polycarbonate hooks",
    program: "v5",
    scheme: "purple",
    what: "A chain loop carrying heat-bent polycarbonate hooks that scoop the element and carry it upward.",
    covers: ["pickup", "transport", "release"],
    goodAt: [
      "Rings and donuts, the hook goes through the hole",
      "Picking up off the floor and lifting in one motion",
      "Feeding a scorer high up without a separate lift",
    ],
    costs: [
      "Spends your season's plastic budget, recent V5RC rules require every cut plastic piece to nest into a single 12in by 24in sheet",
      "More parts to keep aligned, and chain needs tensioning or it skips",
      "Hooks wear and need replacing, and each replacement costs plastic again",
    ],
    tune: "Only spend plastic here if a roller genuinely cannot do the job. If you do, heat-bend it rather than using metal, and check this season’s plastic allowance in the manual before you cut anything.",
    sourceIds: ["forum", "sigbots"],
  },
  v5Conveyor: {
    id: "v5Conveyor",
    name: "Conveyor or belt",
    program: "v5",
    scheme: "purple",
    what: "Sprockets running latex tubing, rubber bands, or anti-slip matting to move elements through the robot.",
    covers: ["transport", "release"],
    goodAt: [
      "Carrying a stream of elements without stopping",
      "Storing several inside the robot at once",
      "Bridging an intake and a scorer",
    ],
    costs: ["Takes up real internal space", "Elements back up and jam if the scorer is slower", "Belt material stretches"],
    tune: "Belt tension and how much the element squishes as it rides. Too tight stalls the motor.",
    sourceIds: ["sigbotsIntakes"],
  },
  v5Wedge: {
    id: "v5Wedge",
    name: "Passive wedge or plow",
    program: "v5",
    scheme: "neutral",
    what: "A shaped piece of plastic or metal with no motor that herds elements toward your real intake.",
    covers: ["pickup"],
    goodAt: ["Costing zero motors and zero air", "Gathering elements into the intake", "Being nearly unbreakable"],
    costs: ["Cannot lift or hold anything", "Only pushes, never controls", "Counts against your size limit"],
    tune: "Angle. Shallow enough to guide, steep enough not to shove elements away.",
    sourceIds: ["forum"],
  },
  v5Claw: {
    id: "v5Claw",
    name: "Pneumatic claw",
    program: "v5",
    scheme: "amber",
    what: "Two jaws driven by an air cylinder that close around a single element.",
    covers: ["pickup", "release"],
    goodAt: ["Clamping one element very securely", "Closing faster than a motor can", "Holding without drawing current"],
    costs: [
      "Needs a tank, a solenoid, and tubing you may not have",
      "One element at a time, never a stream",
      "Sized to one element, so a new game usually means a new claw",
    ],
    tune: "Jaw shape, not pressure. If it crushes or slips, the geometry is wrong.",
    sourceIds: ["kb", "v5Assembly"],
  },

  /* ---------------- VEX IQ ---------------- */
  iqRoller: {
    id: "iqRoller",
    name: "Intake rollers across the front",
    program: "iq",
    scheme: "teal",
    what: "Intake rollers or intake belts on a shaft spanning the front, spinning elements in as you drive.",
    covers: ["pickup"],
    goodAt: [
      "Collecting without lining up on each element",
      "Handling odd shapes, this is what 16688A ran on pins",
      "Being the simplest thing that works",
    ],
    costs: ["Can push elements away if the height is wrong", "Limited grip compared to a two-sided intake"],
    tune: "Roller height above the floor, then add rubber bands or traction links if it slips.",
    sourceIds: ["iqIntakeRoller", "iqAssembly"],
  },
  iqRubberBandRoller: {
    id: "iqRubberBandRoller",
    name: "Rubber band roller",
    program: "iq",
    scheme: "teal",
    what: "Rubber bands stretched between two hubs or sprockets on a shaft. A very common IQ intake because it costs almost nothing.",
    covers: ["pickup", "transport"],
    goodAt: [
      "Gripping without crushing, which suits soft or awkward elements",
      "Being cheap and quick to rebuild mid-competition",
      "Handling odd shapes, the bands wrap around whatever they meet",
    ],
    costs: ["Bands stretch and snap, keep spares", "Grip fades across a competition day"],
    tune: "Band count and tension. Add bands until it stops slipping, then stop, every extra band is friction.",
    sourceIds: ["iqAssembly", "forum"],
  },
  iqRollerClaw: {
    id: "iqRollerClaw",
    name: "Roller claw",
    program: "iq",
    scheme: "teal",
    what: "A claw whose jaws spin. Either a fixed beam acting as a friction plate on one side with a powered roller opposite, or powered rollers on both sides.",
    covers: ["pickup", "release"],
    goodAt: [
      "Pulling the element in rather than needing to close around it perfectly",
      "Holding securely once it is in",
      "Releasing by spinning the rollers backwards",
    ],
    costs: ["Usually one element at a time", "Jaw spacing is tied to the element size"],
    tune: "Add rubber bands, intake flaps, or traction links to the jaws to increase grip.",
    sourceIds: ["iqClaws", "iqAssembly"],
  },
  iqConveyor: {
    id: "iqConveyor",
    name: "Tank tread conveyor",
    program: "iq",
    scheme: "purple",
    what: "Sprockets on a driven shaft with tank treads chained around them, and intake flaps attached to the treads.",
    covers: ["pickup", "transport", "release"],
    goodAt: [
      "Carrying elements up and through the robot",
      "Holding several at once between the flaps",
      "Doing pickup and lifting in one mechanism",
    ],
    costs: ["Takes internal space", "Treads need tensioning", "More parts to align than a plain roller"],
    tune: "Flap spacing. Space flaps with chain links to form a U that cradles the element.",
    sourceIds: ["iqAssembly", "forum"],
  },
  iqFlaps: {
    id: "iqFlaps",
    name: "Intake flaps",
    program: "iq",
    scheme: "purple",
    what: "Flaps used to guide elements where you want them, or spaced with chain links into a U that holds an element.",
    covers: ["pickup", "transport"],
    goodAt: ["Steering elements into the real intake", "Cradling an element so it does not roll out", "Cheap in parts and motors"],
    costs: ["Rarely enough on its own", "Wears with contact"],
    tune: "Spacing between flaps, matched to the size of the element.",
    sourceIds: ["iqAssembly"],
  },
  iqPassive: {
    id: "iqPassive",
    name: "Passive assembly",
    program: "iq",
    scheme: "neutral",
    what: "No motor at all. A shaped guide, sometimes with rubber bands storing energy to snap closed.",
    covers: ["pickup"],
    goodAt: ["Costing zero motors, which matters a lot in IQ", "Being nearly unbreakable", "Gathering elements toward the intake"],
    costs: ["No active control", "Cannot lift", "Stored energy fires once until you reset it"],
    tune: "Rubber band tension if it stores energy, otherwise just the guide angle.",
    sourceIds: ["iqAssembly"],
  },
  iqClaw: {
    id: "iqClaw",
    name: "Plain claw",
    program: "iq",
    scheme: "amber",
    what: "Two jaws that close around a single element, driven by a motor or an air cylinder.",
    covers: ["pickup", "release"],
    goodAt: ["Gripping one element securely", "Simple to understand and build"],
    costs: [
      "One element at a time",
      "Shaped around one specific game piece, so it rarely survives to next season",
      "On air it costs you a solenoid, on a motor it is slow to close",
    ],
    tune: "Jaw shape first. Add rubber bands or traction links before you add force.",
    sourceIds: ["iqClaws"],
  },
};


export interface StageRec {
  stage: BuildStage;
  label: string;
  mechanismId: string;
  note: string;
  alternates: string[];
}

export interface Recommendation {
  why: string;
  stages: StageRec[];
  combination: string;
}

const JOB_LABELS: Record<Job, string> = {
  floor: "collecting off the floor",
  loader: "taking elements from a loader",
  feed: "feeding a scorer",
  hold: "holding one element securely",
  descore: "descoring",
};

/**
 * Returns a build stack rather than one mechanism, because real robots chain
 * two or three of these together. Where one mechanism covers several stages,
 * that is called out instead of padding the stack.
 */
export function recommend(
  program: Program,
  job: Job,
  volume: Volume,
  travel: Travel,
  hasPneumatics: boolean
): Recommendation {
  const iq = program === "iq";
  const stages: StageRec[] = [];

  // ---- Pickup ----
  let pickup: string;
  let pickupNote: string;
  let pickupAlts: string[];

  if (job === "descore") {
    pickup = iq ? "iqRollerClaw" : "v5SideRollers";
    pickupNote =
      "Descoring is a torque problem, not a reach problem. You want the most compression you can get on the element.";
    pickupAlts = iq ? ["iqRoller", "iqPassive"] : ["v5TopDown", "v5Wedge"];
  } else if (job === "loader") {
    pickup = iq ? "iqRoller" : "v5TopDown";
    pickupNote =
      "A loader hands you the element at a fixed height, so the mechanism matters less than matching that height. Set your intake so the element arrives already touching the roller, and you will not need to aim at all.";
    pickupAlts = iq ? ["iqRubberBandRoller", "iqFlaps"] : ["v5RubberBandRoller", "v5SideRollers"];
  } else if (job === "hold") {
    pickup = iq ? "iqRollerClaw" : "v5SideRollers";
    pickupNote = hasPneumatics
      ? "Rollers hold by pinching and stay useful for everything else. A claw grips harder, but only reach for it if nothing else holds tightly enough."
      : "Without pneumatics a fast claw is off the table, so a roller that pinches is your grip.";
    pickupAlts = iq
      ? hasPneumatics
        ? ["iqClaw", "iqFlaps"]
        : ["iqFlaps", "iqRoller"]
      : hasPneumatics
        ? ["v5Claw", "v5ChainHook"]
        : ["v5ChainHook", "v5TopDown"];
  } else if (travel === "lift" && volume === "stream") {
    pickup = iq ? "iqRoller" : "v5TopDown";
    pickupNote =
      "Almost every competitive stack starts the same way, a roller across the front that pulls the element in. Lifting is stage two's job, not stage one's. Build the roller first and get it reliable before you worry about height.";
    pickupAlts = iq
      ? ["iqRubberBandRoller", "iqConveyor", "iqRollerClaw"]
      : ["v5RubberBandRoller", "v5SideRollers", "v5ChainHook"];
  } else {
    pickup = iq ? "iqRoller" : "v5TopDown";
    pickupNote =
      "Start with the simplest roller that spans your front. Add stages only once geometry and compression cannot fix the problem.";
    pickupAlts = iq ? ["iqRubberBandRoller", "iqRollerClaw", "iqPassive"] : ["v5RubberBandRoller", "v5SideRollers", "v5Wedge"];
  }

  stages.push({
    stage: "pickup",
    label: "1. Touch the element",
    mechanismId: pickup,
    note: pickupNote,
    alternates: pickupAlts,
  });

  // ---- Transport ----
  const pickupCovers = MECHANISMS[pickup].covers;
  if (travel === "lift" || volume === "stream") {
    if (pickupCovers.includes("transport")) {
      stages.push({
        stage: "transport",
        label: "2. Move it through the robot",
        mechanismId: pickup,
        note: "Your pickup mechanism already covers this stage. That is the cheapest kind of combination, one mechanism doing two jobs.",
        alternates: iq ? ["iqRubberBandRoller", "iqConveyor"] : ["v5RubberBandRoller", "v5Conveyor"],
      });
    } else {
      const transport = iq ? "iqConveyor" : "v5Conveyor";
      stages.push({
        stage: "transport",
        label: "2. Move it through the robot",
        mechanismId: transport,
        note:
          travel === "lift"
            ? "The element has to gain height, and your pickup stage does not lift. This is the stage that carries it."
            : "You are handling several elements, so you need somewhere for them to queue up.",
        alternates: iq ? ["iqRubberBandRoller", "iqFlaps", "iqRollerClaw"] : ["v5RubberBandRoller", "v5SideRollers", "v5ChainHook"],
      });
    }
  }

  // ---- Release ----
  const last = stages[stages.length - 1].mechanismId;
  if (MECHANISMS[last].covers.includes("release")) {
    stages.push({
      stage: "release",
      label: "3. Put it where it scores",
      mechanismId: last,
      note: "Run this mechanism backwards and it becomes your outtake. No extra parts, no extra motors.",
      alternates: iq ? ["iqRollerClaw", "iqClaw"] : ["v5Conveyor", "v5Claw"],
    });
  } else {
    const release = iq ? "iqRollerClaw" : "v5Conveyor";
    stages.push({
      stage: "release",
      label: "3. Put it where it scores",
      mechanismId: release,
      note: "Your earlier stages cannot let go in a controlled way, so this is what actually places the element.",
      alternates: iq ? ["iqFlaps", "iqClaw"] : ["v5ChainHook", "v5Claw"],
    });
  }

  const distinct = new Set(stages.map((s) => s.mechanismId));
  const combination =
    distinct.size === 1
      ? `One mechanism covers all three stages here. That is the ideal outcome, and it is exactly what Chapter 8 means by fusing, share the motor when the motions do not conflict.`
      : `This is a ${distinct.size}-mechanism stack, and that is normal. Most competitive robots chain two or three of these together. Before you build all of them, check whether any pair can share a motor without their motions conflicting, that is the Chapter 8 question.`;

  return {
    why: `For ${JOB_LABELS[job]} in ${iq ? "VEX IQ" : "V5RC"}, ${
      volume === "stream" ? "several elements at a time" : "one element at a time"
    }, ${travel === "lift" ? "travelling upward inside the robot" : "staying near floor height"}.`,
    stages,
    combination,
  };
}

export const CLAW_NOTE =
  "A plain claw handles one element at a time and gets shaped around one specific game piece, which is why it rarely carries over to the next season. Rollers are the versatile answer, and they cope with odd shapes better than people expect. 16688A ran roller intakes on the donut-shaped rings, on the Push Back blocks, and on this season's cups and pins. If you want claw-like grip without giving that up, a roller claw pulls the element in instead of just pinching it.";

export const OUTTAKE_NOTE =
  "Most of these double as your outtake. Run a roller or a conveyor backwards and it becomes a scorer, which is the whole point of Chapter 8, one mechanism doing two jobs.";
