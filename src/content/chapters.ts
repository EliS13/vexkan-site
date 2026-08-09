import { Chapter } from "./types";

export const chapters: Chapter[] = [
  {
    number: 1,
    part: "iq",
    title: "Welcome to VEX IQ",
    slug: "welcome-to-vex-iq",
    status: "ready",
    dek: "What VEX IQ is, and why it's the right place to start.",
    blocks: [
      {
        type: "p",
        text: "If you've snapped LEGO bricks together and wondered what happens if you add a wheel, you've already done real engineering. VEX IQ gives that instinct a real platform, and a season with a purpose.",
      },
      { type: "h2", text: "VEX IQ as a Whole" },
      {
        type: "p",
        text: "VEX IQ sits in the middle of the VEX progression, past beginner kits, before V5. This is where the real foundational learning happens.",
      },
      {
        type: "list",
        items: [
          "Modular hardware. Beams, connectors, gears, and motors snap together. No tools beyond what's in the kit.",
          "Larger-scale parts. More room to see your mechanism work, faster to iterate.",
          "One brain runs everything. Every motor and sensor connects through a single programmable controller. Wiring and coding it is your first lesson in how machine parts talk to each other.",
        ],
      },
      {
        type: "diagram",
        id: "brain-system",
        caption:
          "Every motor and sensor connects back through one controller. Wiring and coding it is your first lesson in how machine parts talk to each other.",
      },
      { type: "h2", text: "The Competition" },
      {
        type: "p",
        text: "A new game drops every year. Nobody has solved it yet. Beginner or veteran, every team starts from zero on the same day.",
      },
      {
        type: "list",
        items: [
          "Teamwork Challenge. Two robots, one alliance, 60-second matches. You score together.",
          "Robot Skills Challenge. Your robot alone against the clock: Driving Skills (you drive) and Autonomous Coding Skills (your code drives).",
        ],
      },
      {
        type: "diagram",
        id: "competition-formats",
        caption: "The two ways you compete in a VEX IQ season, side by side.",
      },
      { type: "h2", text: "Culture" },
      {
        type: "p",
        text: "VEX IQ is competitive, but the respect between teams is real, rarer at higher levels. Use it while you're here.",
      },
    ],
  },
  {
    number: 2,
    part: "iq",
    title: "The Season Starts Before You Touch a Robot",
    slug: "season-starts-before-you-touch-a-robot",
    status: "ready",
    dek: "The game manual is a design brief, not a rulebook. Read it that way from day one.",
    blocks: [
      {
        type: "p",
        text: "There's a moment every year that the VEX IQ community waits for. World's ends, usually late April, sometimes early May, and within hours, the new game manual drops on vex.com. Phones light up. Group chats go off. Teams that just finished competing are already scrolling through it, trying to figure out what this year's game is going to feel like.",
      },
      { type: "p", text: "That moment is when the season actually starts." },
      {
        type: "p",
        text: "Most teams don't treat it that way. Most teams read the manual because they have to, file it away, and only pick it up again when someone asks a question about the rules at a tournament. Those teams are leaving something significant on the table. The game manual isn't a rulebook to comply with. It's a design brief. And the teams that treat it like one from day one show up to their first competition with a real strategy rather than a robot still looking for one.",
      },
      { type: "h2", text: "How to Actually Read It" },
      {
        type: "p",
        text: "The manual is intimidating the first time. It's long, dense, and structured in a way that can make it feel more like a legal document than a game guide. That feeling fades once you know what you're looking for.",
      },
      {
        type: "p",
        text: "I don't start at page one. I go straight to the scoring section, what the objects are, how points are earned, and what conditions need to be met. Before anything else, I want to understand what winning looks like mechanically. Scoring changes completely from year to year, so there's no carry-over assumption you can rely on. Every season genuinely starts from scratch.",
      },
      {
        type: "p",
        text: "From there, I move into the general rules, and this is where I'm paying attention to what has changed. The manual carries a lot of language forward from previous seasons, but the small modifications are the ones that matter. A subtle shift in how a rule is worded, a new part restriction, a modified definition of what counts as a legal score, these are easy to miss if you're skimming, and missing them mid-season has consequences.",
      },
      {
        type: "p",
        text: "The habit worth building: re-read the manual throughout the year. Come back to it after your first design meeting. Come back to it after your first scrimmage. Things that seemed minor in April will mean something different in November.",
      },
      {
        type: "diagram",
        id: "manual-reading-flow",
        caption: "The order I read a new game manual in, and what I am hunting for at each stop.",
      },
      { type: "h2", text: "Reading Rules vs. Understanding the Game" },
      {
        type: "p",
        text: "There's a distinction worth drawing carefully here. Reading the rules tells you what's legal. Understanding the game tells you what's optimal. The gap between those two things is where strategy lives.",
      },
      {
        type: "p",
        text: "A newer team reads the manual and comes away with a list of constraints. An experienced team reads the same document and comes away with a map, where the leverage points are, which scoring elements are worth prioritizing, and which rules leave room that can be used to their advantage.",
      },
      {
        type: "p",
        text: "This season is a good example. Some teams identified that building a structure over the long goals, effectively a roof, wasn't prohibited by any rule, and used it to block opponents from scoring. Others found that controlling both middle goals simultaneously was achievable without triggering violations if approached a specific way. Neither was a loophole in the pejorative sense. Both were teams that had read carefully enough to see what the rules permitted rather than just what they required.",
      },
      {
        type: "p",
        text: "That kind of reading takes experience. It shouldn't be expected in your first season. But knowing it exists, that the manual rewards close attention with strategic insight, is reason enough to take it seriously from the start.",
      },
      { type: "h2", text: "When Rules Are Ambiguous" },
      {
        type: "p",
        text: "Not every rule is written with perfect clarity, and different referees can interpret the same language differently. The worst time to discover this is mid-match.",
      },
      {
        type: "p",
        text: "VEX has a built-in process for this: the Q&A. You can submit questions directly to head referees through the official system and receive clarifications that become part of the official record. If a rule is genuinely unclear, that's where you resolve it, not by assuming your interpretation is correct, not by asking the internet, but by getting a definitive answer from the people enforcing the rules at your event. Teams that use it walk into tournaments with confidence. Teams that don't are gambling.",
      },
      { type: "h2", text: "What I Tell New Team Members" },
      {
        type: "p",
        text: "When I walk new VexKan members through the manual for the first time, we read it together, out loud, stopping to discuss. What does this mean? How many points does this score? Is this a constraint or an opportunity?",
      },
      {
        type: "p",
        text: "The mistake I see most often isn't confusion. It's dismissal. New competitors read through it, check it off their mental list, and never open it again. They treat it as a task rather than a resource.",
      },
      {
        type: "p",
        text: "You can tell when that shift happens, when a teammate stops seeing the manual as an obligation and starts seeing it as a tool. It shows up as confidence. They'll say: \"That's legal because of this rule,\" or \"If we do it this way, we get the bonus.\" Not guessing, not deferring. They've done the reading and they know.",
      },
      {
        type: "p",
        text: "That's the standard worth holding yourself to. The season starts with a PDF. How seriously you take it is one of the earliest decisions you make, and it compounds over the entire year.",
      },
    ],
  },
  {
    number: 3,
    part: "iq",
    title: "Brainstorming Your Robot",
    slug: "brainstorming-your-robot",
    status: "ready",
    dek: "Finding the right idea fast, before you build, test, and refine it.",
    tools: ["scoring-matrix"],
    blocks: [
      {
        type: "p",
        text: "The first meeting of a new season is always the same. Someone opens the game reveal video, we watch it twice, and then we do nothing with the robot for the next few days. Brainstorming is not about having the most creative idea. It is about finding the right idea fast enough that you still have time to build, test, and refine it. The teams that skip this phase and jump straight into building rarely end up with the robot they wanted.",
      },
      {
        type: "diagram",
        id: "brainstorming-steps",
        caption: "The six steps below, start to finish. Nothing gets built until step six.",
      },
      { type: "h2", text: "Step 1: Analyze the Game First" },
      {
        type: "p",
        text: "Before sketching a single mechanism, spend your first session breaking down the game itself. The question you always start with is this: what is the highest-value thing we think we can consistently score?",
      },
      {
        type: "p",
        text: "That sounds obvious, but the answer changes every year, and getting it wrong early sends your entire build in the wrong direction.",
      },
      {
        type: "p",
        text: "In Full Volume, the obvious choice to a newcomer was the red blocks. They unlocked high-level bonuses and looked impressive. But when we looked closer, we realized that red blocks were too large to handle alongside green and purple blocks in the same match. Chasing the red block bonus meant abandoning everything else. The green and purple blocks, because of their similar size, could be handled by the same intake mechanism, making them far more efficient to score together. That single observation defined our entire build direction.",
      },
      {
        type: "p",
        text: "In Rapid Relay, the balls could score in all four zones of the goal. Identifying that early told us that range and flexibility mattered more than raw power, which shaped every mechanism we considered.",
      },
      {
        type: "p",
        text: "In Mix and Match, it was pairing the beams with the pins together. The bonus structure rewarded matching, so a robot that could handle both object types was worth more than one that specialized in just one.",
      },
      { type: "h2", text: "Step 2: Generate Raw Ideas" },
      {
        type: "p",
        text: "Once you understand what you are trying to score, move to the simplest possible version of how to score it. This is not a polished design session. These are rough hand-drawn diagrams, two-sentence descriptions, and references to mechanisms you have seen work in previous seasons.",
      },
      {
        type: "p",
        text: "In Rapid Relay, we put four concepts on the table: a standard catapult with adjustable tension, a double catapult for launching two balls simultaneously, a flywheel, and a backroller that combined a catapult for the upper goal with a rubber band roller on the back for the lower goal. None of these were fully designed. They were just enough to argue about.",
      },
      {
        type: "p",
        text: "In Full Volume, we went through a green-block-only robot, a purple-block-only robot, and several elevator configurations before settling on a direction. The core concept stabilized early, but the mechanisms serving it kept improving throughout the season.",
      },
      {
        type: "p",
        text: "Keep ideas rough at this stage. Overdesigning before you debate is a waste of time and creates attachment to concepts that have not been stress-tested yet.",
      },
      { type: "h2", text: "Step 3: Research Before You Commit" },
      {
        type: "p",
        text: "After generating initial ideas, look outward. Research what other teams are building, share videos and links within the group, and use what you find to pressure-test your own concepts. This is not copying. It is checking your assumptions before you invest build time.",
      },
      {
        type: "p",
        text: "If multiple strong teams have already tried the mechanism you are excited about and consistently failed with it, you need to know that before you commit to six weeks of building.",
      },
      { type: "h2", text: "Step 4: Debate Every Idea" },
      {
        type: "p",
        text: "This is where the real brainstorming happens. Argue every concept, not to tear ideas down, but to understand their limits before you build anything.",
      },
      {
        type: "p",
        text: "In Rapid Relay, we seriously considered a long-range launcher. It was an exciting idea. But when we stress-tested it through debate, the problems became clear: alignment was difficult to program consistently, and small angle errors at distance caused dramatic accuracy loss. We cut it. Not because someone overruled the room, but because the evidence built through argument made the answer obvious.",
      },
      {
        type: "p",
        text: "Arguments in brainstorming should be structured. For every idea, answer three things:",
      },
      {
        type: "list",
        items: [
          "What does this design do well?",
          "What breaks first under match pressure?",
          "How hard is it to recover when it does break?",
        ],
      },
      { type: "p", text: "If a design cannot survive those three questions, it should not survive brainstorming." },
      { type: "h2", text: "Step 5: The Scoring Matrix" },
      {
        type: "p",
        text: "Every idea that survives debate goes into the scoring matrix in your Engineering Notebook. This is not a formality. It forces you to assign numbers to opinions, which removes the loudest voice in the room from the decision.",
      },
      { type: "p", text: "Our matrix scored each concept across seven criteria:" },
      {
        type: "table",
        headers: ["Criteria", "What It Measures", "Why It Matters"],
        rows: [
          ["Type of Scoring", "Which game element or goal is being scored.", "Defines what the mechanism needs to do and sets the scope of the design."],
          ["Theoretical Consistency", "How reliably can this be executed in a match?", "A mechanism that scores more but fails often is worse than one that scores less reliably."],
          ["Complexity to Build", "How difficult is this to construct and iterate on?", "Simpler designs are faster to build, easier to fix mid-season, and easier to hand off to new team members."],
          ["Ease of Driving / Programming", "How easy is it to operate or automate?", "Driver error and programming difficulty are real costs. A mechanism that requires perfect inputs is risky."],
          ["Risk of Failure", "What is the failure, and how bad is it?", "Some failures lose a few points. Others end your match. Weight risk accordingly."],
          ["Time to Complete", "Estimated time per scoring cycle in a match.", "Faster cycles multiply across a match. A slightly lower-scoring mechanism may outscore a slow one over 60 seconds."],
          ["Relevance to Meta", "How well does this align with expected competition strategy?", "What other teams are doing affects alliance selection, match strategy, and scoring opportunities."],
        ],
      },
      {
        type: "p",
        text: "A design that sounds great in debate but scores poorly across five of those seven criteria does not move forward, regardless of how much anyone wants it to. The matrix removes personal bias from the decision and gives you a documented rationale for every choice you make.",
      },
      {
        type: "p",
        text: "It also creates accountability later. When a design choice comes back to hurt you mid-season, you can look at the matrix and see exactly what you predicted, what you missed, and why you made the call you did. That retrospective is just as valuable as the decision itself.",
      },
      {
        type: "callout",
        kind: "note",
        text: "Document every idea, including the ones you rejected. Write down why you rejected them. At competitions, judges ask about your design process, not just your final robot. Showing that you considered and eliminated options demonstrates engineering thinking, not just building.",
      },
      { type: "h2", text: "Step 6: First Prototype" },
      {
        type: "p",
        text: "Once you have a direction, build a first prototype. Not a competition robot, but a rough version of the core mechanism, built fast, to see if the idea holds up when it is physical and not just on paper.",
      },
      {
        type: "p",
        text: "Brainstorming ends the moment something is real. Until then, ideas are free. Use that freedom deliberately, because once you start building, changing course costs time you cannot get back.",
      },
      {
        type: "takeaway",
        text: "The brainstorming phase feels slow when you are eager to build. Push through it anyway. The teams that spend two extra days debating at the start of the season are the ones that are still iterating their robot in the final weeks instead of rebuilding it from scratch.",
      },
    ],
  },
  {
    number: 4,
    part: "iq",
    title: "Research Skills for Robotics",
    slug: "research-skills-for-robotics",
    status: "ready",
    dek: "Where to look, what to watch for, and who to study before you pick up a beam.",
    blocks: [
      {
        type: "p",
        text: "I used to think research meant copying the best robot I could find. It does not. Research means understanding why a design works, then building your own version of it. This chapter covers where to look, what to watch for, and who to study before you ever pick up a beam.",
      },
      { type: "h2", text: "Where to Look" },
      {
        type: "diagram",
        id: "research-sources",
        caption: "The four places I check at the start of every season, and what each one is good for.",
      },
      { type: "h2", text: "1. Reveal Videos" },
      {
        type: "p",
        text: 'Reveal videos are how teams show off a finished robot, usually with a short build montage cut in with match footage. I search "[season name] VEX IQ reveal" on YouTube at the start of every season to see what other teams built. I watch the build clips frame by frame, not just the matches, and I pause on any mechanism I do not recognize long enough to sketch it.',
      },
      {
        type: "link",
        label: "Search reveal videos on YouTube",
        href: "https://www.youtube.com/results?search_query=VEX+IQ+reveal",
        description: "Start here at the top of every season, then narrow the search to the current game's name.",
      },
      { type: "h2", text: "2. VEX Forum" },
      {
        type: "p",
        text: "The VEX Forum is where the GDC posts official rule clarifications, and where teams from around the world post build threads and ask questions. I search the forum before I post anything, since most questions have already been answered. It is also the fastest way to confirm a rule before an event.",
      },
      {
        type: "link",
        label: "VEX Forum",
        href: "https://www.vexforum.com/",
        description: "Official rule clarifications from the GDC, plus build threads from teams worldwide.",
      },
      { type: "h2", text: "3. YouTube Channels" },
      {
        type: "p",
        text: "I follow the official VEX Robotics channels for season content, trailers, and game reveals. Beyond the official channels, I subscribe to some specific channels that produce consistent VEX videos such as RoboSTEM or other teams online.",
      },
      { type: "h2", text: "4. Discord Servers" },
      {
        type: "p",
        text: "RoboStem is one server I check often, a lively VEX IQ and V5RC community where teams post robot photos and trade ideas. I also search for my own region's VEX Discord, since most states and countries run one. I lurk first and read the pinned messages before I post anything myself.",
      },
      { type: "h2", text: "Why Research Matters" },
      {
        type: "p",
        text: "Research is not about copying. It is about understanding why something works before you try to build it yourself, and knowing what to look for once you start watching.",
      },
      { type: "h2", text: "Who to Study" },
      {
        type: "p",
        text: "Skip the urge to copy the highest ranked team in the world right away. Teams ranked near the top of your own competition's skills standings are solving the exact field you are solving, which makes their solutions far more useful to you.",
      },
    ],
  },
  {
    number: 5,
    part: "iq",
    title: "Building the Drivetrain",
    slug: "building-the-drivetrain",
    status: "ready",
    dek: "Get the drivetrain wrong and nothing else on the robot matters.",
    tools: ["gear-ratio"],
    blocks: [
      {
        type: "p",
        text: "Your drivetrain decides how your robot moves. Get it wrong and nothing else on the robot matters, because the robot cannot get where it needs to go.",
      },
      { type: "h2", text: "Pick Your Drive Type" },
      {
        type: "p",
        text: "IQ gives you three real options. Default to tank drive unless the season specifically rewards sideways movement.",
      },
      {
        type: "diagram",
        id: "drive-types",
        caption:
          "The three real options in IQ. Tank is the default unless the season specifically rewards sideways movement.",
      },
      { type: "h2", text: "Speed vs Torque" },
      {
        type: "p",
        text: "Every gear ratio trades speed for torque. Build your ratio around your robot's final weight, not its weight on day one.",
      },
      {
        type: "diagram",
        id: "speed-torque",
        caption:
          "Gear up and you buy torque with speed. Gear down and you buy speed with torque. There is no ratio that gives you both.",
      },
      { type: "h2", text: "Ratios and Motor Count" },
      {
        type: "p",
        text: "Gear ratio and motor count are not separate decisions, they work together. Pick your ratio for the robot's final weight, then pick your motor count to support that ratio, not the other way around. Torque-heavy ratios like 4:3 rarely need four motors, they already carry the power. Speed-heavy ratios like 2.5:1 and 3:1 are the ones that start asking for four motors, since more speed multiplies the load on fewer motors.",
      },
      {
        type: "callout",
        kind: "video",
        text: "Two identical robots, one on 2-motor drive, one on 4-motor drive, pushed against resistance to show the torque difference live.",
      },
      {
        type: "link",
        label: "Try the gear ratio calculator",
        href: "/guide/tools/gear-ratio",
        description: "Play with ratio and motor count yourself and see the speed/torque tradeoff instantly.",
      },
    ],
  },
  {
    number: 6,
    part: "iq",
    title: "Intakes",
    slug: "intakes",
    status: "ready",
    dek: "The only part of the robot that actually touches the game element.",
    tools: ["mechanism-picker"],
    blocks: [
      {
        type: "p",
        text: "Your intake is the only part of the robot that actually touches the game element. No drivetrain speed or scoring mechanism fixes a robot that can't pick things up.",
      },
      {
        type: "diagram",
        id: "scoring-cycle",
        caption:
          "The intake is step one of a loop your robot repeats all match. Every step you speed up multiplies across 60 seconds.",
      },
      { type: "h2", text: "Before You Choose" },
      {
        type: "callout",
        kind: "flag",
        text: "The book poses five checklist questions here before you sketch a mechanism. The list itself is a visual in the printed book and isn't in this draft yet.",
      },
      { type: "h2", text: "Choosing Your Mechanism" },
      { type: "p", text: "Your checklist answers plug straight into this. Job first, mechanism second." },
      { type: "h2", text: "The Four Types" },
      {
        type: "p",
        text: "Compliant wheels and linear slides both cost you something, tuning simplicity in one case, build complexity in the other, for the range they buy you.",
      },
      { type: "callout", kind: "photo", text: "Your team's intake and claw side by side." },
      { type: "realbuild", title: "Full Volume Intake", text: "Before and after shots of the intake geometry." },
      { type: "realbuild", title: "Mix and Match Claw", text: "Pivot claw with extended arm." },
      { type: "h2", text: "Prototype Fast" },
      {
        type: "p",
        text: "Solve sizing and placement problems with geometry and dimensions first. Add a new axis or switch mechanism type only when geometry can't fix it.",
      },
      { type: "h2", text: "What's Next" },
      {
        type: "p",
        text: "Chapter 7 covers the other end of the cycle, getting the game element back off the robot and into the goal.",
      },
    ],
  },
  {
    number: 7,
    part: "iq",
    title: "Outtake & Scoring",
    slug: "outtake-and-scoring",
    status: "ready",
    dek: "A flawless intake means nothing if the wrong mechanism drops it in the wrong place.",
    tools: ["mechanism-picker"],
    blocks: [
      {
        type: "p",
        text: "The outtake is how the game element leaves your robot and lands where it counts. A flawless intake means nothing if the wrong mechanism drops it in the wrong place, or too slowly to matter.",
      },
      { type: "h2", text: "Before You Choose" },
      {
        type: "callout",
        kind: "flag",
        text: "Same five-question checklist as intakes, for any game, before you touch a single mechanism idea. Visual only in the printed book so far.",
      },
      { type: "h2", text: "Choosing Your Outtake Mechanism" },
      {
        type: "p",
        text: "Your checklist answers are what you plug into this tree. Route left to right, question to mechanism, not the other way around.",
      },
      { type: "h2", text: "The Six Types" },
      { type: "p", text: "Each type trades off speed, precision, or simplicity. None of them give you all three." },
      {
        type: "diagram",
        id: "tradeoff-triangle",
        caption:
          "Whichever outtake you pick, you are choosing which of these three to give up. Decide that on purpose.",
      },
      { type: "callout", kind: "photo", text: "Your team's outtake mechanism scoring in a match." },
      { type: "h2", text: "What's Next" },
      {
        type: "p",
        text: "None of these six types run alone on a real robot. Every one of your builds combines an outtake with intake or transport into a single mechanism. Chapter 8 covers how and why, using Rapid Relay, Full Volume, Mix and Match, and Slapshot as the real examples.",
      },
    ],
  },
  {
    number: 8,
    part: "iq",
    title: "Combining Mechanisms",
    slug: "combining-mechanisms",
    status: "ready",
    dek: "Integration is a dial, not a switch. Four seasons show how far to turn it.",
    tools: ["season-planner"],
    blocks: [
      {
        type: "p",
        text: "Integration is a dial, not a switch. How much you fuse depends on space and motor budget that season.",
      },
      {
        type: "p",
        text: "Integrate when two functions can share a motor without their motions conflicting. Fusing costs independent control, only pay it when nothing's lost.",
      },
      { type: "p", text: "Stay modular when a function needs its own timing, direction, or speed." },
      {
        type: "diagram",
        id: "fusion-spectrum",
        caption: "Four seasons, four different answers. Where a robot lands depends on that season's space and motor budget.",
      },
      { type: "h2", text: "Full Volume — fully separate" },
      {
        type: "p",
        text: "Modular by design. One mechanism to pick up. One to sort and score by color. Tuning details in Chapter 6. Result: scored both colors better. No fusion needed.",
      },
      { type: "h2", text: "Slapshot — one fusion" },
      {
        type: "p",
        text: "Mostly modular. Flywheel shared a motor with the dispenser to save space. Tuned so the dispenser didn't slow the flywheel's shot. Result: freed motors and space, shot speed held.",
      },
      { type: "h2", text: "Mix and Match — two mechanisms fused" },
      {
        type: "p",
        text: "Started modular: one to stake the pin, one to clamp the beam. A shared motor link tied the drivetrain to the back beam arm. Pivot and rotation point changed so the pin slipped cleanly onto the standoff goal. Result: pin and beam scored in one pass.",
      },
      { type: "h2", text: "Rapid Relay — nearly the whole robot" },
      {
        type: "p",
        text: "Modular first: one to pick up, one to score. A shared motor link tied intake, drivetrain, and catapult together. Gears deformed under catapult tension. Fixed by changing the pull-down method. Result: more consistent scoring.",
      },
      {
        type: "takeaway",
        text: "Ask which functions conflict before fusing. Share the motor if they don't. Don't if they do.",
      },
    ],
  },
  {
    number: 9,
    part: "iq",
    title: "PTOs",
    slug: "ptos",
    status: "ready",
    dek: "One motor, two mechanisms, switching between them instead of running both at once.",
    blocks: [
      {
        type: "p",
        text: "A PTO (Power Take Off) lets one motor drive two different mechanisms, switching between them instead of running both at once.",
      },
      {
        type: "p",
        text: "Build the robot without a PTO first. A PTO doesn't fix a slow or unreliable robot, it makes an already-working robot faster. Add it last, after your drivetrain and mechanisms already score reliably on their own.",
      },
      {
        type: "diagram",
        id: "pto-build-order",
        caption: "The order matters more than the mechanism. Reliable first, fast second.",
      },
      {
        type: "p",
        text: "Four common IQ PTO types, pick based on space and speed. Differential: two output directions, fast switching, no pneumatics needed, but heavy and takes up a lot of space. Slide: two output directions, swift switching, but needs pneumatics and takes up a lot of space. Gravity: no pneumatics, easy to build, but only one output direction and switches slower. Latch: two output directions, easy to build, but switches slower and takes up more space.",
      },
      {
        type: "diagram",
        id: "pto-types",
        caption: "Four common IQ PTO types. Every one of them buys switching speed with space, or the other way around.",
      },
      {
        type: "p",
        text: "Friction is the real enemy of a good PTO, differentials most of all. A PTO only works if the disengaged side actually disengages, any extra friction in the gear train drags the \"off\" mechanism along for the ride and wastes power. Differentials are the worst offender, every gear mesh inside has to be nearly perfect or the whole thing binds. Budget real tuning time, this isn't a build-it-once-and-forget mechanism.",
      },
      {
        type: "p",
        text: "A PTO doesn't create power, it reallocates it. Two mechanisms rarely need full motor count at the same instant. A permanent 2/2 split wastes power on both ends. A PTO sends all of it to whichever mechanism is active.",
      },
      {
        type: "realbuild",
        title: "Full Volume",
        text: "Motor-sharing between intake and lift meant 4 full motors on intake, then 4 full motors on lift, instead of a fixed 2/2 split. Scoring got faster on both ends.",
      },
      {
        type: "p",
        text: "The highest-value trade is drivetrain vs. mechanism. Driving and scoring rarely happen at the exact same instant, so borrowing drivetrain motors during scoring, and mechanism motors during driving, is close to free power.",
      },
      {
        type: "realbuild",
        title: "Mix and Match",
        text: "4-motor drivetrain when the lift is down, 2-motor drivetrain plus 2 lift motors when raising the beam lift to score. Field speed nearly doubled. That's what got us max-score runs.",
      },
      {
        type: "diagram",
        id: "pto-power-split",
        caption:
          "The same motors, reassigned the instant the job changes. A permanent 2/2 split would waste power on both ends.",
      },
      {
        type: "realbuild",
        title: "Rapid Relay",
        text: "A PTO can expand mid-season when another function needs the same fix. Rapid Relay's first PTO split one motor bank across three mechanisms, intake, outtake, and catapult. Partway through the season the drivetrain needed more power too, so we folded it into the same shared system, four mechanisms combined instead of three. More complexity, but it unlocked speed we couldn't get otherwise.",
      },
      {
        type: "p",
        text: "Remember why you're doing this. A PTO doesn't rescue a struggling robot, it takes a robot that already works and makes it faster. If your base robot isn't reliable yet, fix that first, a PTO bolted onto a shaky robot just gives you a shaky robot with extra friction.",
      },
      { type: "takeaway", text: "A PTO is a late-season upgrade, not a starting design. Build reliable first, add speed second." },
    ],
  },
  {
    number: 10,
    part: "iq",
    title: "Pneumatics",
    slug: "pneumatics-iq",
    status: "ready",
    dek: "A two-position tool, not a lift. Here's when air beats a motor.",
    blocks: [
      {
        type: "p",
        text: "Real practice every IQ season, pneumatics show up in claws, PTOs, arm-move or quick-latch mechanisms, and expansion outside the starting size box. Not a maybe, part of how we build.",
      },
      {
        type: "p",
        text: "Pneumatics are a two-position tool, not a lift. A cylinder is either fully extended or fully retracted, no holding halfway. If a mechanism needs multiple stopping points, use a motor instead.",
      },
      {
        type: "diagram",
        id: "pneumatic-binary",
        caption:
          "If a mechanism needs to stop halfway, that is a motor's job. If it needs to snap between two positions fast, that is air.",
      },
      {
        type: "p",
        text: "Speed is the entire pitch, and it's why claws run on air. A cylinder fires faster than any motor-driven mechanism can move. A pneumatic claw closes fast enough to grab a game element before it's knocked away, a motor-driven claw is too slow for that same window.",
      },
      {
        type: "p",
        text: "Expansion mechanisms use pneumatics to beat the starting size box. Robots start a match inside a fixed size limit, then can expand once the match begins. A pneumatic cylinder firing outward is the fastest way to expand, instant reach instead of a slow motor-driven unfold.",
      },
      {
        type: "p",
        text: "PTOs and pneumatics combine, air engages the switch instead of a motor. A pneumatic cylinder can throw a PTO's gear engagement in a fraction of a second, freeing a motor to do something else instead of holding a shifting mechanism in place.",
      },
      {
        type: "p",
        text: "One solenoid runs one cylinder, same rule as the V5 kit. Each solenoid controls one cylinder's extend and retract. Claws, expansion, and a pneumatic PTO shift are three separate jobs, that's three solenoids if you want all three firing independently.",
      },
      {
        type: "takeaway",
        text: "Pneumatics are the go-to whenever a motor is too slow, claws, expansion, and PTO shifts all want a burst of speed a motor can't match.",
      },
    ],
  },
  {
    number: 11,
    part: "iq",
    title: "The Engineering Notebook",
    slug: "the-engineering-notebook",
    status: "ready",
    dek: "Where your team thinks out loud so the thinking doesn't disappear.",
    tools: ["notebook-template"],
    blocks: [
      {
        type: "p",
        text: "Your notebook isn't paperwork for judges. It's where your team thinks out loud so the thinking doesn't disappear. Judging criteria gets its own chapter later, this one's about the two jobs your notebook actually does every week.",
      },
      { type: "h2", text: "A Design Tool" },
      {
        type: "p",
        text: "Write down the number, not just the call. A decision with no number attached can't be checked again next season.",
      },
      {
        type: "realbuild",
        title: "Push Back notebook",
        text: "One speed, 1200 RPM, ran every roller on the robot. It burned motors out early because splitting the drivetrain motors from the intake cut torque to each roller. The notebook is where we worked out the fix, drop most rollers to 900 for torque, leave the front intake at 1800 since it only ever pushes a ball that's already stuck.",
      },
      {
        type: "p",
        text: 'Record what you rejected too. We tested odometry pods on that same robot and wrote "weighed the pros and cons, decided against it." That one sentence is what stops someone from re-testing the same dead end two seasons from now.',
      },
      { type: "h2", text: "Team Memory" },
      {
        type: "p",
        text: "This season's mistake is next season's shortcut. A notebook only pays off if someone actually goes back and reads it.",
      },
      {
        type: "callout",
        kind: "flag",
        text: "The two real team-memory examples that go here are still placeholders in the manuscript and haven't been dropped in yet.",
      },
      {
        type: "p",
        text: "Neither fix was a new idea. Both were just someone flipping back a few months and reading what already happened.",
      },
      { type: "h2", text: "Structuring a Shared Deck" },
      {
        type: "p",
        text: "A shared slide deck doesn't stay chronological on its own, ours doesn't either. Some slides go up after every meeting, some only when something big changes, a few just sit there getting updated all season. Sort them on purpose or the deck turns into a scroll nobody can search.",
      },
      {
        type: "p",
        text: "Every slide gets a title, a name, and a date. That's the only rule that keeps a deck with six people writing in it searchable later.",
      },
      {
        type: "diagram",
        id: "notebook-entry-types",
        caption: "Three kinds of entry, colour coded so you can find the one you want months later.",
      },
      {
        type: "link",
        label: "Try the notebook template",
        href: "/guide/tools/notebook-template",
        description: "A fillable, exportable version of the notebook structure described here.",
      },
    ],
  },
  {
    number: 12,
    part: "iq",
    title: "Organizing Your Team",
    slug: "organizing-your-team",
    status: "ready",
    dek: "Start generalist, let specialists emerge.",
    blocks: [
      {
        type: "p",
        text: "Most of our team did everything, drove, built, coded, whatever the moment needed. A few people specialized in one area and mostly stayed there.",
      },
      {
        type: "p",
        text: "Start generalist, let specialists emerge. Early season, everyone should be able to build, drive, and code at a basic level. That's what lets a team of any size get a robot running fast. Specialists show up once someone's clearly better at one thing than the rest of the team, not before.",
      },
      {
        type: "diagram",
        id: "team-structure",
        caption: "Everyone can do most of the job. Specialists branch off it, they do not replace it.",
      },
      {
        type: "p",
        text: "A specialist isn't excused from the rest. Someone great at coding still helps on build night. Someone who's your best driver still knows how the notebook works. Specializing means you lead that area, not that you're the only one who touches it.",
      },
      {
        type: "takeaway",
        text: "Most of the team should be able to do most of the job. Let specialists earn their lane instead of assigning it on day one.",
      },
    ],
  },
  {
    number: 13,
    part: "iq",
    title: "Competition Day in VEX IQ",
    slug: "competition-day-in-vex-iq",
    status: "coming-soon",
    dek: "Not drafted yet, needs a real IQ competition-day story.",
    blocks: [],
  },
  {
    number: 14,
    part: "vrc",
    title: "The Jump to V5RC",
    slug: "the-jump-to-v5rc",
    status: "coming-soon",
    dek: "Not drafted yet.",
    blocks: [],
  },
  {
    number: 15,
    part: "vrc",
    title: "Advanced Drivetrains",
    slug: "advanced-drivetrains",
    status: "ready",
    dek: "Wheel size, gear ratio, and wheel placement. Nail these before anything else.",
    tools: ["gear-ratio"],
    blocks: [
      {
        type: "p",
        text: "Three choices define every drivetrain: wheel size, gear ratio, and wheel placement. Nail these before anything else on the robot.",
      },
      {
        type: "p",
        text: 'Wheel size sets your speed ceiling. Smaller wheels (2.75") spin faster for the same motor RPM. Larger wheels (4") cover more ground per rotation but need more torque to turn. Pick your target speed first, then let wheel size follow.',
      },
      {
        type: "diagram",
        id: "wheel-sizes",
        caption: "Same motor RPM, three different ground speeds. Bigger wheels also demand more torque to turn.",
      },
      {
        type: "p",
        text: "Gear ratio is where you actually tune speed vs. torque. Gear up (small driving gear, big driven gear) and you trade speed for torque. Gear down and you get the opposite. A well-known VEX Forum resource catalogs dozens of tested 6-motor gear layouts across wheel sizes, and its general rule of thumb is that drivetrain speeds under roughly 62 inches per second stay controllable on almost any build, while anything past 70 inches per second demands excellent driving and a very stiff robot to stay usable.",
      },
      {
        type: "diagram",
        id: "speed-reference",
        caption: "The two thresholds worth knowing before you pick a gear ratio.",
      },
      {
        type: "p",
        text: "Wheelbase length trades stability for turning speed. Short drivetrains turn fast and fit tight spaces but skid and tip more under load. Long drivetrains push harder and track straighter but turn slower and cost more gearing length.",
      },
      {
        type: "p",
        text: "Traction wheel placement sets your turning point, not your speed. Center a traction pair on an omni base and the robot pivots cleanly around that line. Full traction adds pushing power but fights every turn.",
      },
      {
        type: "realbuild",
        title: "High Stakes",
        text: "6-motor tank drive, 450 RPM, 8 wheels, 6 omni, 2 traction centered. 450 gave us the speed our field strategy needed, the centered traction pair gave us pushing power at the goal without killing our turning radius.",
      },
      {
        type: "diagram",
        id: "wheel-layout",
        caption: "Centre the traction pair and the robot pivots cleanly around that line instead of fighting every turn.",
      },
      {
        type: "realbuild",
        title: "Push Back",
        text: "6-motor drive, 320 RPM, 4\" wheels, all 4 wheels omni. This season has a barrier obstacle on the field, so we geared down for torque instead of top speed, full omni kept us mobile crossing it instead of fighting for traction on the ramp.",
      },
      {
        type: "takeaway",
        text: "Pick your speed range first, gear ratio and wheel size follow from that, not the reverse.",
      },
      {
        type: "link",
        label: "Try the gear ratio calculator",
        href: "/guide/tools/gear-ratio",
        description: "Model wheel size, gear ratio, and motor count together and see the tradeoff.",
      },
    ],
  },
  {
    number: 16,
    part: "vrc",
    title: "Lifts, 4-Bar, 6-Bar, and DR4B",
    slug: "lifts-4-bar-6-bar-dr4b",
    status: "ready",
    dek: "A research pass, not a build story. We haven't built one of these on 16688A yet.",
    blocks: [
      {
        type: "callout",
        kind: "flag",
        text: "We haven't built any of these on 16688A yet. This chapter is the research pass we'd run before committing to one, not a build story. Do the same homework before you cut metal.",
      },
      {
        type: "p",
        text: "A four-bar is two parallel bars moving together. The lifted end stays parallel to its mounting point through the whole range of motion, which is why it's the most common lift in VEX, simple to build, predictable to tune.",
      },
      {
        type: "diagram",
        id: "lift-types",
        caption:
          "Four lifts, four different trades. Height in a tight footprint, cascade. Weight centred while going nearly vertical, DR4B. Simple and reliable at mid-height, four-bar or six-bar.",
      },
      {
        type: "p",
        text: "A six-bar is a four-bar stretched taller. Same principle, longer arms, more reach. That extra length means more torque is needed to lift the arm, and creates more friction at the joint, plus more tipping risk under load. Still easier to build and maintain than a scissor lift.",
      },
      {
        type: "p",
        text: "A DR4B stacks two four-bars, one reversed. The second linkage mounts where the intake would normally sit and faces the opposite direction of the first, letting the whole lift rise almost straight up instead of forward-and-up, and keeps the load's weight centered over the robot instead of hanging out front. It's one of the more complicated lift designs in VEX competition, budget extra build and tuning time.",
      },
      {
        type: "p",
        text: "A cascade lift isn't a linkage at all. It's a lift that delivers a lot of height while taking up very little space, stages telescope out in sequence on string or chain instead of rigid bars. Completely different build and tuning problem than any bar lift.",
      },
      {
        type: "p",
        text: "Match the lift to the game, not the other way around. Height in a tight footprint, cascade. Keep weight centered while going nearly vertical, DR4B. Simple and reliable at mid-height, four-bar or six-bar.",
      },
      {
        type: "takeaway",
        text: "Every lift trades build complexity for height, weight distribution, or speed. Know the trade before you pick one.",
      },
    ],
  },
  {
    number: 17,
    part: "vrc",
    title: "Launchers, Catapults, Flywheels & Punchers",
    slug: "launchers-catapults-flywheels-punchers",
    status: "ready",
    dek: "A research pass, not a build story. We haven't built one of these ourselves yet.",
    blocks: [
      {
        type: "callout",
        kind: "flag",
        text: "Same approach here, research first. We haven't built a flywheel, catapult, or puncher ourselves yet, so this chapter is the starting map we'd use to pick one, not a proven build. Confirm what's here against a build video or two before you commit to a design.",
      },
      {
        type: "p",
        text: "A catapult stores energy in a swinging arm. The arm rotates, an object at the end gains momentum, then the arm stops abruptly, transferring that momentum into the game piece. High power per shot, but it has to reset between shots, so it fires slower than a flywheel.",
      },
      {
        type: "diagram",
        id: "launcher-types",
        caption: "Fire once and reload calmly, puncher or catapult. Fire constantly under time pressure, flywheel.",
      },
      {
        type: "p",
        text: "A flywheel stores energy in a spinning wheel. The wheel spins continuously, a game piece touches it and gets thrown by friction, no reload because the wheel never stops. Best for games that reward rapid, repeated scoring.",
      },
      {
        type: "p",
        text: "A puncher fires one stored-energy hit. Usually a slip gear or rubber bands storing tension, released in a single linear strike. Lighter and simpler than a catapult, shorter range, same single-shot-then-reload tradeoff, just built differently.",
      },
      {
        type: "p",
        text: "Match mechanism to reload demand, not raw power. Fire once and reload calmly, puncher or catapult. Fire constantly under time pressure, flywheel. Need range and accuracy, flywheel or catapult over puncher.",
      },
      {
        type: "takeaway",
        text: "Catapults and punchers hit hard once and reload, flywheels hit lighter but never stop.",
      },
    ],
  },
  {
    number: 18,
    part: "vrc",
    title: "Pneumatics (V5RC)",
    slug: "pneumatics-v5rc",
    status: "ready",
    dek: "How to wire a lot of functions off a small air budget.",
    blocks: [
      {
        type: "p",
        text: "Real practice, one or two air tanks covering dropdown arms, claws, PTOs, intake lifts, and arm joints every season. Here's how to actually wire that many functions off a small air budget.",
      },
      {
        type: "p",
        text: "One solenoid controls one double-acting cylinder, full stop. A stock V5 Pneumatics Kit ships with two double-acting solenoids, each with two output ports, A and B, extend and retract. Need more than two independently-timed functions, you buy more solenoids, there's no way around it.",
      },
      {
        type: "diagram",
        id: "solenoid-cylinder",
        caption: "Port A extends, port B retracts. Need more than two independently-timed functions and you buy more solenoids.",
      },
      {
        type: "p",
        text: "Mechanisms that always fire together can share one solenoid. A two-cylinder system links two solenoids through the supply line so air reaches both, tee the line off a single solenoid to two cylinders instead and they move in perfect sync, at the cost of never timing them separately. Use this for something like two claws that always open and close together.",
      },
      {
        type: "diagram",
        id: "tee-fitting",
        caption:
          "Tee one solenoid out to two cylinders and they move in perfect sync, at the cost of never timing them separately.",
      },
      {
        type: "p",
        text: "The tank feeds every solenoid off one shared supply line. Air runs from the tank through a regulator, then tees out to each solenoid's input port. Every solenoid draws from the same limited air budget, more functions on one tank means fewer full-power actuations of each before you're out of air.",
      },
      {
        type: "diagram",
        id: "pneumatic-system",
        caption: "One tank, one regulator, one shared supply line feeding every solenoid on the robot.",
      },
      {
        type: "p",
        text: 'Sort functions into "needs independent timing" and "can fire together" before buying solenoids. A dropdown arm and an intake lift probably fire at different moments, separate solenoids. A PTO engaging alongside a claw closing, if they\'re always simultaneous, can share one.',
      },
      {
        type: "callout",
        kind: "flag",
        text: "Which specific functions fire independently vs. together on our real robot still needs confirming.",
      },
      {
        type: "takeaway",
        text: "Solenoids are the real budget constraint, not tanks. Decide what needs to move independently before you wire anything.",
      },
    ],
  },
  {
    number: 19,
    part: "vrc",
    title: "Autonomous and Odometry",
    slug: "autonomous-and-odometry",
    status: "coming-soon",
    dek: "Not drafted yet.",
    blocks: [],
  },
  {
    number: 20,
    part: "vrc",
    title: "Advanced Scouting & Game Analysis",
    slug: "advanced-scouting-and-game-analysis",
    status: "ready",
    dek: "Scouting happens in two layers: before the event, and during it.",
    blocks: [
      { type: "p", text: "Scouting happens in two layers, before the event and during it." },
      {
        type: "diagram",
        id: "scouting-timeline",
        caption: "Everything worth knowing gets settled before you are standing at the field.",
      },
      {
        type: "p",
        text: "Before the event, check skills rankings and past results. VEX skills standings and each team's competition history are public. Look up a team before you meet them on the field, not after, so you already know if their skills score backs up how good they look in a match.",
      },
      {
        type: "link",
        label: "RobotEvents rankings",
        href: "https://www.robotevents.com/",
        description: "Public skills standings and event history, look a team up before you meet them on the field.",
      },
      {
        type: "p",
        text: "Apps built by other teams do this lookup for you. Teams have published free scouting apps that pull live rankings, skills standings, and match stats instead of you tracking it by hand, Robot Stats, VRC RoboScout, and GaelScout are examples on the App Store. Use one instead of building your own tracking system from scratch.",
      },
      {
        type: "p",
        text: "During the event, sync with your alliance partner before you're on the field, not during the queue. Find your partner 2-3 matches ahead. Enough time to actually plan instead of guessing at each other's robot mid-match.",
      },
      {
        type: "p",
        text: "Three things get decided in that conversation. Autonomous routines, so you don't collide or double up. General strategy, offense, defense, or split roles. Field side and which opposing team each of you presses, so you're not both chasing the same target.",
      },
      {
        type: "takeaway",
        text: "Skills rankings and scouting apps tell you who's good before you arrive, the pre-match sync tells you how to play with your partner once you're there.",
      },
    ],
  },
  {
    number: 21,
    part: "vrc",
    title: "Team Leadership",
    slug: "team-leadership",
    status: "coming-soon",
    dek: "Not drafted yet.",
    blocks: [],
  },
  {
    number: 22,
    part: "vrc",
    title: "Seasons from the Field (V5RC)",
    slug: "seasons-from-the-field-v5rc",
    status: "coming-soon",
    dek: "Not drafted yet.",
    blocks: [],
  },
  {
    number: 23,
    part: "back-matter",
    title: "Conclusion",
    slug: "conclusion",
    status: "coming-soon",
    dek: "Not drafted yet.",
    blocks: [],
  },
  {
    number: 24,
    part: "back-matter",
    title: "Appendix",
    slug: "appendix",
    status: "coming-soon",
    dek: "Not drafted yet.",
    blocks: [],
  },
];

export const partLabels: Record<string, string> = {
  iq: "Part I — VEX IQ Fundamentals",
  vrc: "Part II — V5RC Advanced",
  "back-matter": "Back Matter",
};

export function getChapter(slug: string) {
  return chapters.find((c) => c.slug === slug);
}

export function getAdjacentChapters(number: number) {
  const prev = chapters.find((c) => c.number === number - 1);
  const next = chapters.find((c) => c.number === number + 1);
  return { prev, next };
}
