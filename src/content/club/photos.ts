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

/** Under the awards, from the day rather than the ceremony. */
export const recognitionPhotos: Photo[] = [
  {
    src: "/photos/all/201786394011-pic.jpg",
    alt: "Clubbers and volunteers around a pit table at the World Championship, working through a binder under a string of Canadian flags.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-image-2.jpg",
    alt: "Clubbers waiting in the lobby at a competition, one pulling on a pair of safety glasses.",
  },
];

/** Awards. The only photographs on the site that carry a caption. */
export const awardPhotos: Photo[] = [
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
    src: "/photos/all/vexkan-robotics-club-1.jpg",
    alt: "A group of young clubbers holding certificates in a hall, with older clubbers and parents standing behind them.",
  },
  {
    src: "/photos/all/171786393714-pic.jpg",
    alt: "Four clubbers at their pit holding up the VEX IQ robot they compete with.",
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
];
