export type Photo = {
  src: string;
  /** Describes what is actually in the frame, for anyone who cannot see it. */
  alt: string;
  /** Shown under the slide. Kept short, and never repeats the alt text. */
  caption: string;
};

/**
 * Photographs from the club's own seasons, mostly team 36467E at the Mecha
 * Mayhem Signature Event in Calgary.
 *
 * Alt text describes the frame rather than summarising the club, because a
 * reader using a screen reader is owed the picture, not the pitch. Nothing here
 * names a child: these are minors, and the site has no reason to identify them.
 */

/**
 * The founder's own photo, used once on the About page. Everywhere else the
 * slideshows favour group shots of the wider club, since a club site should
 * show the members rather than the person who runs it.
 */
export const founderPhoto: Photo = {
  src: "/photos/IMG_3589.jpg",
  alt: "A student in a blue jacket outside the entrance to hall A1, with a Mecha Mayhem banner on the doors behind.",
  caption: "Outside the venue at Mecha Mayhem",
};

/** The pits and the field. What competing actually looks like. */
export const competitionPhotos: Photo[] = [
  {
    src: "/photos/IMG_3541.jpg",
    alt: "Three students in safety glasses standing at the field wall watching a match, with the 36467E robot and an alliance robot among red and blue rings.",
    caption: "Watching an alliance partner run",
  },
  {
    src: "/photos/IMG_3533.jpg",
    alt: "An adult mentor talking with three students around the 36467E robot in the pit, under the team's sign reading All Purpose Flour, VexKan Robotics Club.",
    caption: "Working a problem out in the pit",
  },
  {
    src: "/photos/IMG_3584.jpg",
    alt: "Four students in team lanyards standing together beside the field, waiting for a match to start.",
    caption: "Waiting on the match ahead",
  },
  {
    src: "/photos/IMG_3550.jpg",
    alt: "A student with safety glasses pushed up on their head holding a controller at the field, with two other teams' drivers alongside.",
    caption: "Queued up with the other alliance",
  },
  {
    src: "/photos/IMG_3551.jpg",
    alt: "A student holding a VEX controller at the edge of the competition field, with the 36467E robot and an opposing robot on the field and a referee standing behind.",
    caption: "Driving at the field",
  },
  {
    src: "/photos/IMG_3576.jpg",
    alt: "A student in a VexKan hoodie fitting the 36467E licence plate onto a metal V5 robot in the team pit, with another student watching from across the table.",
    caption: "Last checks in the pit before a match",
  },
  {
    src: "/photos/IMG_3562.jpg",
    alt: "Two students from different teams standing at the field wall, one pointing at something on the field.",
    caption: "Reading the field together",
  },
  {
    src: "/photos/IMG_3564.jpg",
    alt: "Two students in team hoodies standing side by side at the competition, one from 36467E and one from another club.",
    caption: "Between matches",
  },
];

/** Meeting other teams and the wider VEX community. */
export const communityPhotos: Photo[] = [
  {
    src: "/photos/IMG_3558.jpg",
    alt: "Three people standing under the 36467E pit sign: a mentor, a REC Foundation representative in a branded shirt, and a student in a team lanyard.",
    caption: "Talking with a REC Foundation representative at the event",
  },
  {
    src: "/photos/IMG_3561.jpg",
    alt: "Two students from different clubs talking beside the field, one wearing a 9568V lanyard and one wearing 36467E.",
    caption: "Comparing notes with another club",
  },
  {
    src: "/photos/IMG_3560.jpg",
    alt: "Two students standing together in the competition hall, both wearing drive team passes.",
    caption: "Drive teams before a match",
  },
  {
    src: "/photos/IMG_3589.jpg",
    alt: "A student in a blue jacket at the entrance to hall A1, with a Mecha Mayhem banner on the doors behind.",
    caption: "Arriving at the venue",
  },
  {
    src: "/photos/IMG_3590.jpg",
    alt: "A student wheeling a robot case and equipment through the venue concourse towards the hall A1 entrance.",
    caption: "Hauling the robot in",
  },
];

/** Building, away from any competition. */
export const buildPhotos: Photo[] = [
  {
    src: "/photos/IMG_3622.jpg",
    alt: "A student leaning in close to adjust a VEX IQ robot that is holding a stack of blue foam rings, on a practice field at home.",
    caption: "Practising a stack at home",
  },
];

/** The home page mixes all three, so the first thing a visitor sees is the work. */
export const homePhotos: Photo[] = [
  competitionPhotos.find((p) => p.src.includes("IMG_3541"))!,
  competitionPhotos.find((p) => p.src.includes("IMG_3533"))!,
  competitionPhotos.find((p) => p.src.includes("IMG_3584"))!,
  competitionPhotos.find((p) => p.src.includes("IMG_3550"))!,
  communityPhotos.find((p) => p.src.includes("IMG_3558"))!,
];
