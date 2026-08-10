export type Photo = {
  src: string;
  /** Describes what is actually in the frame. Written from the photograph. */
  alt: string;
  caption?: string;
};

/**
 * The founder's own photo, used once on the About page and nowhere else.
 *
 * Every other slideshow leads on the wider club. A club site should show its
 * members rather than the person who runs it, which is the club's own call.
 */
export const founderPhoto: Photo = {
  src: "/photos/IMG_3589.jpg",
  alt: "A student in a navy jacket outside the entrance to hall A1, with a Mecha Mayhem banner on the doors behind him.",
  caption: "At Mecha Mayhem",
};

/** Practice, and the club's own field at home. */
export const buildPhotos: Photo[] = [
  {
    src: "/photos/iq_IMG_3782.jpg",
    alt: "Four club members around a practice field laid out on a living room floor, two of them driving robots while the others watch the match.",
    caption: "Practice on the home field",
  },
  {
    src: "/photos/IMG_3576.jpg",
    alt: "A student holding a stack of blue VEX rings on a robot's lift arm while checking how it sits.",
    caption: "Testing a lift",
  },
];

/** The pits and the field. What a competition day actually looks like. */
export const competitionPhotos: Photo[] = [
  {
    src: "/photos/IMG_3541.jpg",
    alt: "Three students in team jerseys standing at the edge of a competition field, watching two V5 robots line up before a match.",
    caption: "Waiting for the match to start",
  },
  {
    src: "/photos/IMG_3562.jpg",
    alt: "Two students working on team 36467E's robot in the pits, one holding the team number plate while the other steadies the frame.",
    caption: "Pit work between matches",
  },
  {
    src: "/photos/IMG_3564.jpg",
    alt: "Two students in team lanyards standing at the field wall during a match, with other teams' pits behind them.",
    caption: "Watching the field",
  },
];

/** Meeting other clubs, judges and volunteers. */
export const communityPhotos: Photo[] = [
  {
    src: "/photos/IMG_3558.jpg",
    alt: "A student holding a controller at the driver station beside students from two other teams and an event volunteer.",
    caption: "At the driver station with other teams",
  },
];

/**
 * The home page rotation. Deliberately weighted to the wider club rather than
 * any one member.
 */
export const homePhotos: Photo[] = [
  buildPhotos[0],
  competitionPhotos[0],
  communityPhotos[0],
  competitionPhotos[1],
  buildPhotos[1],
];

export const programPhotos: Photo[] = [buildPhotos[0], buildPhotos[1], competitionPhotos[1]];

export const eventPhotos: Photo[] = [
  competitionPhotos[0],
  communityPhotos[0],
  competitionPhotos[2],
];
