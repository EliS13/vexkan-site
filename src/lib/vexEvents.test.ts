import { describe, expect, it } from "vitest";
import {
  formatDateRange,
  formatLocation,
  formatPlace,
  featureBothPrograms,
  programFamily,
  remainingAfterFeature,
  mapVexEvent,
  upcomingFirst,
} from "@/lib/vexEvents";

describe("formatDateRange", () => {
  it("formats a two-day event inside one month", () => {
    expect(formatDateRange("2027-02-13T09:00:00Z", "2027-02-14T18:00:00Z")).toBe(
      "13 to 14 February 2027"
    );
  });

  it("formats a single-day event", () => {
    expect(formatDateRange("2027-02-13T09:00:00Z", "2027-02-13T18:00:00Z")).toBe(
      "13 February 2027"
    );
  });

  it("spans a month boundary", () => {
    expect(formatDateRange("2027-01-30T09:00:00Z", "2027-02-01T18:00:00Z")).toBe(
      "30 January 2027 to 1 February 2027"
    );
  });

  /* A missing or unparseable date must say so, never render "Invalid Date". */
  it("says so when there is no usable date", () => {
    expect(formatDateRange(undefined)).toBe("Dates to be confirmed");
    expect(formatDateRange("not-a-date")).toBe("Dates to be confirmed");
  });
});

describe("formatLocation", () => {
  it("uses venue and city", () => {
    expect(formatLocation({ venue: "BMO Centre", city: "Calgary", region: "Alberta" })).toBe(
      "BMO Centre, Calgary"
    );
  });

  it("copes with a partial location", () => {
    expect(formatLocation({ city: "Calgary" })).toBe("Calgary");
    expect(formatLocation(undefined)).toBe("Location to be confirmed");
    expect(formatLocation({})).toBe("Location to be confirmed");
  });
});

describe("formatPlace", () => {
  /* Signature Events run worldwide, so the country is the deciding detail. */
  it("gives city and country, not the venue", () => {
    expect(
      formatPlace({ venue: "BMO Centre", city: "Calgary", region: "Alberta", country: "Canada" })
    ).toBe("Calgary, Canada");
  });

  it("copes with a partial location", () => {
    expect(formatPlace({ country: "Canada" })).toBe("Canada");
    expect(formatPlace(undefined)).toBe("Location to be confirmed");
  });
});

describe("mapVexEvent", () => {
  const raw = {
    id: 4357,
    sku: "RE-VURC-26-4357",
    name: "Mecha Mayhem 2027 Signature Event",
    start: "2027-02-13T09:00:00Z",
    end: "2027-02-14T18:00:00Z",
    program: { name: "VEX U Robotics Competition", code: "VURC" },
    location: { venue: "BMO Centre", city: "Calgary", region: "Alberta", country: "Canada" },
  };

  it("maps an event to what the page renders", () => {
    const e = mapVexEvent(raw);
    expect(e.id).toBe("RE-VURC-26-4357");
    expect(e.name).toBe("Mecha Mayhem 2027 Signature Event");
    expect(e.program).toBe("VURC");
    expect(e.dates).toBe("13 to 14 February 2027");
    expect(e.location).toBe("BMO Centre, Calgary");
    expect(e.place).toBe("Calgary, Canada");
    expect(e.url).toContain("RE-VURC-26-4357");
  });

  it("falls back to the program name when there is no code", () => {
    expect(mapVexEvent({ ...raw, program: { name: "VEX IQ" } }).program).toBe("VEX IQ");
  });

  /* A sparse event must still render rather than throwing mid-page. */
  it("survives an event missing everything optional", () => {
    const e = mapVexEvent({ id: 1, sku: "RE-1", name: "Unnamed" });
    expect(e.dates).toBe("Dates to be confirmed");
    expect(e.location).toBe("Location to be confirmed");
    expect(e.program).toBe("VEX");
  });
});

describe("upcomingFirst", () => {
  const at = (startsAt: string, id = startsAt) =>
    ({ id, name: id, program: "V5RC", dates: "", location: "", place: "", url: "", startsAt });

  it("drops events that already finished", () => {
    const out = upcomingFirst(
      [at("2020-01-01T00:00:00Z"), at("2027-02-13T00:00:00Z")],
      new Date("2026-08-09T00:00:00Z")
    );
    expect(out.map((e) => e.id)).toEqual(["2027-02-13T00:00:00Z"]);
  });

  it("puts the soonest event first", () => {
    const out = upcomingFirst(
      [at("2027-05-01T00:00:00Z"), at("2027-02-13T00:00:00Z"), at("2027-03-01T00:00:00Z")],
      new Date("2026-08-09T00:00:00Z")
    );
    expect(out.map((e) => e.id)).toEqual([
      "2027-02-13T00:00:00Z",
      "2027-03-01T00:00:00Z",
      "2027-05-01T00:00:00Z",
    ]);
  });

  it("keeps an event running today", () => {
    const out = upcomingFirst([at("2026-08-09T00:00:00Z")], new Date("2026-08-09T18:00:00Z"));
    expect(out).toHaveLength(1);
  });

  it("keeps an event with no date rather than silently dropping it", () => {
    expect(upcomingFirst([at("", "no-date")], new Date("2026-08-09T00:00:00Z"))).toHaveLength(1);
  });
});

describe("featureBothPrograms", () => {
  const ev = (id: string, program: string, startsAt: string) => ({
    id, name: id, program, dates: "", location: "", place: "", url: "", startsAt,
  });

  /*
   * The case this exists for: chronology alone would show two V5RC events and
   * tell a VEX IQ family the club only travels for the older students.
   */
  it("shows one of each program when both exist", () => {
    const featured = featureBothPrograms([
      ev("v5-a", "V5RC", "2027-01-01T00:00:00Z"),
      ev("v5-b", "V5RC", "2027-02-01T00:00:00Z"),
      ev("iq-a", "VIQRC", "2027-06-01T00:00:00Z"),
    ]);
    expect(featured.map((e) => e.id).sort()).toEqual(["iq-a", "v5-a"]);
  });

  it("keeps the featured pair in date order", () => {
    const featured = featureBothPrograms([
      ev("iq-a", "VIQRC", "2027-06-01T00:00:00Z"),
      ev("v5-a", "V5RC", "2027-01-01T00:00:00Z"),
    ]);
    expect(featured.map((e) => e.id)).toEqual(["v5-a", "iq-a"]);
  });

  it("falls back to date order when only one program is running", () => {
    const featured = featureBothPrograms([
      ev("v5-a", "V5RC", "2027-01-01T00:00:00Z"),
      ev("v5-b", "V5RC", "2027-02-01T00:00:00Z"),
      ev("v5-c", "V5RC", "2027-03-01T00:00:00Z"),
    ]);
    expect(featured.map((e) => e.id)).toEqual(["v5-a", "v5-b"]);
  });

  it("never duplicates an event", () => {
    const featured = featureBothPrograms([ev("only", "V5RC", "2027-01-01T00:00:00Z")]);
    expect(featured).toHaveLength(1);
  });

  it("treats VURC as the V5 side, not IQ", () => {
    expect(programFamily("VURC")).toBe("v5");
    expect(programFamily("V5RC")).toBe("v5");
    expect(programFamily("VIQRC")).toBe("iq");
    expect(programFamily("VEX IQ")).toBe("iq");
  });
});

describe("remainingAfterFeature", () => {
  const ev = (id: string) => ({
    id, name: id, program: "V5RC", dates: "", location: "", place: "", url: "", startsAt: "",
  });

  it("returns everything not featured, and nothing twice", () => {
    const all = [ev("a"), ev("b"), ev("c")];
    expect(remainingAfterFeature(all, [all[0], all[2]]).map((e) => e.id)).toEqual(["b"]);
  });

  it("returns all of them when nothing is featured", () => {
    const all = [ev("a"), ev("b")];
    expect(remainingAfterFeature(all, [])).toHaveLength(2);
  });
});
