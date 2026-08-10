export type Photo = {
  src: string;
  /** Describes what is actually in the frame. Written from the photograph. */
  alt: string;
  caption?: string;
};

/**
 * The founder's photo, used once on the About page and nowhere else.
 *
 * Every slideshow leads on the club's members. That is the club's own call: a
 * site about helping other people should show the people being helped.
 */
export const founderPhoto: Photo = {
  src: "/photos/IMG_3589.jpg",
  alt: "A student in a navy jacket outside the entrance to hall A1, with a Mecha Mayhem banner on the doors behind him.",
  caption: "At Mecha Mayhem",
};

/**
 * The club's teams with what they won. These lead everywhere, because they are
 * the clearest answer to what the club is for.
 */
export const teamPhotos: Photo[] = [
  {
    src: "/photos/iq_IMG_3390.jpg",
    alt: "Four members of team 595C in VexKan club shirts, three holding VEX IQ trophies and one holding a Teamwork Champion certificate, with their robot held up beside them.",
    caption: "595C, Teamwork Champion",
  },
  {
    src: "/photos/iq_IMG_3177.jpg",
    alt: "Three young clubbers from team 565A holding their Think Award certificate in front of the finals rankings screen.",
    caption: "565A, Think Award",
  },
  {
    src: "/photos/iq_IMG_3173.jpg",
    alt: "Four young clubbers from team 595B standing together with their Energy Award certificate, the match results screen behind them.",
    caption: "595B, Energy Award",
  },
  {
    src: "/photos/iq_IMG_3858.jpg",
    alt: "Three young clubbers holding a VEX IQ trophy together in front of the Mecha Mayhem backdrop.",
    caption: "A trophy at Mecha Mayhem",
  },
];

/** Practice, and the club's own field at home. */
export const buildPhotos: Photo[] = [
  {
    src: "/photos/iq_IMG_3782.jpg",
    alt: "Four club members around a practice field laid out on a living room floor, two of them driving robots while the others watch the match.",
    caption: "Practice on the home field",
  },
  {
    src: "/photos/iq_IMG_3768.jpg",
    alt: "A VEX IQ robot built from blue, green, yellow and red plastic beams, with gears and a chain drive down one side.",
    caption: "A VEX IQ build, part way through",
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
 * The home rotation. Teams and their awards first, practice next, and only then
 * anything from the senior side.
 */
export const homePhotos: Photo[] = [
  teamPhotos[0],
  teamPhotos[1],
  buildPhotos[0],
  teamPhotos[2],
  teamPhotos[3],
  buildPhotos[1],
];

export const programPhotos: Photo[] = [
  buildPhotos[0],
  teamPhotos[1],
  buildPhotos[1],
  teamPhotos[3],
];

export const eventPhotos: Photo[] = [
  teamPhotos[0],
  teamPhotos[2],
  competitionPhotos[0],
  communityPhotos[0],
];
