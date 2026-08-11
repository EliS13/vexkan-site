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
  src: "/photos/all/vexkan-robotics-club-img-8018.jpg",
  alt: "A student in a navy jacket outside the entrance to hall A1, with a Mecha Mayhem banner on the doors behind him.",
  caption: "At Mecha Mayhem",
};

/**
 * Every set is disjoint: a photograph appears on exactly one page.
 *
 * Descriptions are specific for the photographs that have been opened one by
 * one. The rest carry a general description that is true of all of them, and
 * are marked in PHOTOS.md as still needing a proper pass.
 */

/** Home: the highlights. */
export const homePhotos: Photo[] = [
  {
    src: "/photos/all/101786393305-pic.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/111786393307-pic.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/121786393310-pic.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/141786393579-pic.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/151786393676-pic.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/161786393696-pic.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/171786393714-pic.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/181786393737-pic.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/191786394009-pic.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/201786394011-pic.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/211786394013-pic.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/221786394014-pic.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/231786394016-pic.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/81786393255-pic.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/91786393303-pic.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/heif-to-jpg-vexkan-robotics-club.jpg",
    alt: "Students crowded around a long pit table at a competition, working on V5 robots while a volunteer talks to a team behind them.",
    caption: "In the pits",
  },
  {
    src: "/photos/all/image-from-vexkan-robotics-club.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/image-from-vexkan-robotics-club-2.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/image-from-vexkan-robotics-club-4.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/image-from-vexkan-robotics-club-5.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/vexkan-robotics-club.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-1.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-edit-site-1.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-image.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-image-1-copy.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-image-2-copy.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-image-2100.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-image-3.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-image-copy.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-img-2120.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-img-2128.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-img-8015.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-img-8016.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-img-8018.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-img-8061.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
  {
    src: "/photos/all/vexkan-robotics-club-pic.jpg",
    alt: "A photograph from VexKan Robotics Club.",
  },
];

/** Programs: building, classes and benches. */
export const programPhotos: Photo[] = [
  {
    src: "/photos/all/heif-to-jpg-image.jpg",
    alt: "Two students sitting at a table going over a V5 robot together, with a scoring sheet and a VexKan Robotics Club pen in front of them.",
    caption: "Going over a build together",
  },
  {
    src: "/photos/all/vexkan-robotics-club-image-7934.jpg",
    alt: "Three young clubbers around a classroom table, one driving a VEX IQ robot with a controller while another steadies it and a third sorts parts.",
    caption: "A foundation class in session",
  },
  {
    src: "/photos/all/vexkan-robotics-club-img-8014.jpg",
    alt: "Two young clubbers building at a table with VEX IQ beams laid out in front of them and an instruction sheet open beside the parts.",
    caption: "Sorting parts before a build",
  },
  {
    src: "/photos/all/vexkan-robotics-club-img-8060.jpg",
    alt: "A young girl fitting a beam onto a VEX IQ frame at a table spread with parts, working on her own build.",
    caption: "Building a first frame",
  },
];

/** Results: awards. Trophies and certificates. */
export const eventPhotos: Photo[] = [
  {
    src: "/photos/all/image-from-vexkan-robotics-club-1.jpg",
    alt: "Four young clubbers holding VEX IQ trophies and certificates together after an awards ceremony.",
    caption: "After the awards",
  },
  {
    src: "/photos/all/image-from-vexkan-robotics-club-3.jpg",
    alt: "The three members of team 595B in VexKan club shirts, holding their robot, a controller and their Judges Award trophy at the Alberta provincial championships.",
    caption: "595B, Judges Award at provincials",
  },
  {
    src: "/photos/all/vexkan-robotics-club-image-1.jpg",
    alt: "Four young clubbers holding VEX IQ trophies after the awards, with other teams standing behind them.",
    caption: "Trophies after the ceremony",
  },
  {
    src: "/photos/all/vexkan-robotics-club-image-2.jpg",
    alt: "Young clubbers holding up gold trophies and Judges Award certificates together at the end of a summer camp.",
    caption: "Summer camp awards",
  },
];

/** About: the World Championship. */
export const aboutPhotos: Photo[] = [
  {
    src: "/photos/all/vexkan-robotics-club-img-2065.jpg",
    alt: "A young clubber crouched in front of a large VEX Robotics sign in a convention centre concourse at the World Championship.",
    caption: "At the World Championship",
  },
];
