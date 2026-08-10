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
 * Every set below is disjoint. A photograph appears on exactly one page, so
 * moving between tabs shows new pictures rather than the same ones again.
 */

/** Home: who the club is, and what its teams have won. */
export const homePhotos: Photo[] = [
  {
    src: "/photos/club/club-25.jpg",
    alt: "Three young clubbers around a classroom table, one driving a VEX IQ robot with a controller while another steadies it and a third sorts parts.",
    caption: "A foundation class in session",
  },
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
    src: "/photos/iq_IMG_3782.jpg",
    alt: "Four club members around a practice field laid out on a living room floor, two of them driving robots while the others watch the match.",
    caption: "Practice on the home field",
  },
];

/** Programs: what a class actually looks like, and what gets built in one. */
export const programPhotos: Photo[] = [
  {
    src: "/photos/club/club-18.jpg",
    alt: "A young girl fitting a beam onto a VEX IQ frame at a table spread with parts, working on her own build.",
    caption: "Building a first frame",
  },
  {
    src: "/photos/club/club-14.jpg",
    alt: "Two young clubbers building at a table with VEX IQ beams laid out in front of them and an instruction sheet open beside the parts.",
    caption: "Sorting parts before a build",
  },
  {
    src: "/photos/club/club-01.jpg",
    alt: "Two students sitting at a table going over a V5 robot together, with a scoring sheet and a VexKan Robotics Club pen in front of them.",
    caption: "Going over a build together",
  },
  {
    src: "/photos/iq_IMG_3768.jpg",
    alt: "A VEX IQ robot built from blue, green, yellow and red plastic beams, with gears and a chain drive down one side.",
    caption: "A finished robot",
  },
  {
    src: "/photos/IMG_3576.jpg",
    alt: "A student in the pits at Mecha Mayhem holding a stack of blue VEX rings on a robot's lift arm, checking how it sits.",
    caption: "In the pits at Mecha Mayhem",
  },
];

/** Results: competition days, from the pits to the trophy. */
export const eventPhotos: Photo[] = [
  {
    src: "/photos/club/club-05.jpg",
    alt: "The three members of team 595B in VexKan club shirts, holding their robot, a controller and their Judges Award trophy at the Alberta provincial championships.",
    caption: "595B at provincials",
  },
  {
    src: "/photos/iq_IMG_3858.jpg",
    alt: "Three young clubbers holding a VEX IQ trophy together in front of the Mecha Mayhem backdrop.",
    caption: "A trophy at Mecha Mayhem",
  },
  {
    src: "/photos/club/club-02.jpg",
    alt: "Students crowded around a long pit table at a competition, working on V5 robots while a volunteer talks to a team behind them.",
    caption: "In the pits",
  },
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
    src: "/photos/IMG_3558.jpg",
    alt: "A student holding a controller at the driver station beside students from two other teams, with the REC Foundation's Canada leader standing with them.",
    caption: "With the REC Foundation Canada leader",
  },
];

/** About: the club away from the field. Its own set, shared with no other page. */
export const aboutPhotos: Photo[] = [
  {
    src: "/photos/club/club-11.jpg",
    alt: "A young clubber crouched in front of a large VEX Robotics sign in a convention centre concourse at the World Championship.",
    caption: "At the World Championship",
  },
  {
    src: "/photos/IMG_3564.jpg",
    alt: "Two students in team lanyards standing at the field wall during a match, with other teams' pits behind them.",
    caption: "Watching a match",
  },
];
