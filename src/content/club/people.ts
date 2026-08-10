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
      "Started VexKan in 2023 after experimenting with robotics at home, and has run " +
      "the club ever since. Competes in VEX alongside coaching, most recently with " +
      "team 16688A.",
  },
];
