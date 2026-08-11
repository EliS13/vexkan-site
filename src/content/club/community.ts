import { readyChapters } from "@/content/chapters";
import { tools } from "@/content/tools";
import { org } from "./org";
import { teams } from "./events";

/**
 * Free workshops the club runs for schools, libraries and community groups.
 *
 * Nothing in this file costs a family money, which is why it is the one place
 * on the club site allowed to say "free" without qualification. Programs go on
 * `/programs`, where the cost is stated. Do not move an item across that line
 * to make this list longer.
 */

export type Workshop = {
  slug: string;
  title: string;
  /** Written out rather than a Date, because a half-known date is still useful. */
  date: string;
  /** Sorts and hides past items. Empty where the date is not settled yet. */
  startsAt: string;
  location: string;
  /** Who it is actually for, in the grades a parent recognises. */
  grades: string;
  summary: string;
  /** Every workshop here is free. The field exists so a paid one cannot sneak in silently. */
  free: true;
  /** Where to sign up, when there is somewhere. */
  signupHref?: string;
};

/**
 * Workshops with a date set.
 *
 * Empty is the honest state, not a broken one: the club books these with a
 * school or a library rather than scheduling them in advance, so the page
 * leads with the request form whenever there is nothing here. Add an entry the
 * moment a date is agreed.
 */
export const upcomingWorkshops: Workshop[] = [];

/**
 * Workshops already run.
 *
 * `reached` is a headcount, so it only goes in where somebody actually counted.
 * A workshop with no number simply shows no number rather than a guess.
 */
export type PastWorkshop = {
  slug: string;
  title: string;
  when: string;
  summary: string;
  reached?: number;
};

/**
 * Nothing is listed yet because nothing has been written down in a form that
 * could be checked. The club has run summer camps — there are photographs of
 * the certificates — but neither the dates nor the headcounts were recorded,
 * and a number invented here would be a public claim about the club.
 *
 * See TODO.md. One entry per workshop, oldest last.
 */
export const pastWorkshops: PastWorkshop[] = [];

/**
 * The impact strip: numbers, no adjectives.
 *
 * Every figure here is counted from something in this repository rather than
 * estimated, so it cannot drift from what the site actually offers. Anything
 * the club has not counted — outreach headcounts, workshops run — is absent
 * rather than rounded up.
 */
export const impact = [
  {
    /* Readable chapters only. The array also holds outlines with no page. */
    value: String(readyChapters().length),
    label: "free guide chapters",
    note: "No account, no email.",
  },
  {
    value: String(tools.length),
    label: "free calculators and templates",
    note: "Gear ratios, notebooks, season plans.",
  },
  {
    value: String(org.studentCount),
    label: "clubbers",
    note: `${org.gradesLabel} in ${org.city.split(",")[0]}.`,
  },
  {
    value: String(teams.length),
    label: "teams fielded and mentored",
    note: `Since ${org.foundedYear}.`,
  },
] as const;
