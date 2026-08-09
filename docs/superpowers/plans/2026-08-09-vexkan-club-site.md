# VexKan Club Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the WordPress site on vexkan.ca with a static Next.js club site in this repository, including a self-hosted registration form and a private admin dashboard.

**Architecture:** One Next.js app, two route groups. `(club)` owns the root URLs and carries its own header, footer and layout; `(guide)` holds the existing field guide, relocated under `/guide`. All club copy lives in typed modules under `src/content/club/`. Registration writes to Supabase from the browser, protected by row level security with no anonymous read policy.

**Tech Stack:** Next.js 16.2.10 (App Router), React 19.2.4, TypeScript 5, Tailwind CSS v4, Supabase JS 2, Vitest (added in Task 1).

## Global Constraints

- **Next.js 16 breaking change:** `params` is a `Promise`. Every `page.tsx`, `layout.tsx` and `generateMetadata` that reads a dynamic segment must `await params`. Never access `params.slug` synchronously.
- **Consult the bundled docs, not memory.** This Next.js version differs from training data. Docs live at `node_modules/next/dist/docs/`. Read the relevant file before using an unfamiliar API.
- **Tailwind v4.** Configuration is CSS-first via `@theme inline` in `src/app/globals.css`. There is no `tailwind.config.js` and none should be created.
- **Palette is fixed.** Use the existing CSS variables from `globals.css` (`--purple` is the safety-orange brand at `#cc4a16`, `--teal`, `--amber`, `--line`, `--muted`, `--surface`, `--background`, `--ink-body`). Do not introduce new hex values in components.
- **No invented facts.** Every club claim must trace to the spec. Unknown values use the `TBD` constant and appear in `src/content/club/TODO.md`.
- **Copy rules:** club name is exactly `VexKan Robotics Club`; tagline is exactly `Engineered for Everyone`; phone `403-404-9033`; email `admin@vexkan.ca`; address `Strathcona Park, Calgary, Alberta, Canada`.
- **Club teams:** `595C` (VEX IQ, active), `595Y` (VEX IQ, active, qualified for Worlds this season), `16688A` (V5RC, active), `36467E` (V5RC, past). The `16688A` byline stays confined to the field guide.
- **Registration data minimisation:** never add fields beyond those in the Task 11 schema. No birthdates, addresses, student contact details, or medical information.
- **Every commit must leave `npm run build` and `npm run lint` passing.**

---

## File Structure

**Created:**

| Path | Responsibility |
| --- | --- |
| `vitest.config.ts` | Test runner config with the `@/` alias |
| `src/content/club/types.ts` | Shared club types and the `TBD` constant |
| `src/content/club/org.ts` | Name, tagline, mission, contact, hours, founding |
| `src/content/club/programs.ts` | The eight programs and lookup helpers |
| `src/content/club/people.ts` | The three leaders |
| `src/content/club/events.ts` | Competitions, results, teams, achievements |
| `src/content/club/TODO.md` | Every field currently holding `TBD` |
| `src/app/(club)/layout.tsx` | Club chrome |
| `src/app/(club)/page.tsx` … | Club pages |
| `src/app/(guide)/layout.tsx` | Guide chrome, moved from the root layout |
| `src/components/club/*` | Club-only components |
| `src/lib/registration.ts` | Pure validation and CSV helpers |
| `src/lib/registrationsApi.ts` | Supabase reads and writes for registrations |
| `supabase/migrations/0002_registrations.sql` | Tables and RLS |
| `DEPLOY.md` | Deployment runbook |

**Modified:**

- `src/app/layout.tsx` — drops `SiteHeader`/`SiteFooter`, keeps the shell
- `package.json` — adds `test` script and Vitest devDependencies
- `src/components/SiteHeader.tsx` — guide links become `/guide/*`

---

### Task 1: Test harness and club content foundation

**Files:**
- Create: `vitest.config.ts`, `src/content/club/types.ts`, `src/content/club/org.ts`
- Create: `src/content/club/__tests__/org.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `TBD` constant, `Maybe<T>` type, `isTbd(v)` guard, and the `org` object with fields `name`, `tagline`, `mission`, `foundedYear`, `foundedBy`, `studentCount`, `gradesLabel`, `phone`, `phoneHref`, `email`, `address`, `hours: {days: string; time: string}[]`.

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest@^3 vite-tsconfig-paths@^5
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/*
 * Only pure logic is tested here: content invariants, form validation, CSV.
 * Pages are verified by `npm run build` and in the browser, which is cheaper
 * than maintaining a React renderer for a site that is almost entirely static.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Add the test script to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write the failing test**

Create `src/content/club/__tests__/org.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { org } from "@/content/club/org";
import { TBD, isTbd } from "@/content/club/types";

describe("org", () => {
  it("carries the exact club name and tagline", () => {
    expect(org.name).toBe("VexKan Robotics Club");
    expect(org.tagline).toBe("Engineered for Everyone");
  });

  it("carries contact details that match the current site", () => {
    expect(org.phone).toBe("403-404-9033");
    expect(org.email).toBe("admin@vexkan.ca");
    expect(org.address).toBe("Strathcona Park, Calgary, Alberta, Canada");
  });

  it("builds a dialable phone href", () => {
    expect(org.phoneHref).toBe("tel:+14034049033");
  });

  it("lists opening hours for the weekdays the club is open", () => {
    expect(org.hours).toHaveLength(3);
    expect(org.hours[0]).toEqual({ days: "Monday–Thursday", time: "8AM–5PM" });
    expect(org.hours[2]).toEqual({ days: "Weekends & holidays", time: "Closed" });
  });

  it("was founded in 2023 by Eli Seeliger", () => {
    expect(org.foundedYear).toBe(2023);
    expect(org.foundedBy).toBe("Eli Seeliger");
  });
});

describe("isTbd", () => {
  it("detects the placeholder", () => {
    expect(isTbd(TBD)).toBe(true);
  });

  it("passes real values through", () => {
    expect(isTbd("Tuesdays, 6–8PM")).toBe(false);
  });
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `@/content/club/org`.

- [ ] **Step 6: Create `src/content/club/types.ts`**

```ts
/**
 * The club has never published class times, fees, or term dates. Rather than
 * guess at them, every unknown holds this sentence, which renders verbatim and
 * links to the contact page. `src/content/club/TODO.md` lists every field
 * currently set to it.
 */
export const TBD = "Contact us for current details" as const;

export type Tbd = typeof TBD;

/** A value the club has published, or the placeholder standing in for it. */
export type Maybe<T> = T | Tbd;

export function isTbd(value: unknown): value is Tbd {
  return value === TBD;
}

export type Hours = {
  days: string;
  time: string;
};
```

- [ ] **Step 7: Create `src/content/club/org.ts`**

```ts
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
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — 6 tests.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/content/club
git commit -m "Add Vitest and the club organisation content module"
```

---

### Task 2: Programs content and lookup helpers

**Files:**
- Create: `src/content/club/programs.ts`, `src/content/club/__tests__/programs.test.ts`

**Interfaces:**
- Consumes: `Maybe`, `TBD` from `@/content/club/types`.
- Produces: `Program` type; `programs: Program[]`; `getProgram(slug: string): Program | undefined`; `programSlugs(): string[]`; `programsByTrack(track: ProgramTrack): Program[]`; `TRACK_LABELS: Record<ProgramTrack, string>`.

- [ ] **Step 1: Write the failing test**

Create `src/content/club/__tests__/programs.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  getProgram,
  programSlugs,
  programs,
  programsByTrack,
  TRACK_LABELS,
} from "@/content/club/programs";

describe("programs", () => {
  it("has the eight programs the club runs", () => {
    expect(programs).toHaveLength(8);
  });

  it("uses unique slugs", () => {
    expect(new Set(programSlugs()).size).toBe(8);
  });

  it("finds a program by slug", () => {
    const p = getProgram("vex-iq-foundation-g1-2");
    expect(p?.title).toBe("VEX IQ Foundation Class");
    expect(p?.gradeLabel).toBe("Grades 1–2");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getProgram("not-a-program")).toBeUndefined();
  });

  it("groups the four foundation classes onto one track", () => {
    expect(programsByTrack("iq-foundation")).toHaveLength(4);
  });

  it("groups the two IQ competition teams onto one track", () => {
    expect(programsByTrack("iq-competition")).toHaveLength(2);
  });

  it("labels every track", () => {
    for (const p of programs) {
      expect(TRACK_LABELS[p.track]).toBeTruthy();
    }
  });

  it("gives every program a summary and at least three learning outcomes", () => {
    for (const p of programs) {
      expect(p.summary.length).toBeGreaterThan(20);
      expect(p.learn.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("orders foundation classes by ascending grade", () => {
    const grades = programsByTrack("iq-foundation").map((p) => p.gradeMin);
    expect(grades).toEqual([1, 3, 5, 7]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `@/content/club/programs`.

- [ ] **Step 3: Create `src/content/club/programs.ts`**

```ts
import { TBD, type Maybe } from "./types";

export type ProgramTrack = "iq-foundation" | "iq-competition" | "v5rc" | "camp";

export type Program = {
  slug: string;
  title: string;
  /** Disambiguates the four identically titled foundation classes in lists. */
  shortTitle: string;
  track: ProgramTrack;
  gradeLabel: string;
  gradeMin: number | null;
  gradeMax: number | null;
  summary: string;
  description: string;
  learn: string[];
  prerequisites: string | null;
  schedule: Maybe<string>;
  fee: Maybe<string>;
  /**
   * The Google Form the club used before this site had its own registration.
   * Not linked in normal operation; the register page falls back to it when
   * Supabase is unconfigured, so a signup is never simply lost.
   */
  legacyFormUrl: string | null;
};

export const TRACK_LABELS: Record<ProgramTrack, string> = {
  "iq-foundation": "VEX IQ Foundation Classes",
  "iq-competition": "VEX IQ Competition Teams",
  v5rc: "VEX V5RC Competition Teams",
  camp: "Summer Camp",
};

export const TRACK_ORDER: ProgramTrack[] = ["iq-foundation", "iq-competition", "v5rc", "camp"];

/**
 * The foundation classes share their curriculum across all four grade bands,
 * which is how the club describes them. The wording stays identical on purpose.
 */
const FOUNDATION_DESCRIPTION =
  "VEX IQ Foundation Class is a good pathway to the Competition teams. Through " +
  "learning the functions of different VEX parts, tools and accessories, clubbers " +
  "learn how to brainstorm, design and snap together using pegs and pins, noting " +
  "Engineering Logbooks, making it easy to construct a robot to fulfill a task.";

const FOUNDATION_LEARN = [
  "The functions of VEX parts, tools and accessories",
  "Brainstorming and designing before building",
  "Assembly with pegs and pins",
  "Keeping an Engineering Logbook",
  "Programming the finished robot",
  "Competing in regular internal competitions",
];

function foundation(
  slug: string,
  gradeMin: number,
  gradeMax: number,
  legacyFormUrl: string | null
): Program {
  return {
    slug,
    title: "VEX IQ Foundation Class",
    shortTitle: `Foundation, Grades ${gradeMin}–${gradeMax}`,
    track: "iq-foundation",
    gradeLabel: `Grades ${gradeMin}–${gradeMax}`,
    gradeMin,
    gradeMax,
    summary:
      "Hands-on introduction to VEX IQ, and the usual route onto a competition team. " +
      "Clubbers build, program, keep a logbook, and compete internally for certificates.",
    description: FOUNDATION_DESCRIPTION,
    learn: FOUNDATION_LEARN,
    prerequisites: null,
    schedule: TBD,
    fee: TBD,
    legacyFormUrl,
  };
}

export const programs: Program[] = [
  foundation("vex-iq-foundation-g1-2", 1, 2, "https://forms.gle/nYaKofbC96VfLwLm8"),
  foundation("vex-iq-foundation-g3-4", 3, 4, null),
  foundation("vex-iq-foundation-g5-6", 5, 6, "https://forms.gle/p1W6PR2kDA3tHUC29"),
  foundation("vex-iq-foundation-g7-8", 7, 8, "https://forms.gle/p1W6PR2kDA3tHUC29"),

  {
    slug: "vex-iq-competition-es",
    title: "VEX IQ Competition Team — Elementary",
    shortTitle: "IQ Competition, Elementary",
    track: "iq-competition",
    gradeLabel: "Grades 3–6",
    gradeMin: 3,
    gradeMax: 6,
    summary:
      "A team of 3–4 clubbers chosen from the Grade 3–6 Foundation Classes, " +
      "representing VexKan at regional, provincial and out-of-province events.",
    description:
      "Members consist of 3-4 team members selected from the Foundation Class of Grade 3-6. " +
      "The team represents the Club against outside teams at regional, provincial and " +
      "out-of-province competitions.",
    learn: [
      "Designing a robot against a competition game",
      "Iterating a build across a season",
      "Driving practice and match strategy",
      "Presenting an Engineering Logbook to judges",
    ],
    prerequisites: "Selected from the Grade 3–6 Foundation Classes.",
    schedule: TBD,
    fee: TBD,
    legacyFormUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSfKw2kGi8jhkNtxTmPYE1otpKju-cQXqTWUud1VtyQLfROKjQ/viewform",
  },
  {
    slug: "vex-iq-competition-ms",
    title: "VEX IQ Competition Team — Middle School",
    shortTitle: "IQ Competition, Middle School",
    track: "iq-competition",
    gradeLabel: "Grades 7–8",
    gradeMin: 7,
    gradeMax: 8,
    summary:
      "A team of 3–4 clubbers chosen from the Grade 7–8 Foundation Classes, " +
      "competing locally, nationally and internationally.",
    description:
      "Members consist of 3-4 team members selected from the Foundation Class of Grade 7-8. " +
      "The team represents the Club against outside teams at local, national and " +
      "international competitions.",
    learn: [
      "Designing a robot against a competition game",
      "Iterating a build across a season",
      "Driving practice and match strategy",
      "Presenting an Engineering Logbook to judges",
    ],
    prerequisites: "Selected from the Grade 7–8 Foundation Classes.",
    schedule: TBD,
    fee: TBD,
    legacyFormUrl: null,
  },
  {
    slug: "v5rc-competition",
    title: "VEX V5RC Competition Teams",
    shortTitle: "V5RC Competition",
    track: "v5rc",
    gradeLabel: "Grades 7–12",
    gradeMin: 7,
    gradeMax: 12,
    summary:
      "The club's senior teams, 1–5 members each, building metal V5 robots for the " +
      "middle and high school competition season.",
    description:
      "Members consist of 1-5 team members selected from the previous competitive teams " +
      "and/or IQ Competition Teams. Build up teamwork, leadership, coding ability, " +
      "hands-on ability, problem-solving skills through teamwork and competitions.",
    learn: [
      "Designing and machining a metal V5 robot",
      "Programming autonomous routines",
      "Season-long iteration and testing",
      "Leadership and team management",
      "Competing at regional, national and international events",
    ],
    prerequisites: "Selected from previous competitive teams or the IQ Competition Teams.",
    schedule: TBD,
    fee: TBD,
    legacyFormUrl: "https://forms.gle/VxGq6iRduycambFK6",
  },
  {
    slug: "summer-camp",
    title: "Ms. Cecci's Summer Camp — English and Math",
    shortTitle: "Summer Camp",
    track: "camp",
    gradeLabel: "Contact us for eligible grades",
    gradeMin: null,
    gradeMax: null,
    summary:
      "A summer camp built on a customised English and Math curriculum, with snack, " +
      "lunch, materials and prizes included.",
    description:
      "Customized curriculum with morning snack, lunch, work materials and prizes included.",
    learn: [
      "A customised English and Math curriculum",
      "Small-group work with materials provided",
      "Daily activities with prizes",
    ],
    prerequisites: null,
    schedule: TBD,
    fee: TBD,
    legacyFormUrl: "https://forms.gle/LUWJUHzDj3NtchEz8",
  },
];

export function getProgram(slug: string): Program | undefined {
  return programs.find((p) => p.slug === slug);
}

export function programSlugs(): string[] {
  return programs.map((p) => p.slug);
}

export function programsByTrack(track: ProgramTrack): Program[] {
  return programs.filter((p) => p.track === track);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — all program tests green.

- [ ] **Step 5: Commit**

```bash
git add src/content/club
git commit -m "Add the club programs content module"
```

---

### Task 3: People, teams and events content

**Files:**
- Create: `src/content/club/people.ts`, `src/content/club/events.ts`
- Create: `src/content/club/__tests__/events.test.ts`

**Interfaces:**
- Consumes: `Maybe`, `TBD`.
- Produces: `Person` type and `people: Person[]`; `Team` type and `teams: Team[]`; `ClubEvent` type and `events: ClubEvent[]`; `achievements: string[]`.

- [ ] **Step 1: Write the failing test**

Create `src/content/club/__tests__/events.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { achievements, events, teams } from "@/content/club/events";
import { people } from "@/content/club/people";

describe("people", () => {
  it("lists the three club leaders", () => {
    expect(people.map((p) => p.name)).toEqual(["Eli Seeliger", "Alex Han", "Michael Li"]);
  });

  it("gives every leader a role and a bio", () => {
    for (const p of people) {
      expect(p.role).toBeTruthy();
      expect(p.bio.length).toBeGreaterThan(20);
    }
  });
});

describe("teams", () => {
  it("lists the club's four competition teams", () => {
    expect(teams.map((t) => t.number).sort()).toEqual(["16688A", "36467E", "595C", "595Y"]);
  });

  it("puts both 595 teams in VEX IQ and 16688A in V5RC", () => {
    expect(teams.find((t) => t.number === "595C")?.program).toBe("VEX IQ");
    expect(teams.find((t) => t.number === "595Y")?.program).toBe("VEX IQ");
    expect(teams.find((t) => t.number === "16688A")?.program).toBe("V5RC");
  });

  it("marks 36467E as the only past team", () => {
    expect(teams.find((t) => t.number === "36467E")?.status).toBe("past");
    expect(teams.filter((t) => t.status === "active")).toHaveLength(3);
  });
});

describe("events", () => {
  it("lists the regional competitions and the Worlds result", () => {
    expect(events.length).toBeGreaterThanOrEqual(3);
    expect(events.some((e) => e.name.includes("World Championship"))).toBe(true);
  });

  it("gives every event a unique slug", () => {
    const slugs = events.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("achievements", () => {
  it("records the Worlds and U.S. Open invitations", () => {
    const joined = achievements.join(" ");
    expect(joined).toContain("World Championship");
    expect(joined).toContain("U.S. Open");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `@/content/club/events`.

- [ ] **Step 3: Create `src/content/club/people.ts`**

```ts
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
```

- [ ] **Step 4: Create `src/content/club/events.ts`**

```ts
import { TBD, type Maybe } from "./types";

export type Team = {
  number: string;
  program: "VEX IQ" | "V5RC";
  status: "active" | "past";
  note: string;
};

/**
 * The club competes under four team numbers. 16688A is also the byline on the
 * field guide, which is why that number appears in both places.
 */
export const teams: Team[] = [
  {
    number: "595C",
    program: "VEX IQ",
    status: "active",
    note: "Placed 7th in Division at the World Championship in Dallas, Texas.",
  },
  {
    number: "595Y",
    program: "VEX IQ",
    status: "active",
    note: "Qualified for the World Championship this season.",
  },
  {
    number: "16688A",
    program: "V5RC",
    status: "active",
    note: "The club's V5 competition team, and the byline on our field guide.",
  },
  {
    number: "36467E",
    program: "V5RC",
    status: "past",
    note: "An earlier V5 team that competed before 16688A.",
  },
];

export type ClubEvent = {
  slug: string;
  name: string;
  kind: "competition" | "result";
  date: Maybe<string>;
  location: Maybe<string>;
  summary: string;
};

export const events: ClubEvent[] = [
  {
    slug: "vrc-regional-2025",
    name: "VEX VRC Regional Competition 2025",
    kind: "competition",
    date: TBD,
    location: TBD,
    summary: "The regional V5 competition our middle and high school teams compete in.",
  },
  {
    slug: "iq-regional-2025",
    name: "VEX IQ Regional Competition 2025",
    kind: "competition",
    date: TBD,
    location: TBD,
    summary: "The regional VEX IQ competition for our elementary and middle school teams.",
  },
  {
    slug: "worlds-dallas-595c",
    name: "VEX Robotics World Championship — Dallas, TX",
    kind: "result",
    date: TBD,
    location: "Dallas, Texas",
    summary: "Team 595C finished 7th in their Division at the World Championship.",
  },
];

/**
 * The "two invitations" line is taken from the current vexkan.ca. 595Y has
 * since qualified as well, so the count is very likely stale — TODO.md flags it
 * for the club to confirm rather than have this file guess at a new number.
 */
export const achievements: string[] = [
  "Tournament Championships and Excellence Awards",
  "Multiple invitations to the VEX Robotics World Championship",
  "Invitations to the U.S. Open",
  "Team 595C, 7th in Division at the World Championship in Dallas, Texas",
  "Team 595Y qualified for the World Championship this season",
];
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content/club
git commit -m "Add club people, teams and events content"
```

---

### Task 4: Route groups — move the guide under /guide

This task changes URLs only. No visual change, no new pages. It is separated so that a reviewer can confirm the guide still works before any club code lands.

**Files:**
- Create: `src/app/(guide)/layout.tsx`, `src/app/(club)/layout.tsx`, `src/app/(club)/page.tsx`
- Move: `src/app/page.tsx` → `src/app/(guide)/guide/page.tsx`, and `chapters/`, `tools/`, `ask/`, `seasons/`, `account/` into `src/app/(guide)/guide/`
- Modify: `src/app/layout.tsx`, `src/components/SiteHeader.tsx`, plus any guide file containing an internal link

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: the `(club)` route group with a working root layout, ready for pages in Tasks 5–14.

- [ ] **Step 1: Move the guide routes with git mv**

```bash
mkdir -p "src/app/(guide)/guide"
git mv src/app/page.tsx "src/app/(guide)/guide/page.tsx"
for d in chapters tools ask seasons account; do git mv "src/app/$d" "src/app/(guide)/guide/$d"; done
```

- [ ] **Step 2: Create `src/app/(guide)/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Built From the Ground Up — A VEX Robotics Field Guide",
  description:
    "An interactive companion to Built From the Ground Up: navigate VEX IQ and V5RC with chapter guides, calculators, and an assistant that gives you the next steps.",
};

/**
 * The field guide keeps its own chrome. Nothing here is shared with the club
 * site beyond the palette in globals.css, which is the point of the split.
 */
export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 3: Rewrite `src/app/layout.tsx` as a bare shell**

Replace the whole file with:

```tsx
import type { Metadata } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

/** Geometric and slightly mechanical. Carries headings without going literary. */
const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

/** Eyebrows, labels, and every number a tool reports, so they read as instruments. */
const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vexkan.ca"),
  title: "VexKan Robotics Club",
  description:
    "A nonprofit robotics club in Calgary teaching VEX IQ and V5RC to students in Grades 1 to 12.",
};

/**
 * Header and footer live in the route group layouts, because the club site and
 * the field guide have different chrome. This file owns only the document
 * shell, the fonts, and the skip link.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${mono.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
```

**Do not rename the mono font variable.** `@theme inline` maps `--font-mono: var(--font-mono)`, which looks self-referential but is not broken: next/font sets `--font-mono` via a class on `<html>`, and that class-based declaration outranks the `:root` declaration from `@theme`. Verified in the browser — `--font-mono` resolves to `"IBM Plex Mono"` and `.eyebrow` renders in it. Leave `globals.css` font tokens alone.

- [ ] **Step 4: Create a temporary club layout and home page**

`src/app/(club)/layout.tsx`:

```tsx
export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="flex-1">
      {children}
    </main>
  );
}
```

`src/app/(club)/page.tsx`:

```tsx
export default function HomePage() {
  return <h1>VexKan Robotics Club</h1>;
}
```

- [ ] **Step 5: Repoint every internal guide link**

Find them:

```bash
grep -rnE 'href="/(chapters|tools|ask|seasons|account)' src/ | grep -v node_modules
```

Every match must gain the `/guide` prefix, for example `href="/chapters"` becomes `href="/guide/chapters"`. In `src/components/SiteHeader.tsx` update `NAV_LINKS` to `/guide/chapters`, `/guide/tools`, `/guide/ask`, and change the wordmark `Link href="/"` to `href="/guide"`. Also check `src/lib/searchIndex.ts` and `src/content/tools.ts` for stored paths and prefix those too.

- [ ] **Step 6: Verify the build and every guide route**

```bash
npm run build
```

Expected: build succeeds, and the route list shows `/guide`, `/guide/chapters`, `/guide/tools`, `/guide/ask`, `/guide/seasons`, `/guide/account`, and `/`.

Then start the preview with the `vex-dev` configuration and confirm in the browser that `/guide` renders the field guide home, `/guide/chapters` lists chapters, a chapter page opens, `/guide/tools/gear-ratio` works, and `/` shows the placeholder heading. Check the console for errors.

- [ ] **Step 7: Verify no stale links remain**

```bash
grep -rnE 'href="/(chapters|tools|ask|seasons|account)' src/ | grep -v node_modules
```

Expected: no output.

- [ ] **Step 8: Commit**

```bash
git add -A src/app src/components src/lib src/content
git commit -m "Split the app into club and guide route groups

The field guide moves under /guide with its own layout, and the root
layout drops to a bare document shell so each route group owns its own
header and footer. The club site takes the root URLs."
```

---

### Task 5: Club chrome and shared primitives

**Files:**
- Create: `src/components/club/ClubHeader.tsx`, `src/components/club/ClubFooter.tsx`, `src/components/club/Section.tsx`, `src/components/club/Button.tsx`, `src/components/club/Card.tsx`
- Modify: `src/app/(club)/layout.tsx`, `src/app/globals.css`

**Interfaces:**
- Consumes: `org` from Task 1.
- Produces: `<ClubHeader />`, `<ClubFooter />`, `<Section eyebrow? title? lead? tone?>`, `<Button href variant? size?>`, `<Card>`.

- [ ] **Step 1: Add club typography utilities to `globals.css`**

Append at the end of the file:

```css
/*
 * The club site is read by parents deciding where to send a seven year old,
 * not by a builder at a bench. Same palette and same fonts as the guide, set
 * larger and looser so it reads as an invitation rather than an instrument.
 */
.club {
  font-size: 17px;
  line-height: 1.7;
}

.club h1,
.club h2,
.club h3 {
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
  letter-spacing: -0.02em;
  color: var(--foreground);
}

.club-lead {
  font-size: 1.125rem;
  line-height: 1.65;
  color: var(--ink-body);
}
```

- [ ] **Step 2: Create `src/components/club/Button.tsx`**

```tsx
import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
  external?: boolean;
};

const SIZES = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
} as const;

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  external = false,
}: Props) {
  const base = `inline-flex items-center justify-center rounded-xl font-semibold transition-opacity hover:opacity-90 ${SIZES[size]}`;

  const style =
    variant === "primary"
      ? { background: "var(--purple)", color: "#fff" }
      : { background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--line)" };

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={base} style={style}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={base} style={style}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 3: Create `src/components/club/Section.tsx`**

```tsx
type Props = {
  children: React.ReactNode;
  eyebrow?: string;
  title?: string;
  lead?: string;
  tone?: "default" | "surface";
  id?: string;
};

/** One vertical band of a club page, with optional heading block. */
export function Section({ children, eyebrow, title, lead, tone = "default", id }: Props) {
  return (
    <section
      id={id}
      className="py-16 sm:py-20"
      style={tone === "surface" ? { background: "var(--surface)" } : undefined}
    >
      <div className="mx-auto max-w-6xl px-5">
        {(eyebrow || title || lead) && (
          <div className="mb-10 max-w-2xl">
            {eyebrow && <p className="eyebrow text-[var(--muted)]">{eyebrow}</p>}
            {title && <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">{title}</h2>}
            {lead && <p className="club-lead mt-4">{lead}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `src/components/club/Card.tsx`**

```tsx
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/club/ClubHeader.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { org } from "@/content/club/org";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
];

export function ClubHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 border-b bg-surface/90 backdrop-blur"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ background: "var(--purple)" }}
            aria-hidden="true"
          >
            VK
          </span>
          <span className="truncate font-serif text-base font-semibold">{org.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-[var(--ink-body)] transition-colors hover:bg-[#eae6e0] hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={org.guideHref}
            className="rounded-md px-3 py-2 text-sm font-medium text-[var(--ink-body)] transition-colors hover:bg-[#eae6e0] hover:text-foreground"
          >
            Field Guide
          </Link>
          <Link
            href="/register"
            className="ml-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--purple)" }}
          >
            Register
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="club-mobile-nav"
          className="rounded-md px-3 py-2 text-sm font-medium md:hidden"
          style={{ border: "1px solid var(--line)" }}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="club-mobile-nav" className="border-t md:hidden" style={{ borderColor: "var(--line)" }}>
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3">
            {[...NAV, { href: org.guideHref, label: "Field Guide" }, { href: "/register", label: "Register" }].map(
              (l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-[var(--ink-body)] hover:bg-[#eae6e0]"
                >
                  {l.label}
                </Link>
              )
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
```

- [ ] **Step 6: Create `src/components/club/ClubFooter.tsx`**

```tsx
import Link from "next/link";
import { org } from "@/content/club/org";
import { programs } from "@/content/club/programs";

export function ClubFooter() {
  return (
    <footer className="border-t bg-surface" style={{ borderColor: "var(--line)" }}>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-base font-semibold">{org.name}</p>
          <p className="mt-2 text-sm text-muted">{org.tagline}</p>
          <p className="mt-4 text-sm text-muted">
            A nonprofit robotics club for {org.gradesLabel.toLowerCase()} in {org.city}.
          </p>
        </div>

        <div>
          <p className="eyebrow text-[var(--muted)]">Programs</p>
          <ul className="mt-3 space-y-2 text-sm">
            {programs.slice(0, 5).map((p) => (
              <li key={p.slug}>
                <Link href={`/programs/${p.slug}`} className="text-[var(--ink-body)] hover:underline">
                  {p.shortTitle}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/programs" className="text-[var(--ink-body)] hover:underline">
                All programs
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-[var(--muted)]">Club</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about" className="text-[var(--ink-body)] hover:underline">About us</Link></li>
            <li><Link href="/events" className="text-[var(--ink-body)] hover:underline">Events</Link></li>
            <li><Link href="/register" className="text-[var(--ink-body)] hover:underline">Register</Link></li>
            <li><Link href={org.guideHref} className="text-[var(--ink-body)] hover:underline">Field Guide</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-[var(--muted)]">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink-body)]">
            <li><a href={org.phoneHref} className="hover:underline">{org.phone}</a></li>
            <li><a href={org.emailHref} className="hover:underline">{org.email}</a></li>
            <li className="text-muted">{org.address}</li>
          </ul>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto max-w-6xl px-5 py-5 text-[13px] text-muted">
          <p>
            © {new Date().getFullYear()} {org.name}. VexKan is not affiliated with VEX Robotics or
            the REC Foundation. Competition rules and game manuals come from{" "}
            <a
              href="https://www.vexrobotics.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--ink-body)]"
            >
              VEX Robotics
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 7: Replace `src/app/(club)/layout.tsx`**

```tsx
import { ClubHeader } from "@/components/club/ClubHeader";
import { ClubFooter } from "@/components/club/ClubFooter";

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="club flex min-h-full flex-1 flex-col">
      <ClubHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <ClubFooter />
    </div>
  );
}
```

- [ ] **Step 8: Verify**

Run `npm run build` — expected: succeeds. Then in the browser at `/`, confirm the header and footer render, the mobile Menu button toggles the nav at a 375px viewport, and `/guide` still shows the guide's own header rather than the club one.

- [ ] **Step 9: Commit**

```bash
git add src/components/club src/app globals
git commit -m "Add club header, footer and layout primitives"
```

---

### Task 6: Home page

**Files:**
- Create: `src/app/(club)/page.tsx` (replacing the placeholder), `src/components/club/art/RobotHero.tsx`

**Interfaces:**
- Consumes: `org`, `programs`, `TRACK_LABELS`, `TRACK_ORDER`, `programsByTrack`, `achievements`, `Section`, `Button`, `Card`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Create `src/components/club/art/RobotHero.tsx`**

An SVG illustration in the manner of `src/components/diagrams/`. No photographs exist, and stock imagery would misrepresent the club.

```tsx
/**
 * A VEX IQ style robot on a field tile, drawn rather than photographed. The
 * container is 4:3 so a real team photo can replace this file without any
 * layout change.
 */
export function RobotHero() {
  return (
    <svg viewBox="0 0 400 300" role="img" aria-label="An illustration of a VEX robot on a competition field tile" className="h-auto w-full">
      <rect x="0" y="0" width="400" height="300" fill="var(--surface)" />
      <g stroke="var(--line)" strokeWidth="1">
        {[0, 50, 100, 150, 200, 250, 300, 350].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" />
        ))}
        {[0, 50, 100, 150, 200, 250].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} />
        ))}
      </g>
      <ellipse cx="200" cy="245" rx="95" ry="12" fill="var(--foreground)" opacity="0.08" />
      <rect x="120" y="120" width="160" height="105" rx="10" fill="var(--purple)" />
      <rect x="136" y="138" width="128" height="52" rx="6" fill="var(--surface)" opacity="0.92" />
      <circle cx="170" cy="164" r="11" fill="var(--teal)" />
      <circle cx="230" cy="164" r="11" fill="var(--teal)" />
      <rect x="150" y="86" width="100" height="36" rx="8" fill="var(--foreground)" />
      <rect x="166" y="98" width="68" height="12" rx="4" fill="var(--amber)" />
      <circle cx="128" cy="228" r="26" fill="var(--foreground)" />
      <circle cx="128" cy="228" r="11" fill="var(--line)" />
      <circle cx="272" cy="228" r="26" fill="var(--foreground)" />
      <circle cx="272" cy="228" r="11" fill="var(--line)" />
      <rect x="286" y="150" width="58" height="14" rx="7" fill="var(--amber)" />
      <rect x="56" y="150" width="58" height="14" rx="7" fill="var(--amber)" />
    </svg>
  );
}
```

- [ ] **Step 2: Write the home page**

Replace `src/app/(club)/page.tsx`:

```tsx
import Link from "next/link";
import { org } from "@/content/club/org";
import { achievements } from "@/content/club/events";
import { TRACK_LABELS, TRACK_ORDER, programsByTrack } from "@/content/club/programs";
import { Section } from "@/components/club/Section";
import { Button } from "@/components/club/Button";
import { Card } from "@/components/club/Card";
import { RobotHero } from "@/components/club/art/RobotHero";

const STEPS = [
  {
    n: "1",
    title: "Pick a program",
    body: "Foundation classes start from Grade 1. Competition teams are selected from those classes.",
  },
  {
    n: "2",
    title: "Send us a registration",
    body: "One short form with your child's grade and how to reach you. It takes about a minute.",
  },
  {
    n: "3",
    title: "We get in touch",
    body: "We confirm the current schedule, answer your questions, and get your child started.",
  },
];

export default function HomePage() {
  return (
    <>
      <div className="tile-grid border-b" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-[var(--purple-text)]">
              Nonprofit robotics · {org.city}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.1] sm:text-5xl">
              {org.tagline}
            </h1>
            <p className="club-lead mt-5">
              {org.name} is a nonprofit club teaching VEX robotics to students in{" "}
              {org.gradesLabel.toLowerCase()}. We build robots, keep engineering logbooks, and
              compete — from a first snap-together kit right through to the World Championship.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/register" size="lg">Register your child</Button>
              <Button href="/programs" size="lg" variant="secondary">See our programs</Button>
            </div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
            <RobotHero />
          </div>
        </div>
      </div>

      <Section tone="surface" eyebrow="Our mission" title="Robotics, open to everyone">
        <p className="club-lead max-w-3xl">{org.mission}</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          <Card>
            <p className="readout text-3xl font-semibold text-[var(--purple-text)]">
              {org.studentCount}+
            </p>
            <p className="mt-1 text-sm text-muted">students in the club</p>
          </Card>
          <Card>
            <p className="readout text-3xl font-semibold text-[var(--purple-text)]">
              {org.gradesLabel.replace("Grades ", "")}
            </p>
            <p className="mt-1 text-sm text-muted">grades we teach</p>
          </Card>
          <Card>
            <p className="readout text-3xl font-semibold text-[var(--purple-text)]">
              {new Date().getFullYear() - org.foundedYear}
            </p>
            <p className="mt-1 text-sm text-muted">years running, founded {org.foundedYear}</p>
          </Card>
        </div>
      </Section>

      <Section
        eyebrow="Programs"
        title="A path from Grade 1 to the World Championship"
        lead="Foundation classes teach the basics hands-on. Competition teams are chosen from those classes and represent VexKan against other clubs."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {TRACK_ORDER.map((track) => {
            const list = programsByTrack(track);
            return (
              <Card key={track}>
                <h3 className="text-lg font-semibold">{TRACK_LABELS[track]}</h3>
                <ul className="mt-4 space-y-2">
                  {list.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/programs/${p.slug}`}
                        className="flex items-baseline justify-between gap-3 text-sm text-[var(--ink-body)] hover:underline"
                      >
                        <span>{p.shortTitle}</span>
                        <span className="eyebrow shrink-0 text-[var(--muted)]">{p.gradeLabel}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section tone="surface" eyebrow="Results" title="Where our teams have been">
        <ul className="grid gap-4 sm:grid-cols-2">
          {achievements.map((a) => (
            <li key={a} className="flex gap-3">
              <span
                className="mt-2 h-2 w-2 shrink-0 rounded-full"
                style={{ background: "var(--purple)" }}
                aria-hidden="true"
              />
              <span className="text-[var(--ink-body)]">{a}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Button href="/events" variant="secondary">Events and results</Button>
        </div>
      </Section>

      <Section eyebrow="Joining" title="How to join">
        <ol className="grid gap-5 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n}>
              <Card>
                <span
                  className="readout flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ background: "var(--purple)" }}
                >
                  {s.n}
                </span>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.body}</p>
              </Card>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <Button href="/register" size="lg">Register your child</Button>
        </div>
      </Section>
    </>
  );
}
```

- [ ] **Step 3: Verify**

Run `npm run build` — expected: succeeds and `/` is listed as static. In the browser check the hero at 1280px, 768px and 360px, confirm no horizontal scroll at 360px, and confirm every link resolves.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(club\)/page.tsx src/components/club/art
git commit -m "Add the club home page"
```

---

### Task 7: About page

**Files:**
- Create: `src/app/(club)/about/page.tsx`, `src/components/club/PersonCard.tsx`

**Interfaces:**
- Consumes: `org`, `people`, `teams`, `achievements`, `Section`, `Card`, `Button`.

- [ ] **Step 1: Create `src/components/club/PersonCard.tsx`**

```tsx
import type { Person } from "@/content/club/people";
import { Card } from "./Card";

export function PersonCard({ person }: { person: Person }) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <span
          className="readout flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
          style={{ background: "var(--purple)" }}
          aria-hidden="true"
        >
          {person.initials}
        </span>
        <div>
          <h3 className="text-base font-semibold">{person.name}</h3>
          <p className="eyebrow text-[var(--muted)]">{person.role}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-[var(--ink-body)]">{person.bio}</p>
    </Card>
  );
}
```

- [ ] **Step 2: Create `src/app/(club)/about/page.tsx`**

```tsx
import type { Metadata } from "next";
import { org } from "@/content/club/org";
import { people } from "@/content/club/people";
import { achievements, teams } from "@/content/club/events";
import { Section } from "@/components/club/Section";
import { Card } from "@/components/club/Card";
import { Button } from "@/components/club/Button";
import { PersonCard } from "@/components/club/PersonCard";

export const metadata: Metadata = {
  title: `About — ${org.name}`,
  description: `${org.name} is a nonprofit robotics club founded in ${org.foundedYear} in ${org.city}, teaching VEX robotics to ${org.gradesLabel.toLowerCase()}.`,
};

const VALUES = [
  { title: "Open to everyone", body: "Support and mentorship are free. Cost should never be why a child misses out on robotics." },
  { title: "Hands on the parts", body: "Clubbers build, program and test the robot themselves. We coach; we don't build it for them." },
  { title: "Write it down", body: "Every team keeps an Engineering Logbook, because explaining a decision is as much of the work as making it." },
  { title: "Compete, and keep going", body: "Losing a match is a design brief. Teams iterate through a season rather than starting over." },
];

export default function AboutPage() {
  return (
    <>
      <Section
        eyebrow="About us"
        title={`A robotics club that started at a kitchen table`}
        lead={`${org.name} was founded in ${org.foundedYear} by ${org.foundedBy} and a group of enthusiasts, after he started experimenting with robotics at home. It has grown to around ${org.studentCount} students across ${org.gradesLabel.toLowerCase()}.`}
      >
        <Card>
          <p className="eyebrow text-[var(--muted)]">Our mission</p>
          <p className="club-lead mt-3">{org.mission}</p>
        </Card>
      </Section>

      <Section tone="surface" eyebrow="What we value" title="How we run the club">
        <div className="grid gap-5 sm:grid-cols-2">
          {VALUES.map((v) => (
            <Card key={v.title}>
              <h3 className="text-base font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted">{v.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section eyebrow="Who we are" title="The people running VexKan">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <PersonCard key={p.name} person={p} />
          ))}
        </div>
      </Section>

      <Section tone="surface" eyebrow="Our teams" title="Competing as VexKan">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {teams.map((t) => (
            <Card key={t.number}>
              <div className="flex items-center justify-between gap-2">
                <span className="readout text-xl font-semibold">{t.number}</span>
                <span
                  className="eyebrow rounded-full px-2.5 py-1"
                  style={
                    t.status === "active"
                      ? { background: "var(--teal-bg)", color: "var(--teal-text)" }
                      : { background: "var(--neutral-bg)", color: "var(--neutral-text)" }
                  }
                >
                  {t.status === "active" ? "Active" : "Past"}
                </span>
              </div>
              <p className="eyebrow mt-2 text-[var(--muted)]">{t.program}</p>
              <p className="mt-3 text-sm text-[var(--ink-body)]">{t.note}</p>
            </Card>
          ))}
        </div>

        <h3 className="mt-12 text-lg font-semibold">What we&apos;ve won</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {achievements.map((a) => (
            <li key={a} className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--purple)" }} aria-hidden="true" />
              <span className="text-[var(--ink-body)]">{a}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Next step" title="Come and build with us">
        <div className="flex flex-wrap gap-3">
          <Button href="/register" size="lg">Register your child</Button>
          <Button href="/contact" size="lg" variant="secondary">Ask us a question</Button>
        </div>
      </Section>
    </>
  );
}
```

- [ ] **Step 3: Verify**

Run `npm run build`. In the browser open `/about` and confirm all three leaders, all three team numbers, and the achievements list render, at 360px and 1280px.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(club\)/about src/components/club/PersonCard.tsx
git commit -m "Add the club about page"
```

---

### Task 8: Programs index and program detail pages

**Files:**
- Create: `src/app/(club)/programs/page.tsx`, `src/app/(club)/programs/[slug]/page.tsx`
- Create: `src/components/club/DetailRow.tsx`

**Interfaces:**
- Consumes: `programs`, `getProgram`, `programSlugs`, `programsByTrack`, `TRACK_LABELS`, `TRACK_ORDER`, `isTbd`, `TBD`.
- Produces: nothing consumed later.

**Next.js 16 note:** `params` is a Promise. Both `generateMetadata` and the page component must `await params`, exactly as `src/app/(guide)/guide/chapters/[slug]/page.tsx` does.

- [ ] **Step 1: Create `src/components/club/DetailRow.tsx`**

```tsx
import Link from "next/link";
import { isTbd } from "@/content/club/types";

/**
 * Renders a program fact, or the placeholder sentence with a route to ask,
 * so a parent never sees a blank where a fee or a time should be.
 */
export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b py-3 sm:flex-row sm:gap-6" style={{ borderColor: "var(--line)" }}>
      <dt className="eyebrow w-40 shrink-0 pt-1 text-[var(--muted)]">{label}</dt>
      <dd className="text-[var(--ink-body)]">
        {isTbd(value) ? (
          <Link href="/contact" className="underline decoration-dotted underline-offset-4 hover:opacity-80">
            {value}
          </Link>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/(club)/programs/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { org } from "@/content/club/org";
import { TRACK_LABELS, TRACK_ORDER, programsByTrack } from "@/content/club/programs";
import { Section } from "@/components/club/Section";
import { Card } from "@/components/club/Card";

export const metadata: Metadata = {
  title: `Programs — ${org.name}`,
  description:
    "VEX IQ Foundation Classes from Grade 1, VEX IQ and V5RC competition teams, and a summer camp.",
};

export default function ProgramsPage() {
  return (
    <>
      <Section
        eyebrow="Programs"
        title="What we run"
        lead="Foundation classes are where most clubbers start and are open to any student in the grade range. Competition teams are selected from those classes."
      />
      {TRACK_ORDER.map((track, i) => (
        <Section key={track} tone={i % 2 === 0 ? "surface" : "default"} title={TRACK_LABELS[track]}>
          <div className="grid gap-5 sm:grid-cols-2">
            {programsByTrack(track).map((p) => (
              <Card key={p.slug}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <span
                    className="eyebrow shrink-0 rounded-full px-2.5 py-1"
                    style={{ background: "var(--purple-bg)", color: "var(--purple-text)" }}
                  >
                    {p.gradeLabel}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted">{p.summary}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/programs/${p.slug}`}
                    className="text-sm font-semibold text-[var(--purple-text)] hover:underline"
                  >
                    Details
                  </Link>
                  <Link
                    href={`/register?program=${p.slug}`}
                    className="text-sm font-semibold text-[var(--ink-body)] hover:underline"
                  >
                    Register
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}
```

- [ ] **Step 3: Create `src/app/(club)/programs/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProgram, programSlugs, programsByTrack, TRACK_LABELS } from "@/content/club/programs";
import { org } from "@/content/club/org";
import { Section } from "@/components/club/Section";
import { Card } from "@/components/club/Card";
import { Button } from "@/components/club/Button";
import { DetailRow } from "@/components/club/DetailRow";

export function generateStaticParams() {
  return programSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) return {};
  return {
    title: `${program.title} (${program.gradeLabel}) — ${org.name}`,
    description: program.summary,
  };
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();

  const siblings = programsByTrack(program.track).filter((p) => p.slug !== program.slug);

  return (
    <>
      <div className="border-b" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <p className="eyebrow text-[var(--muted)]">
            <Link href="/programs" className="hover:underline">Programs</Link>
            {" · "}
            {TRACK_LABELS[program.track]}
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{program.title}</h1>
          <p className="club-lead mt-4 max-w-2xl">{program.summary}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href={`/register?program=${program.slug}`} size="lg">
              Register for this program
            </Button>
            <Button href="/contact" size="lg" variant="secondary">Ask a question</Button>
          </div>
        </div>
      </div>

      <Section tone="surface" title="About this program">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div>
            <p className="club-lead">{program.description}</p>

            <h3 className="mt-10 text-lg font-semibold">What clubbers learn</h3>
            <ul className="mt-4 space-y-3">
              {program.learn.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--purple)" }} aria-hidden="true" />
                  <span className="text-[var(--ink-body)]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Card>
              <h3 className="text-base font-semibold">At a glance</h3>
              <dl className="mt-3">
                <DetailRow label="Grades" value={program.gradeLabel} />
                <DetailRow label="Schedule" value={program.schedule} />
                <DetailRow label="Fees" value={program.fee} />
                {program.prerequisites && (
                  <DetailRow label="Entry" value={program.prerequisites} />
                )}
                <DetailRow label="Location" value={org.address} />
              </dl>
            </Card>
          </div>
        </div>
      </Section>

      {siblings.length > 0 && (
        <Section title={`Other ${TRACK_LABELS[program.track]}`}>
          <div className="grid gap-5 sm:grid-cols-3">
            {siblings.map((p) => (
              <Card key={p.slug}>
                <h3 className="text-base font-semibold">{p.shortTitle}</h3>
                <p className="eyebrow mt-1 text-[var(--muted)]">{p.gradeLabel}</p>
                <Link
                  href={`/programs/${p.slug}`}
                  className="mt-4 inline-block text-sm font-semibold text-[var(--purple-text)] hover:underline"
                >
                  Details
                </Link>
              </Card>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
```

- [ ] **Step 4: Verify all eight slugs build**

Run `npm run build`.
Expected: the route list shows eight prerendered `/programs/[slug]` entries.

Then in the browser check `/programs`, open `/programs/vex-iq-foundation-g1-2`, confirm Schedule and Fees show "Contact us for current details" as a link to `/contact`, and confirm `/programs/nonsense` returns a 404.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(club\)/programs src/components/club/DetailRow.tsx
git commit -m "Add the programs index and program detail pages"
```

---

### Task 9: Events page

**Files:**
- Create: `src/app/(club)/events/page.tsx`

**Interfaces:**
- Consumes: `events`, `teams`, `achievements`, `org`, `isTbd`, `Section`, `Card`, `Button`.

- [ ] **Step 1: Create `src/app/(club)/events/page.tsx`**

```tsx
import type { Metadata } from "next";
import { org } from "@/content/club/org";
import { achievements, events, teams } from "@/content/club/events";
import { isTbd } from "@/content/club/types";
import { Section } from "@/components/club/Section";
import { Card } from "@/components/club/Card";
import { Button } from "@/components/club/Button";

export const metadata: Metadata = {
  title: `Events & Results — ${org.name}`,
  description:
    "Regional VEX IQ and V5RC competitions VexKan teams attend, and how our teams have placed.",
};

export default function EventsPage() {
  const competitions = events.filter((e) => e.kind === "competition");
  const results = events.filter((e) => e.kind === "result");

  return (
    <>
      <Section
        eyebrow="Events"
        title="Where our teams compete"
        lead="Competition dates are set by the REC Foundation each season and change from year to year. Get in touch for the current calendar."
      />

      <Section tone="surface" title="Competitions">
        <div className="grid gap-5 sm:grid-cols-2">
          {competitions.map((e) => (
            <Card key={e.slug}>
              <h3 className="text-lg font-semibold">{e.name}</h3>
              <p className="mt-3 text-sm text-muted">{e.summary}</p>
              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex gap-3">
                  <dt className="eyebrow w-20 shrink-0 pt-0.5 text-[var(--muted)]">Date</dt>
                  <dd className={isTbd(e.date) ? "text-muted" : "text-[var(--ink-body)]"}>{e.date}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="eyebrow w-20 shrink-0 pt-0.5 text-[var(--muted)]">Location</dt>
                  <dd className={isTbd(e.location) ? "text-muted" : "text-[var(--ink-body)]"}>{e.location}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Results">
        <div className="grid gap-5 sm:grid-cols-2">
          {results.map((e) => (
            <Card key={e.slug}>
              <h3 className="text-lg font-semibold">{e.name}</h3>
              <p className="mt-3 text-[var(--ink-body)]">{e.summary}</p>
              {!isTbd(e.location) && (
                <p className="eyebrow mt-4 text-[var(--muted)]">{e.location}</p>
              )}
            </Card>
          ))}
        </div>

        <h3 className="mt-12 text-lg font-semibold">Club record</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {achievements.map((a) => (
            <li key={a} className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--purple)" }} aria-hidden="true" />
              <span className="text-[var(--ink-body)]">{a}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="surface" title="Our teams">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {teams.map((t) => (
            <Card key={t.number}>
              <span className="readout text-xl font-semibold">{t.number}</span>
              <p className="eyebrow mt-1 text-[var(--muted)]">
                {t.program} · {t.status === "active" ? "Active" : "Past"}
              </p>
              <p className="mt-3 text-sm text-[var(--ink-body)]">{t.note}</p>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <Button href="/register">Join a team</Button>
        </div>
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run `npm run build`, then open `/events` and confirm both competitions, the Worlds result, all three teams and the achievements render.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(club\)/events
git commit -m "Add the events and results page"
```

---

### Task 10: Contact page

**Files:**
- Create: `src/app/(club)/contact/page.tsx`

**Interfaces:**
- Consumes: `org`, `Section`, `Card`, `Button`.

- [ ] **Step 1: Create `src/app/(club)/contact/page.tsx`**

```tsx
import type { Metadata } from "next";
import { org } from "@/content/club/org";
import { Section } from "@/components/club/Section";
import { Card } from "@/components/club/Card";
import { Button } from "@/components/club/Button";

export const metadata: Metadata = {
  title: `Contact — ${org.name}`,
  description: `Reach ${org.name} by phone at ${org.phone} or email at ${org.email}. Based in ${org.address}.`,
};

export default function ContactPage() {
  return (
    <>
      <Section
        eyebrow="Contact"
        title="Get in touch"
        lead="Questions about a program, a schedule, or fees are welcome — those are the things we get asked most, and we answer them properly."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <Card>
            <p className="eyebrow text-[var(--muted)]">Phone</p>
            <a href={org.phoneHref} className="mt-2 block text-lg font-semibold hover:underline">
              {org.phone}
            </a>
            <p className="mt-2 text-sm text-muted">Best during our opening hours.</p>
          </Card>
          <Card>
            <p className="eyebrow text-[var(--muted)]">Email</p>
            <a href={org.emailHref} className="mt-2 block text-lg font-semibold break-all hover:underline">
              {org.email}
            </a>
            <p className="mt-2 text-sm text-muted">We usually reply within a couple of days.</p>
          </Card>
          <Card>
            <p className="eyebrow text-[var(--muted)]">Where we are</p>
            <p className="mt-2 text-lg font-semibold">{org.address}</p>
            <p className="mt-2 text-sm text-muted">
              Please arrange a visit before coming in.
            </p>
          </Card>
        </div>
      </Section>

      <Section tone="surface" title="Opening hours">
        <div className="max-w-md">
          <dl>
            {org.hours.map((h) => (
              <div
                key={h.days}
                className="flex items-baseline justify-between gap-6 border-b py-3"
                style={{ borderColor: "var(--line)" }}
              >
                <dt className="text-[var(--ink-body)]">{h.days}</dt>
                <dd className="readout font-medium">{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section title="Ready to sign up?">
        <p className="club-lead max-w-2xl">
          Registration takes about a minute. Tell us your child&apos;s grade and how to reach you,
          and we&apos;ll confirm the current schedule and answer any questions.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href="/register" size="lg">Register your child</Button>
          <Button href="/programs" size="lg" variant="secondary">Browse programs</Button>
        </div>
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run `npm run build`, open `/contact`, confirm the phone link dials and the email link opens a mail client, and that all three hour rows render.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(club\)/contact
git commit -m "Add the contact page"
```

---

### Task 11: Supabase schema for registrations

**Files:**
- Create: `supabase/migrations/0002_registrations.sql`

**Interfaces:**
- Consumes: nothing.
- Produces: tables `public.registrations` and `public.admins` with the column names Tasks 12–14 depend on.

- [ ] **Step 1: Create the migration**

```sql
-- VexKan club registrations.
--
-- This table holds identifying information about minors and their guardians,
-- so it collects the minimum needed to place a child in a class and nothing
-- more: no birthdates, no home addresses, no student contact details, and no
-- medical information.
--
-- The anon key ships in the browser by design, so row level security is what
-- actually protects these rows. There is deliberately no anonymous SELECT
-- policy: an anonymous client can submit a registration and can never read one
-- back, not even its own.

create table if not exists public.registrations (
  id             uuid        primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  program_slug   text        not null,
  student_first  text        not null,
  student_last   text        not null,
  student_grade  text        not null,
  guardian_name  text        not null,
  guardian_email text        not null,
  guardian_phone text        not null,
  notes          text,
  status         text        not null default 'new'
                 check (status in ('new', 'contacted', 'enrolled', 'withdrawn'))
);

create index if not exists registrations_created_idx on public.registrations (created_at desc);

-- Who may read registration data. Rows are added by SQL only; there is no
-- self-serve path into this table.
create table if not exists public.admins (
  user_id  uuid        primary key references auth.users on delete cascade,
  added_at timestamptz not null default now()
);

alter table public.registrations enable row level security;
alter table public.admins        enable row level security;

-- A policy on `admins` must not query `admins`, because Postgres raises on the
-- recursion rather than evaluating it. Letting a user read exactly their own
-- row is non-recursive and is all the client needs to ask "am I an admin".
drop policy if exists "see own admin row" on public.admins;
create policy "see own admin row"
  on public.admins for select
  using (user_id = auth.uid());

-- Anyone may submit a registration.
drop policy if exists "anyone can register" on public.registrations;
create policy "anyone can register"
  on public.registrations for insert
  to anon, authenticated
  with check (true);

-- Only admins may read, update or delete. Subquerying `admins` from a policy
-- on `registrations` is fine; only self-reference recurses.
drop policy if exists "admins read registrations" on public.registrations;
create policy "admins read registrations"
  on public.registrations for select
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "admins update registrations" on public.registrations;
create policy "admins update registrations"
  on public.registrations for update
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "admins delete registrations" on public.registrations;
create policy "admins delete registrations"
  on public.registrations for delete
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));
```

- [ ] **Step 2: Document how to become the first admin**

Append to the migration file:

```sql
-- To grant yourself access after signing up through /admin:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'admin@vexkan.ca';
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0002_registrations.sql
git commit -m "Add the registrations schema with admin-only reads"
```

---

### Task 12: Registration validation and CSV helpers

**Files:**
- Create: `src/lib/registration.ts`, `src/lib/registration.test.ts`

**Interfaces:**
- Consumes: `programSlugs` from Task 2.
- Produces: `RegistrationInput` type; `FieldErrors` type; `emptyRegistration(programSlug?): RegistrationInput`; `validateRegistration(input): FieldErrors`; `hasErrors(errors): boolean`; `RegistrationRow` type; `toCsv(rows): string`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/registration.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  emptyRegistration,
  hasErrors,
  toCsv,
  validateRegistration,
  type RegistrationRow,
} from "@/lib/registration";

function valid() {
  return {
    ...emptyRegistration("vex-iq-foundation-g1-2"),
    studentFirst: "Ada",
    studentLast: "Lovelace",
    studentGrade: "2",
    guardianName: "Anne Byron",
    guardianEmail: "anne@example.com",
    guardianPhone: "403-555-0134",
  };
}

describe("validateRegistration", () => {
  it("accepts a complete registration", () => {
    expect(hasErrors(validateRegistration(valid()))).toBe(false);
  });

  it("requires the student's name", () => {
    const errors = validateRegistration({ ...valid(), studentFirst: "  " });
    expect(errors.studentFirst).toBeTruthy();
  });

  it("rejects a program that does not exist", () => {
    const errors = validateRegistration({ ...valid(), programSlug: "made-up" });
    expect(errors.programSlug).toBeTruthy();
  });

  it("requires a program to be chosen", () => {
    const errors = validateRegistration({ ...valid(), programSlug: "" });
    expect(errors.programSlug).toBeTruthy();
  });

  it("rejects a malformed email", () => {
    expect(validateRegistration({ ...valid(), guardianEmail: "anne@" }).guardianEmail).toBeTruthy();
    expect(validateRegistration({ ...valid(), guardianEmail: "anne" }).guardianEmail).toBeTruthy();
  });

  it("accepts phone numbers in the formats parents actually type", () => {
    for (const phone of ["403-555-0134", "(403) 555-0134", "4035550134", "+1 403 555 0134"]) {
      expect(validateRegistration({ ...valid(), guardianPhone: phone }).guardianPhone).toBeUndefined();
    }
  });

  it("rejects a phone number with too few digits", () => {
    expect(validateRegistration({ ...valid(), guardianPhone: "55501" }).guardianPhone).toBeTruthy();
  });

  it("requires a grade", () => {
    expect(validateRegistration({ ...valid(), studentGrade: "" }).studentGrade).toBeTruthy();
  });

  it("caps notes so a paste cannot become a payload", () => {
    expect(validateRegistration({ ...valid(), notes: "x".repeat(1001) }).notes).toBeTruthy();
  });
});

describe("toCsv", () => {
  const row: RegistrationRow = {
    id: "1",
    created_at: "2026-08-09T12:00:00Z",
    program_slug: "vex-iq-foundation-g1-2",
    student_first: "Ada",
    student_last: "Lovelace",
    student_grade: "2",
    guardian_name: "Anne Byron",
    guardian_email: "anne@example.com",
    guardian_phone: "403-555-0134",
    notes: null,
    status: "new",
  };

  it("writes a header row", () => {
    expect(toCsv([]).trim()).toBe(
      "created_at,program_slug,student_first,student_last,student_grade,guardian_name,guardian_email,guardian_phone,status,notes"
    );
  });

  it("writes one line per registration", () => {
    expect(toCsv([row]).trim().split("\n")).toHaveLength(2);
  });

  it("quotes fields containing a comma", () => {
    expect(toCsv([{ ...row, notes: "Allergic to nuts, please note" }])).toContain(
      '"Allergic to nuts, please note"'
    );
  });

  it("escapes embedded quotes by doubling them", () => {
    expect(toCsv([{ ...row, guardian_name: 'Anne "Annie" Byron' }])).toContain(
      '"Anne ""Annie"" Byron"'
    );
  });

  it("quotes fields containing a newline", () => {
    expect(toCsv([{ ...row, notes: "line one\nline two" }])).toContain('"line one\nline two"');
  });

  it("renders a null note as an empty field", () => {
    expect(toCsv([row]).trim().endsWith(",")).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/registration`.

- [ ] **Step 3: Create `src/lib/registration.ts`**

```ts
import { programSlugs } from "@/content/club/programs";

export type RegistrationInput = {
  programSlug: string;
  studentFirst: string;
  studentLast: string;
  studentGrade: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  notes: string;
};

export type FieldErrors = Partial<Record<keyof RegistrationInput, string>>;

export function emptyRegistration(programSlug = ""): RegistrationInput {
  return {
    programSlug,
    studentFirst: "",
    studentLast: "",
    studentGrade: "",
    guardianName: "",
    guardianEmail: "",
    guardianPhone: "",
    notes: "",
  };
}

/**
 * Deliberately permissive. This form is filled in by a parent on a phone, and
 * a validator that argues about a plausible phone number costs the club a
 * registration. Anything ambiguous is accepted and sorted out in the reply.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const NOTES_MAX = 1000;

export function validateRegistration(input: RegistrationInput): FieldErrors {
  const errors: FieldErrors = {};
  const trim = (v: string) => v.trim();

  if (!trim(input.programSlug)) {
    errors.programSlug = "Choose a program.";
  } else if (!programSlugs().includes(trim(input.programSlug))) {
    errors.programSlug = "That program doesn't exist. Choose one from the list.";
  }

  if (!trim(input.studentFirst)) errors.studentFirst = "Enter the student's first name.";
  if (!trim(input.studentLast)) errors.studentLast = "Enter the student's last name.";
  if (!trim(input.studentGrade)) errors.studentGrade = "Choose the student's grade.";
  if (!trim(input.guardianName)) errors.guardianName = "Enter a parent or guardian's name.";

  const email = trim(input.guardianEmail);
  if (!email) {
    errors.guardianEmail = "Enter an email address so we can reply.";
  } else if (!EMAIL.test(email)) {
    errors.guardianEmail = "That doesn't look like an email address.";
  }

  const digits = trim(input.guardianPhone).replace(/\D/g, "");
  if (!digits) {
    errors.guardianPhone = "Enter a phone number.";
  } else if (digits.length < 10) {
    errors.guardianPhone = "Enter a full phone number, including the area code.";
  }

  if (input.notes.length > NOTES_MAX) {
    errors.notes = `Please keep this under ${NOTES_MAX} characters.`;
  }

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export type RegistrationRow = {
  id: string;
  created_at: string;
  program_slug: string;
  student_first: string;
  student_last: string;
  student_grade: string;
  guardian_name: string;
  guardian_email: string;
  guardian_phone: string;
  notes: string | null;
  status: string;
};

const CSV_COLUMNS = [
  "created_at",
  "program_slug",
  "student_first",
  "student_last",
  "student_grade",
  "guardian_name",
  "guardian_email",
  "guardian_phone",
  "status",
  "notes",
] as const satisfies readonly (keyof RegistrationRow)[];

/** Quotes only when a field would otherwise break the row. */
function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(rows: RegistrationRow[]): string {
  const lines = [CSV_COLUMNS.join(",")];
  for (const row of rows) {
    lines.push(CSV_COLUMNS.map((c) => escapeCsv(row[c] ?? "")).join(","));
  }
  return lines.join("\n") + "\n";
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — all registration tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/registration.ts src/lib/registration.test.ts
git commit -m "Add registration validation and CSV export helpers"
```

---

### Task 13: Registration page

**Files:**
- Create: `src/lib/registrationsApi.ts`, `src/app/(club)/register/page.tsx`, `src/app/(club)/register/RegisterForm.tsx`

**Interfaces:**
- Consumes: `getSupabase`, `isCloudConfigured` from `@/lib/supabase`; everything from `@/lib/registration`; `programs`, `getProgram`.
- Produces: `submitRegistration(input): Promise<{ ok: true } | { ok: false; message: string }>`; `listRegistrations()`; `updateRegistrationStatus(id, status)`; `deleteRegistration(id)` — the last three are used by Task 14.

**Next.js 16 note:** `useSearchParams` requires a `<Suspense>` boundary in a statically rendered page. The page wraps the form accordingly, or the build fails.

- [ ] **Step 1: Create `src/lib/registrationsApi.ts`**

```ts
import { getSupabase, isCloudConfigured } from "@/lib/supabase";
import type { RegistrationInput, RegistrationRow } from "@/lib/registration";

export const REGISTRATIONS_TABLE = "registrations";

export type SubmitResult = { ok: true } | { ok: false; message: string };

export async function submitRegistration(input: RegistrationInput): Promise<SubmitResult> {
  const sb = getSupabase();
  if (!sb) {
    return { ok: false, message: "Online registration isn't set up yet." };
  }

  const { error } = await sb.from(REGISTRATIONS_TABLE).insert({
    program_slug: input.programSlug.trim(),
    student_first: input.studentFirst.trim(),
    student_last: input.studentLast.trim(),
    student_grade: input.studentGrade.trim(),
    guardian_name: input.guardianName.trim(),
    guardian_email: input.guardianEmail.trim(),
    guardian_phone: input.guardianPhone.trim(),
    notes: input.notes.trim() || null,
  });

  if (error) {
    return {
      ok: false,
      message: "We couldn't save that. Please try again, or email us and we'll sign you up.",
    };
  }
  return { ok: true };
}

/** Admin only. Row level security refuses this for everyone else. */
export async function listRegistrations(): Promise<RegistrationRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from(REGISTRATIONS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as RegistrationRow[];
}

export async function isAdmin(): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) return false;
  const { data } = await sb.from("admins").select("user_id").eq("user_id", userData.user.id).maybeSingle();
  return Boolean(data);
}

export async function updateRegistrationStatus(id: string, status: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from(REGISTRATIONS_TABLE).update({ status }).eq("id", id);
  return !error;
}

export async function deleteRegistration(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from(REGISTRATIONS_TABLE).delete().eq("id", id);
  return !error;
}

export { isCloudConfigured };
```

- [ ] **Step 2: Create `src/app/(club)/register/RegisterForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { programs, getProgram } from "@/content/club/programs";
import { org } from "@/content/club/org";
import {
  emptyRegistration,
  hasErrors,
  validateRegistration,
  type FieldErrors,
  type RegistrationInput,
} from "@/lib/registration";
import { submitRegistration, isCloudConfigured } from "@/lib/registrationsApi";

const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const FIELD_CLASS =
  "mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-base bg-[var(--surface)] border";

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--ink-body)]">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-xs font-medium text-[var(--purple-text)]">
          {error}
        </span>
      )}
    </label>
  );
}

export function RegisterForm() {
  const params = useSearchParams();
  const preselected = params.get("program") ?? "";
  const initial = getProgram(preselected) ? preselected : "";

  const [form, setForm] = useState<RegistrationInput>(emptyRegistration(initial));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  /* Bots fill hidden fields; parents do not. */
  const [honeypot, setHoneypot] = useState("");
  const [openedAt] = useState(() => Date.now());

  function set<K extends keyof RegistrationInput>(key: K, value: RegistrationInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFailure(null);

    if (honeypot || Date.now() - openedAt < 2000) {
      setDone(true);
      return;
    }

    const found = validateRegistration(form);
    setErrors(found);
    if (hasErrors(found)) return;

    setSubmitting(true);
    const result = await submitRegistration(form);
    setSubmitting(false);

    if (result.ok) setDone(true);
    else setFailure(result.message);
  }

  if (done) {
    return (
      <div
        className="rounded-2xl p-8"
        style={{ background: "var(--teal-bg)", border: "1px solid var(--teal)" }}
      >
        <h2 className="text-xl font-semibold text-[var(--teal-text)]">Registration received</h2>
        <p className="mt-3 text-[var(--ink-body)]">
          Thank you. We&apos;ll be in touch at the email or phone number you gave us to confirm the
          schedule and answer any questions. If you don&apos;t hear from us within a few days,
          call {org.phone}.
        </p>
        <Link href="/programs" className="mt-6 inline-block font-semibold text-[var(--teal-text)] hover:underline">
          Back to programs
        </Link>
      </div>
    );
  }

  if (!isCloudConfigured) {
    const fallback = getProgram(form.programSlug)?.legacyFormUrl;
    return (
      <div className="rounded-2xl p-8" style={{ background: "var(--amber-bg)", border: "1px solid var(--amber)" }}>
        <h2 className="text-xl font-semibold text-[var(--amber-text)]">
          Online registration isn&apos;t switched on yet
        </h2>
        <p className="mt-3 text-[var(--ink-body)]">
          Please email <a className="underline" href={org.emailHref}>{org.email}</a> or call{" "}
          <a className="underline" href={org.phoneHref}>{org.phone}</a> and we&apos;ll sign your
          child up.
        </p>
        {fallback && (
          <p className="mt-3 text-[var(--ink-body)]">
            You can also use{" "}
            <a className="underline" href={fallback} target="_blank" rel="noopener noreferrer">
              our registration form
            </a>
            .
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-2xl">
      <div className="grid gap-5">
        <Field label="Program" error={errors.programSlug}>
          <select
            className={FIELD_CLASS}
            style={{ borderColor: "var(--line)" }}
            value={form.programSlug}
            onChange={(e) => set("programSlug", e.target.value)}
          >
            <option value="">Choose a program…</option>
            {programs.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.shortTitle} — {p.gradeLabel}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Student's first name" error={errors.studentFirst}>
            <input
              className={FIELD_CLASS}
              style={{ borderColor: "var(--line)" }}
              value={form.studentFirst}
              autoComplete="off"
              onChange={(e) => set("studentFirst", e.target.value)}
            />
          </Field>
          <Field label="Student's last name" error={errors.studentLast}>
            <input
              className={FIELD_CLASS}
              style={{ borderColor: "var(--line)" }}
              value={form.studentLast}
              autoComplete="off"
              onChange={(e) => set("studentLast", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Student's grade" error={errors.studentGrade}>
          <select
            className={FIELD_CLASS}
            style={{ borderColor: "var(--line)" }}
            value={form.studentGrade}
            onChange={(e) => set("studentGrade", e.target.value)}
          >
            <option value="">Choose a grade…</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>
        </Field>

        <Field label="Parent or guardian's name" error={errors.guardianName}>
          <input
            className={FIELD_CLASS}
            style={{ borderColor: "var(--line)" }}
            value={form.guardianName}
            autoComplete="name"
            onChange={(e) => set("guardianName", e.target.value)}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" error={errors.guardianEmail}>
            <input
              type="email"
              inputMode="email"
              className={FIELD_CLASS}
              style={{ borderColor: "var(--line)" }}
              value={form.guardianEmail}
              autoComplete="email"
              onChange={(e) => set("guardianEmail", e.target.value)}
            />
          </Field>
          <Field label="Phone" error={errors.guardianPhone}>
            <input
              type="tel"
              inputMode="tel"
              className={FIELD_CLASS}
              style={{ borderColor: "var(--line)" }}
              value={form.guardianPhone}
              autoComplete="tel"
              onChange={(e) => set("guardianPhone", e.target.value)}
            />
          </Field>
        </div>

        <Field
          label="Anything we should know?"
          error={errors.notes}
          hint="Optional. Previous robotics experience, or anything that would help us support your child."
        >
          <textarea
            rows={4}
            className={FIELD_CLASS}
            style={{ borderColor: "var(--line)" }}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>

        <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
          <label>
            Leave this field empty
            <input
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </label>
        </div>
      </div>

      {failure && (
        <p role="alert" className="mt-5 rounded-xl px-4 py-3 text-sm" style={{ background: "var(--purple-bg)", color: "var(--purple-text)" }}>
          {failure}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-7 rounded-xl px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: "var(--purple)" }}
      >
        {submitting ? "Sending…" : "Send registration"}
      </button>

      <p className="mt-4 text-xs text-muted">
        We use these details only to contact you about {org.name} programs. We don&apos;t share them
        with anyone, and you can ask us to delete them at any time by emailing{" "}
        <a className="underline" href={org.emailHref}>{org.email}</a>.
      </p>
    </form>
  );
}
```

- [ ] **Step 3: Create `src/app/(club)/register/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { org } from "@/content/club/org";
import { Section } from "@/components/club/Section";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: `Register — ${org.name}`,
  description: `Register a student for a ${org.name} robotics program in ${org.city}.`,
};

export default function RegisterPage() {
  return (
    <Section
      eyebrow="Register"
      title="Sign your child up"
      lead="Tell us which program and how to reach you. We'll confirm the current schedule and fees, and answer any questions before anything is committed."
    >
      {/* useSearchParams needs a Suspense boundary or the static build fails. */}
      <Suspense fallback={<p className="text-muted">Loading the form…</p>}>
        <RegisterForm />
      </Suspense>
    </Section>
  );
}
```

- [ ] **Step 4: Verify the build and the unconfigured path**

Run `npm run build` — expected: succeeds, `/register` prerenders.

With no `.env.local` present, open `/register` and confirm the amber "isn't switched on yet" panel appears rather than a broken form.

- [ ] **Step 5: Verify against a real Supabase project**

Create the project, run both migrations in the SQL editor, copy `.env.local.example` to `.env.local`, fill in the URL and anon key, and restart the dev server. Then:

1. Open `/register?program=v5rc-competition` and confirm V5RC is preselected.
2. Submit with every field blank and confirm inline errors appear and nothing is sent.
3. Enter `anne@` as the email and confirm the email error appears.
4. Fill the form correctly, wait more than two seconds, submit, and confirm the green success panel.
5. In the Supabase table editor, confirm the row exists with the values you typed.
6. In the browser console on `/register`, confirm an anonymous read is refused:

```js
await (await import("/_next/static/chunks/main-app.js"), window).fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/registrations?select=*`,
  { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY } }
).then((r) => r.json());
```

Simpler and equivalent: in the Supabase dashboard open the SQL editor, run `set role anon; select * from public.registrations;` and confirm it returns zero rows rather than the row you just inserted.

- [ ] **Step 6: Commit**

```bash
git add src/lib/registrationsApi.ts src/app/\(club\)/register
git commit -m "Add the registration form backed by Supabase"
```

---

### Task 14: Admin dashboard

**Files:**
- Create: `src/app/(club)/admin/page.tsx`, `src/app/(club)/admin/AdminDashboard.tsx`

**Interfaces:**
- Consumes: `listRegistrations`, `isAdmin`, `updateRegistrationStatus`, `deleteRegistration` from Task 13; `toCsv`, `RegistrationRow` from Task 12; `getProgram`; `downloadFile` — check `src/lib/download.ts` for the existing helper's exact signature and reuse it rather than writing a new one.

- [ ] **Step 1: Read the existing download helper**

```bash
cat src/lib/download.ts
```

Use whatever export it provides. If it does not offer a text-blob download, add one named `downloadText(filename: string, text: string, mime: string)` to that file rather than creating a second download module.

- [ ] **Step 2: Create `src/app/(club)/admin/AdminDashboard.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, isCloudConfigured } from "@/lib/supabase";
import { getProgram } from "@/content/club/programs";
import { toCsv, type RegistrationRow } from "@/lib/registration";
import {
  deleteRegistration,
  isAdmin,
  listRegistrations,
  updateRegistrationStatus,
} from "@/lib/registrationsApi";

const STATUSES = ["new", "contacted", "enrolled", "withdrawn"] as const;

type State = "loading" | "signed-out" | "not-admin" | "ready";

export function AdminDashboard() {
  const [state, setState] = useState<State>("loading");
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return setState("signed-out");

    const { data } = await sb.auth.getUser();
    if (!data.user) return setState("signed-out");

    if (!(await isAdmin())) return setState("not-admin");

    setRows(await listRegistrations());
    setState("ready");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
    setSent(true);
  }

  async function signOut() {
    await getSupabase()?.auth.signOut();
    setState("signed-out");
    setRows([]);
  }

  async function setStatus(id: string, status: string) {
    if (await updateRegistrationStatus(id, status)) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    }
  }

  async function remove(row: RegistrationRow) {
    const ok = window.confirm(
      `Permanently delete the registration for ${row.student_first} ${row.student_last}? This cannot be undone.`
    );
    if (!ok) return;
    if (await deleteRegistration(row.id)) {
      setRows((rs) => rs.filter((r) => r.id !== row.id));
    }
  }

  function exportCsv() {
    const blob = new Blob([toCsv(shown)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vexkan-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!isCloudConfigured) {
    return <p className="text-muted">Supabase isn&apos;t configured, so there is nothing to show.</p>;
  }

  if (state === "loading") return <p className="text-muted">Loading…</p>;

  if (state === "signed-out") {
    return (
      <form onSubmit={signIn} className="max-w-sm">
        <p className="text-sm text-muted">
          Sign in with the club email address to see registrations.
        </p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@vexkan.ca"
          className="mt-4 w-full rounded-xl border px-3.5 py-2.5"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        />
        <button
          type="submit"
          className="mt-3 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: "var(--purple)" }}
        >
          Email me a sign-in link
        </button>
        {sent && <p className="mt-3 text-sm text-[var(--teal-text)]">Check your inbox for the link.</p>}
      </form>
    );
  }

  if (state === "not-admin") {
    return (
      <div>
        <p className="text-[var(--ink-body)]">
          This account isn&apos;t an administrator, so it can&apos;t see registrations.
        </p>
        <button onClick={signOut} className="mt-4 text-sm font-semibold underline">
          Sign out
        </button>
      </div>
    );
  }

  const shown = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <option value="all">All ({rows.length})</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s} ({rows.filter((r) => r.status === s).length})
            </option>
          ))}
        </select>
        <button onClick={exportCsv} className="rounded-xl border px-4 py-2 text-sm font-semibold" style={{ borderColor: "var(--line)" }}>
          Export CSV
        </button>
        <button onClick={() => void load()} className="rounded-xl border px-4 py-2 text-sm font-semibold" style={{ borderColor: "var(--line)" }}>
          Refresh
        </button>
        <button onClick={signOut} className="ml-auto text-sm font-semibold underline">
          Sign out
        </button>
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 text-muted">No registrations yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="text-left">
                {["Received", "Student", "Grade", "Program", "Guardian", "Contact", "Status", ""].map((h) => (
                  <th key={h} className="eyebrow border-b py-2.5 pr-4 text-[var(--muted)]" style={{ borderColor: "var(--line)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="border-b align-top" style={{ borderColor: "var(--line)" }}>
                  <td className="readout py-3 pr-4 text-xs text-muted">{r.created_at.slice(0, 10)}</td>
                  <td className="py-3 pr-4 font-medium">{r.student_first} {r.student_last}</td>
                  <td className="readout py-3 pr-4">{r.student_grade}</td>
                  <td className="py-3 pr-4">{getProgram(r.program_slug)?.shortTitle ?? r.program_slug}</td>
                  <td className="py-3 pr-4">{r.guardian_name}</td>
                  <td className="py-3 pr-4">
                    <a href={`mailto:${r.guardian_email}`} className="block hover:underline">{r.guardian_email}</a>
                    <a href={`tel:${r.guardian_phone}`} className="block text-muted hover:underline">{r.guardian_phone}</a>
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={r.status}
                      onChange={(e) => void setStatus(r.id, e.target.value)}
                      className="rounded-lg border px-2 py-1 text-xs"
                      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3">
                    <button onClick={() => void remove(r)} className="text-xs font-semibold text-[var(--purple-text)] hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shown.some((r) => r.notes) && (
        <div className="mt-10">
          <h3 className="text-base font-semibold">Notes</h3>
          <ul className="mt-3 space-y-3">
            {shown.filter((r) => r.notes).map((r) => (
              <li key={r.id} className="text-sm">
                <span className="font-medium">{r.student_first} {r.student_last}:</span>{" "}
                <span className="text-[var(--ink-body)]">{r.notes}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app/(club)/admin/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Section } from "@/components/club/Section";
import { AdminDashboard } from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Registrations",
  /* Guardian contact details live behind this page. Keep it out of search. */
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Section eyebrow="Club admin" title="Registrations">
      <AdminDashboard />
    </Section>
  );
}
```

- [ ] **Step 4: Verify authorisation actually holds**

Run `npm run build`. Then, with Supabase configured:

1. Open `/admin` signed out — expect the sign-in form, no data.
2. Sign in with an email that has **no** row in `admins` — expect "isn't an administrator", and confirm in the network tab that the registrations request returned an empty array rather than rows.
3. Add your user to `admins`:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'admin@vexkan.ca';
```

4. Reload `/admin` — expect the table with the registration from Task 13.
5. Change a status and reload; confirm it persisted.
6. Export CSV and open it; confirm the header row and one data row.
7. Delete the test registration and confirm it disappears from the table and from Supabase.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(club\)/admin
git commit -m "Add the admin registrations dashboard"
```

---

### Task 15: Site metadata, sitemap, robots and 404

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/(club)/not-found.tsx`

**Interfaces:**
- Consumes: `programSlugs`, `org`.

- [ ] **Step 1: Read the metadata file conventions**

```bash
ls node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/
```

Read `sitemap.md` and `robots.md` before writing the two files below, and follow whatever return shape this version specifies.

- [ ] **Step 2: Create `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { programSlugs } from "@/content/club/programs";

const BASE = "https://vexkan.ca";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/programs", "/events", "/register", "/contact", "/guide"];
  const programs = programSlugs().map((slug) => `/programs/${slug}`);

  return [...pages, ...programs].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
  }));
}
```

- [ ] **Step 3: Create `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /* Guardian contact details are behind /admin. */
      disallow: "/admin",
    },
    sitemap: "https://vexkan.ca/sitemap.xml",
  };
}
```

- [ ] **Step 4: Create `src/app/(club)/not-found.tsx`**

```tsx
import { Button } from "@/components/club/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <p className="eyebrow text-[var(--muted)]">404</p>
      <h1 className="mt-2 text-3xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="club-lead mt-4">
        The link may be out of date. Our programs and contact details are a click away.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/programs">Browse programs</Button>
        <Button href="/" variant="secondary">Go home</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify**

Run `npm run build`, then confirm `/sitemap.xml` lists fifteen URLs, `/robots.txt` disallows `/admin`, and a nonsense URL renders the club 404.

- [ ] **Step 6: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts src/app/\(club\)/not-found.tsx
git commit -m "Add sitemap, robots and the club 404 page"
```

---

### Task 16: TODO list, deployment runbook and final verification

**Files:**
- Create: `src/content/club/TODO.md`, `DEPLOY.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: everything.

- [ ] **Step 1: Create `src/content/club/TODO.md`**

```markdown
# Content the club still needs to supply

Every item below currently renders as "Contact us for current details". Each is
a single edit in the file named.

## `programs.ts` — all eight programs

| Field | Programs affected | What to write |
| --- | --- | --- |
| `schedule` | all 8 | Day and time, e.g. `"Tuesdays, 6:00–8:00PM"` |
| `fee` | all 8 | Cost and period, e.g. `"$180 per term"`, or `"Free"` |
| `gradeLabel` | `summer-camp` | The grades the camp accepts |

## `events.ts`

| Field | Events affected | What to write |
| --- | --- | --- |
| `date` | both 2025 regionals | Competition date once the REC Foundation publishes it |
| `location` | both 2025 regionals | Venue and city |
| `date` | `worlds-dallas-595c` | The year 595C placed 7th |
| `achievements` | — | The old site said "two invitations" to Worlds. 595Y has since qualified, so confirm the real count and replace the word "Multiple". |
| `note` | `595Y` | Add the placing once the season's result is known |

Add new competitions by appending to the `events` array. Delete a season's
events once they are past, or change `kind` to `"result"` and rewrite the
summary with the placing.

## Photographs

`src/components/club/art/RobotHero.tsx` is a drawing standing in for a photo of
a real team. Replacing it with a 4:3 team photo needs no layout change.
`PersonCard` shows initials in place of headshots.
```

- [ ] **Step 2: Create `DEPLOY.md`**

```markdown
# Deploying vexkan.ca

## What is there now

| Thing | Where |
| --- | --- |
| Registrar | Go Daddy Domains Canada |
| Nameservers | `ns1.siteground.net`, `ns2.siteground.net` |
| Web server | `35.208.229.19` — SiteGround, WordPress + Elementor |
| Mail | Microsoft 365, `vexkan-ca.mail.protection.outlook.com` |
| SPF | `v=spf1 include:spf.protection.outlook.com -all` |

**DNS is managed at SiteGround, not GoDaddy**, because the nameservers point
there. Everything below happens in SiteGround's DNS zone editor.

## The rule that matters

**Do not move the nameservers to Vercel.** The `MX` and SPF records that make
`admin@vexkan.ca` work live in the SiteGround zone. Repointing nameservers
abandons that zone, and club email stops arriving with no error anywhere. Change
only the `A` and `CNAME` records for the website itself.

## Steps

1. Push this repository to GitHub.
2. In Vercel, import the repository. Framework preset: Next.js. Build command
   and output directory: leave as the defaults.
3. In Vercel project settings, add environment variables for Production:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy, and test the `*.vercel.app` URL end to end: every page loads, a real
   registration submits, and `/admin` shows it.
5. In Vercel, add the domains `vexkan.ca` and `www.vexkan.ca`. Vercel shows the
   exact records to create — read them from the dashboard rather than assuming,
   as the values change.
6. In SiteGround's DNS zone editor for vexkan.ca:
   - Change the apex `A` record from `35.208.229.19` to the address Vercel gives.
   - Point `www` at the target Vercel gives.
   - **Change nothing else.** Leave every `MX` record and the SPF `TXT` record
     exactly as they are.
7. Wait for propagation, then verify:

   ```bash
   dig +short vexkan.ca A
   dig +short vexkan.ca MX
   curl -sSI https://vexkan.ca | head -1
   ```

   The `A` record should show Vercel's address, the `MX` record must still show
   `vexkan-ca.mail.protection.outlook.com`, and the status line should be `200`.
8. Send a test email to `admin@vexkan.ca` from an outside account and confirm it
   arrives. Do this the same day.
9. Leave the WordPress install in place but unpublished for a couple of weeks.

## Rolling back

Set the apex `A` record back to `35.208.229.19` and restore the previous `www`
record. WordPress starts serving again as soon as DNS propagates.

## Supabase

1. Create a project at https://supabase.com.
2. In the SQL editor run `supabase/migrations/0001_init.sql`, then
   `supabase/migrations/0002_registrations.sql`.
3. Copy the Project URL and the anon public key into Vercel's environment
   variables.
4. Visit `/admin`, request a sign-in link for the club address, then grant it
   access:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'admin@vexkan.ca';
   ```

The anon key is meant to be public. Row level security is what protects
registration data, and the policies are in the migration.
```

- [ ] **Step 3: Update `README.md`**

Add a section after the opening paragraph explaining that the repository now
serves two things: the club site at the root, and the field guide under
`/guide`. Point at `DEPLOY.md` for deployment and `src/content/club/TODO.md`
for the content gaps. Keep the existing sign-in and layout sections, updating
the `src/app` paths to reflect the route groups.

- [ ] **Step 4: Full verification pass**

```bash
npm test
npm run lint
npm run build
```

All three must pass with no errors. Then in the browser, at 360px, 768px and
1280px, walk every route:

`/`, `/about`, `/programs`, all eight `/programs/<slug>`, `/events`,
`/register`, `/contact`, `/admin`, `/guide`, `/guide/chapters`, a chapter,
`/guide/tools`, `/guide/tools/gear-ratio`, `/guide/ask`, `/guide/seasons`, and a
nonsense URL.

For each: no console errors, no horizontal scroll, header and footer correct for
that route group, and every link resolving. Tab through the home page and the
register form and confirm focus is always visible.

- [ ] **Step 5: Commit**

```bash
git add README.md DEPLOY.md src/content/club/TODO.md
git commit -m "Add the deployment runbook and the outstanding content list"
```

---

## Self-Review

**Spec coverage:** Architecture and route groups → Task 4. Content modules → Tasks 1–3. Visual design → Task 5. Home/About/Programs/Events/Contact → Tasks 6–10. Registration schema, RLS, validation, form, dashboard → Tasks 11–14. Metadata and sitemap → Task 15. Unknown values and `TODO.md` → Tasks 1, 2, 16. Deployment → Task 16. Testing → each task's verify step plus Task 16 Step 4.

**Type consistency:** `Program.shortTitle`, `Program.gradeLabel`, `Program.legacyFormUrl` are defined in Task 2 and used in Tasks 5, 6, 8, 13, 14. `RegistrationRow` field names are defined in Task 12 and match the SQL columns in Task 11 exactly. `isTbd` is defined in Task 1 and used in Tasks 8 and 9. `TRACK_ORDER` is defined in Task 2 and used in Tasks 6 and 8.

**Checked, not changed:** `@theme inline` in `globals.css` maps `--font-mono: var(--font-mono)`, which reads as self-referential. It was verified in the running app before this plan was written: next/font declares `--font-mono` through a class on `<html>`, that declaration outranks the `:root` one from `@theme`, and `--font-mono` resolves to `"IBM Plex Mono"` with `.eyebrow` rendering in it. No change is needed and the plan makes none.

**Placeholder scan:** the only `TBD` strings are the deliberate `TBD` content constant from Task 1 and the entries it generates in `TODO.md`. No task contains an unresolved instruction.
