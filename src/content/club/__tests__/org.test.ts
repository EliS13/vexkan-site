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
