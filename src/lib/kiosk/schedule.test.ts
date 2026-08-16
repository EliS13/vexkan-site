import { describe, it, expect } from "vitest";
import {
  clubTimeParts,
  describeSchedule,
  formatClockTime,
  minutesUntilStart,
  orderGroups,
  parseClockTime,
  phaseFor,
  CLUB_TIMEZONE,
} from "./schedule";
import type { Group } from "./types";

/**
 * Instants are written in UTC and asserted in club time. Alberta is UTC-6 in
 * summer and UTC-7 in winter, so the two fixtures below deliberately sit on
 * either side of the change: if the timezone handling ever regresses to naive
 * arithmetic, one of them breaks.
 */
const TUE_1628_MDT = Date.parse("2026-08-18T22:28:00.000Z"); // Tue 16:28 in Edmonton (UTC-6)
const TUE_1700_MDT = Date.parse("2026-08-18T23:00:00.000Z"); // Tue 17:00
const TUE_1820_MDT = Date.parse("2026-08-19T00:20:00.000Z"); // Tue 18:20, inside the straggler window
const TUE_1845_MDT = Date.parse("2026-08-19T00:45:00.000Z"); // Tue 18:45, past it
const TUE_2200_MDT = Date.parse("2026-08-19T04:00:00.000Z"); // Tue 22:00
const WED_0900_MDT = Date.parse("2026-08-19T15:00:00.000Z"); // Wed 09:00
const TUE_1628_MST = Date.parse("2026-01-20T23:28:00.000Z"); // Tue 16:28 in winter (UTC-7)

function group(name: string, meetsOn: number[], startsAt: string, endsAt: string): Group {
  return {
    id: `g-${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    meetsOn,
    startsAt,
    endsAt,
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

const TUE = 2;
const THU = 4;

describe("parseClockTime", () => {
  it.each([
    ["16:30", 990],
    ["00:00", 0],
    ["9:05", 545],
    ["23:59", 1439],
  ])("reads %s as %i minutes", (input, expected) => {
    expect(parseClockTime(input)).toBe(expected);
  });

  it.each(["", "nonsense", "25:00", "16:75", "1630"])("rejects %s", (input) => {
    expect(parseClockTime(input)).toBeNaN();
  });
});

describe("formatClockTime", () => {
  it.each([
    [990, "4:30pm"],
    [960, "4pm"],
    [0, "12am"],
    [720, "12pm"],
    [545, "9:05am"],
  ])("formats %i as %s", (minutes, expected) => {
    expect(formatClockTime(minutes)).toBe(expected);
  });
});

describe("clubTimeParts", () => {
  it("reads the wall clock in the club's timezone, not UTC", () => {
    // 22:28 UTC is already Wednesday in some zones but is Tuesday afternoon here.
    expect(clubTimeParts(TUE_1628_MDT, CLUB_TIMEZONE)).toEqual({ weekday: TUE, minutes: 988 });
  });

  it("follows daylight saving rather than a fixed offset", () => {
    // Same wall-clock time, six months apart, one hour different in UTC.
    expect(clubTimeParts(TUE_1628_MST, CLUB_TIMEZONE)).toEqual({ weekday: TUE, minutes: 988 });
  });
});

describe("minutesUntilStart", () => {
  const tuesdays = group("IQ Foundation", [TUE], "16:30", "18:00");

  it("counts down to a start later the same day", () => {
    expect(minutesUntilStart(tuesdays, TUE_1628_MDT)).toBe(2);
  });

  it("goes negative once the group is running", () => {
    expect(minutesUntilStart(tuesdays, TUE_1700_MDT)).toBe(-30);
  });

  it("rolls to next week once today's slot has passed", () => {
    // Tuesday 22:00 (1320). Next Tuesday 16:30 (990) is a full week on, less
    // the 5.5 hours already past today: 7*1440 + 990 - 1320.
    expect(minutesUntilStart(tuesdays, TUE_2200_MDT)).toBe(7 * 1440 + 990 - 1320);
  });

  it("picks the nearest of several meeting days", () => {
    const twice = group("V5RC", [TUE, THU], "16:30", "18:00");
    // Wednesday morning: Thursday is nearer than next Tuesday.
    expect(minutesUntilStart(twice, WED_0900_MDT)).toBe(1440 + 990 - 540);
  });

  it("is Infinity for a group with no meeting days", () => {
    expect(minutesUntilStart(group("Drop in", [], "16:30", "18:00"), TUE_1628_MDT)).toBe(Infinity);
  });
});

describe("phaseFor", () => {
  const tuesdays = group("IQ Foundation", [TUE], "16:30", "18:00");

  it("is in-session between start and end", () => {
    expect(phaseFor(tuesdays, TUE_1700_MDT)).toBe("in-session");
  });

  it("is starting-soon just before the start", () => {
    expect(phaseFor(tuesdays, TUE_1628_MDT)).toBe("starting-soon");
  });

  it("is just-ended shortly after the end, while people are still packing up", () => {
    expect(phaseFor(tuesdays, TUE_1820_MDT)).toBe("just-ended");
  });

  it("stops being just-ended once the straggler window closes", () => {
    // 18:45 is 45 minutes past an 18:00 finish, outside the 30-minute window.
    expect(phaseFor(tuesdays, TUE_1845_MDT)).toBe("scheduled");
  });

  it("falls back to scheduled long after it finished", () => {
    expect(phaseFor(tuesdays, TUE_2200_MDT)).toBe("scheduled");
  });

  it("is later-today when it meets today but not for hours", () => {
    const evening = group("Evening build", [TUE], "19:00", "21:00");
    expect(phaseFor(evening, TUE_1628_MDT)).toBe("later-today");
  });

  it("is scheduled for a group that does not meet today", () => {
    expect(phaseFor(group("Thursday only", [THU], "16:30", "18:00"), TUE_1700_MDT)).toBe(
      "scheduled",
    );
  });

  it("is scheduled when the times are unusable", () => {
    expect(phaseFor(group("Broken", [TUE], "nonsense", "18:00"), TUE_1700_MDT)).toBe("scheduled");
  });
});

describe("orderGroups", () => {
  it("puts the group in session first, then the one about to start", () => {
    const groups = [
      group("Evening build", [TUE], "19:00", "21:00"),
      group("Thursday only", [THU], "16:30", "18:00"),
      group("Running now", [TUE], "16:00", "18:00"),
      group("Starts at 4:45", [TUE], "16:45", "18:30"),
    ];
    // Tuesday 16:28: "Running now" started at 16:00, "Starts at 4:45" is 17m away.
    expect(orderGroups(groups, TUE_1628_MDT).map((s) => s.group.name)).toEqual([
      "Running now",
      "Starts at 4:45",
      "Evening build",
      "Thursday only",
    ]);
  });

  it("orders two soon-to-start groups by which is sooner", () => {
    const groups = [
      group("Later", [TUE], "17:00", "18:00"),
      group("Sooner", [TUE], "16:40", "17:40"),
    ];
    expect(orderGroups(groups, TUE_1628_MDT).map((s) => s.group.name)).toEqual([
      "Sooner",
      "Later",
    ]);
  });

  it("leaves deactivated groups out entirely", () => {
    const hidden = { ...group("Retired", [TUE], "16:30", "18:00"), active: false };
    expect(orderGroups([hidden], TUE_1628_MDT)).toEqual([]);
  });

  it("breaks exact ties by name so the order does not jitter", () => {
    const groups = [
      group("Beta", [TUE], "16:45", "18:00"),
      group("Alpha", [TUE], "16:45", "18:00"),
    ];
    expect(orderGroups(groups, TUE_1628_MDT).map((s) => s.group.name)).toEqual(["Alpha", "Beta"]);
  });

  it("reports the phase alongside each group", () => {
    const standings = orderGroups([group("Running now", [TUE], "16:00", "18:00")], TUE_1628_MDT);
    expect(standings[0]).toMatchObject({ phase: "in-session", minutesUntilStart: -28 });
  });
});

describe("describeSchedule", () => {
  it("lists days and the time range", () => {
    expect(describeSchedule(group("V5RC", [TUE, THU], "16:30", "18:00"))).toBe(
      "Tue, Thu 4:30pm–6pm",
    );
  });

  it("sorts the days regardless of how they were entered", () => {
    expect(describeSchedule(group("V5RC", [THU, TUE], "16:30", "18:00"))).toContain("Tue, Thu");
  });

  it("says so when there is no fixed time", () => {
    expect(describeSchedule(group("Drop in", [], "16:30", "18:00"))).toBe("No set time");
  });
});
