export type Person = {
  name: string;
  role: string;
  bio: string;
  /** Two initials, used by the avatar placeholder until real photos exist. */
  initials: string;
};

export const people: Person[] = [
  {
    name: "Eli Seeliger",
    role: "Founder",
    initials: "ES",
    bio:
      "Started VexKan in 2023 after experimenting with robotics at home. Fourth year " +
      "competing in VEX and second year running the club.",
  },
  {
    name: "Alex Han",
    role: "Outreach Leader",
    initials: "AH",
    bio:
      "Third year in VEX robotics. Competed at the World Championship in VEX IQ before " +
      "moving across to VRC, and now brings new families into the club.",
  },
  {
    name: "Michael Li",
    role: "Organizer",
    initials: "ML",
    bio:
      "High school student passionate about robotics, technology and coding. Focused on " +
      "community building and making sure members have the support they need.",
  },
];
