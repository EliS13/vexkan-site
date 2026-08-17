import { describe, it, expect } from "vitest";
import { clientIp, matchesRule } from "./network";

describe("clientIp", () => {
  it("takes the first entry of x-forwarded-for, not the proxy hops", () => {
    const h = new Headers({ "x-forwarded-for": "24.108.5.9, 10.0.0.1, 172.16.0.4" });
    expect(clientIp(h)).toBe("24.108.5.9");
  });

  it("falls back to x-real-ip", () => {
    expect(clientIp(new Headers({ "x-real-ip": "24.108.5.9" }))).toBe("24.108.5.9");
  });

  it("is null when the platform reports nothing", () => {
    expect(clientIp(new Headers())).toBeNull();
  });
});

describe("matchesRule", () => {
  it("matches an exact address", () => {
    expect(matchesRule("24.108.5.9", "24.108.5.9")).toBe(true);
    expect(matchesRule("24.108.5.10", "24.108.5.9")).toBe(false);
  });

  it("matches inside a CIDR block", () => {
    expect(matchesRule("24.108.5.9", "24.108.0.0/16")).toBe(true);
    expect(matchesRule("24.108.255.254", "24.108.0.0/16")).toBe(true);
  });

  it("rejects an address outside the block", () => {
    expect(matchesRule("24.109.0.1", "24.108.0.0/16")).toBe(false);
  });

  it("handles a /32 as a single host", () => {
    expect(matchesRule("24.108.5.9", "24.108.5.9/32")).toBe(true);
    expect(matchesRule("24.108.5.8", "24.108.5.9/32")).toBe(false);
  });

  it("treats /0 as everything rather than shifting by 32", () => {
    expect(matchesRule("8.8.8.8", "0.0.0.0/0")).toBe(true);
  });

  it("refuses malformed rules and addresses instead of throwing", () => {
    expect(matchesRule("24.108.5.9", "24.108.0.0/99")).toBe(false);
    expect(matchesRule("not-an-ip", "24.108.0.0/16")).toBe(false);
    expect(matchesRule("24.108.5.999", "24.108.0.0/16")).toBe(false);
  });

  it("does not match an IPv6 address against an IPv4 rule", () => {
    expect(matchesRule("2001:db8::1", "24.108.0.0/16")).toBe(false);
  });
});
