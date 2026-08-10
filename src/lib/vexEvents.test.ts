import { describe, expect, it } from "vitest";
import { formatDateRange, formatLocation, mapVexEvent, upcomingFirst } from "@/lib/vexEvents";

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

describe("mapVexEvent", () => {
  const raw = {
    id: 4357,
    sku: "RE-VURC-26-4357",
    name: "Mecha Mayhem 2027 Signature Event",
    start: "2027-02-13T09:00:00Z",
    end: "2027-02-14T18:00:00Z",
    program: { name: "VEX U Robotics Competition", code: "VURC" },
    location: { venue: "BMO Centre", city: "Calgary", region: "Alberta" },
  };

  it("maps an event to what the page renders", () => {
    const e = mapVexEvent(raw);
    expect(e.id).toBe("RE-VURC-26-4357");
    expect(e.name).toBe("Mecha Mayhem 2027 Signature Event");
    expect(e.program).toBe("VURC");
    expect(e.dates).toBe("13 to 14 February 2027");
    expect(e.location).toBe("BMO Centre, Calgary");
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
    ({ id, name: id, program: "V5RC", dates: "", location: "", url: "", startsAt });

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
