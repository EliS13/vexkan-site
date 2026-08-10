import type { Hours } from "./types";

/**
 * Everything here is taken verbatim from the current vexkan.ca. Changing a
 * value changes it everywhere on the site, so it is the one place to edit
 * contact details.
 */
export const org = {
  name: "VexKan Robotics Club",
  shortName: "VexKan",
  tagline: "Engineered for Everyone",

  mission:
    "Make STEM education accessible and inspiring for all students by providing " +
    "free robotics support, mentorship, and learning opportunities that foster " +
    "creativity, problem-solving, teamwork, and confidence.",

  foundedYear: 2023,
  foundedBy: "Eli Seeliger",
  studentCount: 20,
  gradesLabel: "Grades 1–12",

  phone: "403-404-9033",
  phoneHref: "tel:+14034049033",
  email: "admin@vexkan.ca",
  emailHref: "mailto:admin@vexkan.ca",
  address: "Strathcona Park, Calgary, Alberta, Canada",
  city: "Calgary, Alberta",

  hours: [
    { days: "Monday–Thursday", time: "8AM–5PM" },
    { days: "Friday", time: "11AM–4PM" },
    { days: "Weekends & holidays", time: "Closed" },
  ] satisfies Hours[],

  /** The companion field guide, linked from the club site but kept separate. */
  guideHref: "/guide",
} as const;
