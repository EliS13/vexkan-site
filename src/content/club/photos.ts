export type Photo = {
  src: string;
  /** Describes what is actually in the frame. Written from the photograph. */
  alt: string;
  /**
   * Only where the picture cannot say it itself. An award photograph does not
   * name the award, so those carry one; nothing else does.
   */
  caption?: string;
};

/**
 * Photographs are placed one at a time, in the shape that suits them.
 *
 * A single carousel at the top of a page is the one arrangement that shows a
 * visitor almost nothing: they see slide one and scroll past. So each page
 * mixes standing photographs, pairs and rows with a slideshow where there is
 * genuinely a run of similar pictures to hold.
 *
 * Every set below is disjoint. A photograph appears in exactly one place on
 * the site, so moving between pages always shows new pictures.
 */

/**
 * The founder's photo, used as the avatar on the About page.
 *
 * Anywhere else it may only appear inside a slideshow, never as a standing
 * photograph, a band or a program card. The club leads on its members.
 */
export const founderPhoto: Photo = {
  src: "/photos/all/img-3589.jpg",
  alt: "Eli Seeliger in a navy jacket outside the entrance to hall A1 at Mecha Mayhem.",
};

/* ---------------------------------------------------------------- Home --- */

/** Beside the headline. Five, so a visitor can actually reach the last one. */
export const homeHeroPhotos: Photo[] = [
  {
    src: "/photos/all/image-from-vexkan-robotics-club.jpg",
    alt: "Nine clubbers in club shirts holding their VEX IQ robots and controllers at the provincial championships, the match schedule projected on the wall behind them.",
  },
  {
    src: "/photos/all/191786394009-pic.jpg",
    alt: "Four clubbers in club shirts standing behind their V5 robot at their pit, under the team's banner.",
  },
  {
    src: "/photos/all/heif-to-jpg-vexkan-robotics-club.jpg",
    alt: "Two students lifting a V5 robot onto a table in the bright atrium of a competition venue.",
  },
  {
    src: "/photos/all/101786393305-pic.jpg",
    alt: "A row of clubbers standing along the barrier at a competition, watching a VEX IQ match on the screen above the field.",
  },
];

/** A wide photograph between the guides and the programs. A change of pace. */
export const homeBandPhoto: Photo = {
  src: "/photos/all/vexkan-robotics-club-image-1-copy.jpg",
  alt: "Two students shaking hands across a VEX IQ Rapid Relay field at the World Championship while another sets his robot down on the tiles.",
};

/**
 * Under the three tracks, and read as belonging to them: this row sits
 * directly beneath the Foundation, IQ Competition and V5RC columns, so the
 * kit in each photograph has to match the column above it. An IQ chassis
 * under the V5RC heading reads as a mistake, because it is one.
 */
export const homeClassPhotos: Photo[] = [
  {
    src: "/photos/all/vexkan-robotics-club-img-8014.jpg",
    alt: "Two young clubbers building at a table, with VEX IQ beams sorted into rows and a parts sheet open beside them.",
  },
  {
    src: "/photos/all/image-from-vexkan-robotics-club-1.jpg",
    alt: "Clubbers standing together in a classroom holding their robot brains and controllers.",
  },
  {
    src: "/photos/all/181786393737-pic.jpg",
    alt: "A metal V5 robot on the pit table beside the team's VEX award, Canadian flags strung across the booth behind it.",
  },
];

/** Small, on the dark band, alongside the World Championship placings. */
export const homeWorldsPhotos: Photo[] = [
  {
    src: "/photos/all/221786394014-pic.jpg",
    alt: "A group of clubbers standing together on the competition floor while someone photographs them, one holding the team's robot.",
  },
  {
    src: "/photos/all/121786393310-pic.jpg",
    alt: "The screen above a World Championship field during a VEX IQ qualification match.",
  },
  {
    src: "/photos/all/231786394016-pic.jpg",
    alt: "The team's Blue See 123 banner hanging at the back of their pit, with Canadian flags strung across it.",
  },
];

/* ------------------------------------------------------------ Programs --- */

/** Under the programs heading: a class in session. */
export const programsHeroPhoto: Photo = {
  src: "/photos/all/vexkan-robotics-club-image-7934.jpg",
  alt: "Three young clubbers around a classroom table, one driving a VEX IQ robot with a controller while another steadies it and a third sorts parts.",
};

/**
 * One photograph per program, on its card and again at the top of its own
 * page: someone building, or the robot that program competes with.
 */
export const programPhotos: Record<string, Photo> = {
  "vex-iq-foundation": {
    src: "/photos/all/vexkan-robotics-club-img-8016.jpg",
    alt: "A young clubber holding up the VEX IQ robot he has just built, wheels and a controller on the table in front of him.",
  },
  "vex-iq-competition-es": {
    src: "/photos/all/image-from-vexkan-robotics-club-3.jpg",
    alt: "Three clubbers in club shirts holding their VEX IQ robot and a controller under the upcoming-matches screen at the provincial championships.",
  },
  "vex-iq-competition-ms": {
    src: "/photos/all/161786393696-pic.jpg",
    alt: "Four clubbers at their pit at a championship, holding up their VEX IQ robot in front of the team's banner.",
  },
  "v5rc-competition": {
    src: "/photos/all/81786393255-pic.jpg",
    alt: "Four clubbers standing behind their V5 robot and its award at the team's pit, Canadian flags strung across the booth.",
  },
};

/** Lower on the programs page: the build itself, which is most of the work. */
export const workshopPhotos: Photo[] = [
  {
    src: "/photos/all/vexkan-robotics-club-img-8060.jpg",
    alt: "A young girl fitting a beam onto a VEX IQ frame at a table spread with parts.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-img-8015.jpg",
    alt: "A clubber assembling a VEX IQ chassis at a workbench, a pair of pliers on the table beside him.",
  },
  {
    src: "/photos/all/heif-to-jpg-image.jpg",
    alt: "Two students at a table going over a V5 robot together, with a scoring sheet and a club pen in front of them.",
  },
  {
    src: "/photos/all/wechatimg24.jpg",
    alt: "A VEX IQ chassis seen from above on the bench, motors and brain mounted inside the frame.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-img-8061.jpg",
    alt: "Two clubbers kneeling on a VEX IQ field mat, building a robot on the tiles.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-image-2-copy.jpg",
    alt: "A clubber leaning in close to check a half-built VEX IQ robot on the table in front of him.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-pic.jpg",
    alt: "A close-up of a clubber's hand holding a game ball against the arm of a VEX IQ robot.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-image-1.jpg",
    alt: "Two young clubbers at a VEX IQ field, one lowering a green robot onto the tiles while another works the controller.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-image-3.jpg",
    alt: "Young clubbers standing behind a VEX IQ field holding up their kit boxes and instruction books, their finished robots on the tiles.",
  },
];

/* -------------------------------------------------------------- Events --- */

/** Under the events heading: a field mid-match. */
export const eventsHeroPhoto: Photo = {
  src: "/photos/all/vexkan-robotics-club-image-copy.jpg",
  alt: "A VEX IQ field at the World Championship with drivers on all four sides and a referee watching the match.",
};

/** Beside the paragraph about what a competition day is actually like. */
export const pitPhoto: Photo = {
  src: "/photos/all/211786394013-pic.jpg",
  alt: "The pit hall at the World Championship, a clubber working at the team's booth under the Engineering sign with team banners down the row.",
};

/**
 * A photograph of the team with what it won, shown on that team's panel.
 *
 * Only where the team number is legible in the photograph itself. Putting the
 * wrong team's faces next to an award is exactly the kind of mistake nobody
 * outside the club would catch, so a photograph that cannot be checked does
 * not go here.
 */
export const teamAwardPhotos: Record<string, Photo> = {
  /* Team number on the robot's plate. */
  "16688A": {
    src: "/photos/all/wechatimg25.jpg",
    alt: "The four members of 16688A standing behind their V5 robot and its awards, the team number on the robot's plate.",
  },
  /*
   * The certificates name the teams outright: "Think Award, Team 565A" and
   * "Energy Award, Team 595B", both from the January Showdown, both in the
   * record. 595B keeps its own photograph below, so clicking between the two
   * teams does not show the same picture twice.
   */
  "565A": {
    src: "/photos/all/vexkan-robotics-club-1.jpg",
    alt: "Members of 565A and 595B together after the January Showdown, holding the Think Award and Energy Award certificates.",
  },
  /* Team number on the robot's plate, and the award matches the record. */
  "595B": {
    src: "/photos/all/image-from-vexkan-robotics-club-2.jpg",
    alt: "Three members of 595B in club shirts, one holding their VEX IQ robot, one a controller and one the Judges Award trophy.",
  },
  /*
   * No number in frame, but the award in it is unique in the record: the
   * Excellence banner and the Robot Skills trophy are both from the Alberta
   * Mix and Match provincials, and 595Y is the only team that won both there.
   */
  "595Y": {
    src: "/photos/all/image-from-vexkan-robotics-club-5.jpg",
    alt: "Members of 595Y holding up the Excellence Award banner from the Alberta provincial championship, with the Robot Skills Champion trophy.",
  },
  /* Design Award at the Alberta Mix and Match provincials, won only by 595C. */
  "595C": {
    src: "/photos/all/image-from-vexkan-robotics-club-4.jpg",
    alt: "Three members of 595C with their VEX IQ robot and the Design Award trophy at the Alberta provincial championships.",
  },
  /*
   * The trophy reads Middle School Judges Award, VEX V5, Alberta Provincial
   * Championship, which matches exactly one row in the record.
   */
  "36467E": {
    src: "/photos/all/img-3767.jpg",
    alt: "A member of 36467E holding the Middle School Judges Award from the Alberta V5 provincial championship, the club's other trophies on the shelf behind.",
  },
};

/** Awards. The only photographs on the site that carry a caption. */
export const awardPhotos: Photo[] = [
  /*
   * Both certificates name their team and award outright, so these two are
   * captioned from what is printed in the frame rather than from memory.
   */
  {
    src: "/photos/all/vexkan-595c-teamwork-champion.jpg",
    alt: "Three members of 595C in club shirts at the front of the room, the middle one holding up their Teamwork Champion certificate while a coach stands to one side.",
    caption: "Teamwork Champion, 595C",
  },
  {
    src: "/photos/all/vexkan-595b-innovate-award.jpg",
    alt: "Three young members of 595B standing together in club shirts, the one in front holding their Innovate Award certificate, with the VEX IQ field in the foreground.",
    caption: "Innovate Award, 595B",
  },
  {
    src: "/photos/all/vexkan-robotics-club-edit-site-1.jpg",
    alt: "Three young clubbers holding up their certificates after a summer camp competition.",
    caption: "Judges Award, summer camp",
  },
  {
    src: "/photos/all/vexkan-robotics-club-image.jpg",
    alt: "Young clubbers holding gold trophies and certificates above their heads at the end of a summer camp.",
    caption: "Summer camp awards",
  },
  {
    src: "/photos/all/171786393714-pic.jpg",
    alt: "Four clubbers at their pit holding up the VEX IQ robot they compete with.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-image-2.jpg",
    alt: "Clubbers lined up along the field barrier at a competition, one pulling on a pair of safety glasses.",
  },
];

/* ----------------------------------------------------------- Community --- */

/**
 * The community page, where the club is teaching rather than competing.
 *
 * An older clubber steadying a build for a younger one is the whole argument
 * of that page in one frame, which is why it leads there rather than a
 * competition photograph.
 */
export const communityPhoto: Photo = {
  src: "/photos/all/vexkan-robotics-club-img-8018.jpg",
  alt: "An older clubber leaning over a table to help a younger student fit a grey beam onto the blue VEX IQ frame she is holding, parts and a build guide spread out in front of them.",
};

/* ------------------------------------------------------- Where we compete --- */

/**
 * The competition ladder section. One standing photograph, then the day around
 * it.
 *
 * Nearly all of these are 36467E at Mecha Mayhem in Calgary, which is what a
 * qualifying weekend actually looks like: a pit with your team's name over it,
 * a lot of standing at the barrier, and other clubs' students in every frame.
 * The other teams are the point — an event is a room full of them rather than a
 * stage for ours — so they are not cropped out.
 */
export const competePhoto: Photo = {
  src: "/photos/all/img-3550.jpg",
  alt: "Drivers from three teams lined up along the barrier of a V5 field, 36467E's robot on the tiles in front of them and their alliance partners' robots being set down alongside.",
};

export const competePhotos: Photo[] = [
  {
    src: "/photos/all/img-3533.jpg",
    alt: "Three clubbers and a mentor standing around 36467E's robot in its case, under the pit sign reading 36467E, All Purpose Flour, VexKan Robotics Club, Calgary.",
  },
  {
    src: "/photos/all/img-3576.jpg",
    alt: "A clubber fitting the 36467E number plate onto the team's metal V5 robot at the pit table, while another watches from across the bench.",
  },
  {
    src: "/photos/all/img-3541.jpg",
    alt: "Three drive team members standing at the field wall in team jerseys, watching 36467E's robot and an opposing robot on the tiles below.",
  },
  {
    src: "/photos/all/img-3551.jpg",
    alt: "A 36467E driver holding a controller at the edge of the field, drive teams from two other clubs lined up along the wall beside him.",
  },
  {
    src: "/photos/all/img-3584.jpg",
    alt: "Drive teams from several clubs standing together in safety glasses, waiting for a match to be called.",
  },
  {
    src: "/photos/all/img-3561.jpg",
    alt: "A clubber from 36467E talking with a driver from another club between matches, both wearing event lanyards, the field behind them.",
  },
  {
    src: "/photos/all/img-3562.jpg",
    alt: "Two drive team members standing on the field wall looking down at the tiles, the rest of the competition hall and other clubs' pits stretching out behind.",
  },
  {
    src: "/photos/all/img-3560.jpg",
    alt: "Two students from different clubs standing side by side in the hall, drive team badges hanging around their necks.",
  },
  {
    src: "/photos/all/img-3558.jpg",
    alt: "A clubber standing with two adults, one of them an event official, under the 36467E pit sign.",
  },
];

/**
 * Practice, which is where nearly all of the season actually happens: a field
 * on the floor at home rather than a competition venue.
 *
 * Robots and hands rather than faces. A portrait in this set pulls the whole
 * run toward being about one person, which is the opposite of the point.
 */
export const practicePhotos: Photo[] = [
  {
    src: "/photos/all/img-3782.jpg",
    alt: "Four clubbers around a VEX field laid out on the floor of a front room, two robots and several game balls on the tiles, one of them driving.",
  },
  {
    src: "/photos/all/img-3622.jpg",
    alt: "A clubber holding a stack of blue game rings on the robot's lift, checking how the mechanism holds them.",
  },
  {
    src: "/photos/all/vexkan-practice-field-floor.jpg",
    alt: "Two clubbers at a VEX IQ field laid out on the floor of the club room, one standing with the controller and the other kneeling at the edge of the tiles watching the robot.",
  },
];

/**
 * A competition day, from the parts of it that are not the match.
 *
 * Three of these are other clubs' students as much as ours — the drivers along
 * the barrier, the queue at the inspection table. That is deliberate: an event
 * is a room full of teams, and photographs that crop everyone else out say the
 * opposite.
 */
export const competitionDayPhotos: Photo[] = [
  {
    src: "/photos/all/vexkan-inspection-table.jpg",
    alt: "A referee seated at the inspection table measuring a V5 robot against the sizing tool while three students stand around the table waiting.",
    caption: "Inspection, before a robot is allowed to play",
  },
  {
    src: "/photos/all/mecha-mayhem-drivers-waiting.jpg",
    alt: "Drivers from several teams standing shoulder to shoulder along the field barrier in a darkened hall, watching the match in front of them.",
    caption: "Waiting on the match ahead of yours",
  },
  {
    src: "/photos/all/mecha-mayhem-36467e-drivers.jpg",
    alt: "Three young drivers in safety glasses at the field barrier, one holding a controller, with 36467E's robot on the table behind them and an emcee with a microphone to one side.",
    caption: "36467E at the field, Mecha Mayhem",
  },
  {
    src: "/photos/all/mecha-mayhem-driver-focus.jpg",
    alt: "A driver in safety glasses and a competition lanyard watching the field intently, controller held low, the hall dark behind him.",
    caption: "The last few seconds of a match",
  },
];

/* --------------------------------------------------------------- About --- */

/** The club as it usually is: a practice field, not a competition venue. */
export const aboutTablePhoto: Photo = {
  src: "/photos/all/141786393579-pic.jpg",
  alt: "Three clubbers at a table with a VEX IQ practice field and a laptop in front of them, one of them holding a game ball.",
};

/** The World Championship, which is the far end of the same club. */
export const worldsPhotos: Photo[] = [
  {
    src: "/photos/all/151786393676-pic.jpg",
    alt: "Seven clubbers standing together under the 2026 VEX Robotics World Championship screen in the Research Division.",
  },
  {
    src: "/photos/all/91786393303-pic.jpg",
    alt: "Clubbers and families standing together in front of the World Championship screen at the end of the event.",
  },
  {
    src: "/photos/all/vexkan-robotics-club.jpg",
    alt: "Six clubbers standing in front of the Innovate banner on the World Championship floor.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-img-2128.jpg",
    alt: "The lit entrance arch to the VEX Robotics World Championship, with people walking through into the hall.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-image-2100.jpg",
    alt: "The arena at the World Championship, filled to the upper tiers for the opening ceremony.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-img-2065.jpg",
    alt: "A young clubber crouched in front of a large VEX Robotics sign in the concourse at the World Championship.",
  },
  {
    src: "/photos/all/111786393307-pic.jpg",
    alt: "The screen above a World Championship field during a VEX IQ practice match, drivers standing around the field below.",
  },
  /*
   * The scale of the thing, from a seat in it. The stage photographs are of
   * the ceremony rather than of our teams — the division being announced in
   * the last one is another club's — so nothing here is captioned as ours.
   */
  {
    src: "/photos/all/worlds-arena-crowd.jpg",
    alt: "The arena at the World Championship seen from the floor seats, every tier filled with teams in their own colours.",
  },
  {
    src: "/photos/all/worlds-opening-ceremony.jpg",
    alt: "The opening ceremony, with China's name and flag filling the screen behind the stage as that country's teams are welcomed in.",
  },
  {
    src: "/photos/all/worlds-division-stage.jpg",
    alt: "A division awards ceremony under way, the winning teams on stage and their team numbers listed on the screens either side.",
  },
];

/**
 * The rest of a World Championship: the pit, the queue, the walk between halls,
 * and the meals.
 *
 * A separate set from `worldsPhotos` because it is a different argument. That
 * one is the scale of the event; this one is the week our teams actually had,
 * most of which was not spent on a field.
 */
export const worldsWeekPhotos: Photo[] = [
  {
    src: "/photos/all/worlds-595y-pit.jpg",
    alt: "The four members of 595Y behind their pit table under the Croissants banner, one holding up the robot with 595Y written on its plate and another giving a thumbs up.",
  },
  {
    src: "/photos/all/worlds-croissants-pit-crowd.jpg",
    alt: "595Y's pit seen from above, Canadian flags and streamers strung across it and a queue of students from other teams crowded around the table to see the robot.",
  },
  {
    src: "/photos/all/worlds-pit-rebuild.jpg",
    alt: "Three clubbers rebuilding a robot on a table in the concourse, one leaning right over it to reach a part while the other two talk through what to do next.",
  },
  {
    src: "/photos/all/worlds-iq-field-trophies.jpg",
    alt: "Clubbers waiting beside a VEX IQ field while a referee sets up, a row of Middle School World Championship division trophies laid out on the table behind them.",
  },
  {
    src: "/photos/all/worlds-iq-field-talking.jpg",
    alt: "Three clubbers standing at the edge of a VEX IQ field between matches, talking through the next one with their robot already on the tiles.",
  },
  {
    src: "/photos/all/worlds-concourse-wagon.jpg",
    alt: "Three clubbers crossing the empty concourse of the convention centre, pulling the wagon that carries the robot and the toolkit between halls.",
  },
  {
    src: "/photos/all/worlds-lobby-robot.jpg",
    alt: "Clubbers gathered in the venue lobby, one holding a VEX IQ robot up to show the others, another wearing a lanyard covered in traded team pins.",
  },
  {
    src: "/photos/all/worlds-vex-logo.jpg",
    alt: "Three clubbers standing together in front of the large lit VEX Robotics sculpture on the competition floor.",
  },
  {
    src: "/photos/all/worlds-team-lunch.jpg",
    alt: "Two clubbers at a table covered in foil takeaway containers, one giving a thumbs up mid-meal.",
  },
  {
    src: "/photos/all/worlds-team-dinner.jpg",
    alt: "Six clubbers around a restaurant table sharing plates of sushi at the end of a competition day.",
  },
];

/* ----------------------------------------------------------- Club space --- */

/**
 * The club itself, away from any competition. Most of a season looks like this
 * rather than like an arena.
 */
export const clubSpacePhotos: Photo[] = [
  {
    src: "/photos/all/build-session-home.jpg",
    alt: "Four clubbers around a table at a build session, a part-built VEX IQ robot and sorted parts in front of them and the session's date written on the whiteboard behind.",
  },
  {
    src: "/photos/all/club-space-main-field.jpg",
    alt: "Five clubbers standing together in the club's practice space in front of the screen that shows the main field.",
  },
  {
    src: "/photos/all/iq-robot-three-clubbers.jpg",
    alt: "Three clubbers holding up the VEX IQ robot they have just finished, its motors and cabling visible along the front of the chassis.",
  },
];

/**
 * 595Y with the Design Award at the Alberta provincial championships, the
 * upcoming-matches screen still up behind them.
 *
 * The trophy names the award and the season, and the screen names the event, so
 * this is one of the few photographs that can be captioned without guessing.
 */
/**
 * Certificates and trophies where the photograph itself names the team and the
 * award, so the caption is read off the paper rather than guessed.
 *
 * Every one of these matches a row in `awards`. A photograph whose certificate
 * cannot be read does not go in here, because a caption crediting the wrong
 * team is the one mistake nobody outside the club would ever catch.
 */
export const certificatePhotos: Photo[] = [
  {
    src: "/photos/all/img-3173.jpg",
    alt: "Four young members of 595B at the January Showdown, one holding the Energy Award certificate, the match schedule on the screen behind them.",
    caption: "Energy Award, 595B",
  },
  {
    src: "/photos/all/img-3177.jpg",
    alt: "Three members of 565A holding the Think Award certificate in front of the finals rankings screen at the January Showdown.",
    caption: "Think Award, 565A",
  },
  {
    src: "/photos/all/img-3390.jpg",
    alt: "Three members of 595C with their VEX IQ trophies and a Teamwork Champion certificate lined up on the table in front of them.",
    caption: "Teamwork Champion, 595C",
  },
  {
    src: "/photos/all/img-3858.jpg",
    alt: "Three young clubbers holding a VEX IQ Competition trophy in front of the Mecha Mayhem backdrop, a shelf of the event's other trophies above them.",
    caption: "Mecha Mayhem",
  },
];

/**
 * Mecha Mayhem, the Signature Event in Calgary, and the club's own bench.
 *
 * Photographs of teams waiting, watching and building rather than winning:
 * the part of a competition weekend that the award photographs leave out.
 */
export const eventFloorPhotos: Photo[] = [
  {
    src: "/photos/all/img-3564.jpg",
    alt: "Two drive team members standing up on the field barrier at Mecha Mayhem, looking down at the field while other teams work at the pits behind them.",
  },
  {
    src: "/photos/all/0bo4k-v208r.jpg",
    alt: "36467E's pit at Mecha Mayhem, the team's V5 robot up on the table with its toolkit open beside it.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-img-2120.jpg",
    alt: "A V5 robot on the pit table, its drivetrain and intake visible from the side.",
  },
  {
    src: "/photos/all/img-3750.jpg",
    alt: "A clubber at the kitchen table building the lift on a V5 robot, an earlier robot on the shelf behind him.",
  },
];

export const designAwardPhoto: Photo = {
  src: "/photos/all/provincials-595y-design-award.jpg",
  alt: "Three members of 595Y at the Alberta Mix and Match provincial championships, one holding the VEX IQ Design Award trophy and another holding the team's robot, the upcoming-matches screen projected on the wall behind them.",
  caption: "Design Award, Alberta provincial championships",
};
