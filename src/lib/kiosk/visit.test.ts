import { describe, it, expect, afterEach } from "vitest";
import { VISIT_MAX_AGE_S, mintVisit, verifyVisit } from "./visit";

const HOUR = 60 * 60 * 1000;

afterEach(() => {
  delete process.env.KIOSK_MEMBER_CODE;
  delete process.env.KIOSK_ADMIN_PASSCODE;
});

describe("the visitor's cookie", () => {
  it("verifies the grant it just issued", () => {
    process.env.KIOSK_MEMBER_CODE = "4821";
    const now = Date.now();
    expect(verifyVisit(mintVisit(now), now + HOUR)).toBe(true);
  });

  it("refuses a value somebody typed themselves", () => {
    process.env.KIOSK_MEMBER_CODE = "4821";
    const now = Date.now();
    expect(verifyVisit("1", now)).toBe(false);
    expect(verifyVisit(`${now + HOUR}.`, now)).toBe(false);
    expect(verifyVisit(`${now + HOUR}.deadbeef`, now)).toBe(false);
    expect(verifyVisit(undefined, now)).toBe(false);
  });

  it("refuses a grant whose expiry was edited forward", () => {
    process.env.KIOSK_MEMBER_CODE = "4821";
    const now = Date.now();
    const token = mintVisit(now);
    const signature = token.slice(token.indexOf(".") + 1);
    expect(verifyVisit(`${now + 400 * 24 * HOUR}.${signature}`, now)).toBe(false);
  });

  it("runs out on its own, however long the browser keeps it", () => {
    process.env.KIOSK_MEMBER_CODE = "4821";
    const now = Date.now();
    const token = mintVisit(now);
    expect(verifyVisit(token, now + VISIT_MAX_AGE_S * 1000 - HOUR)).toBe(true);
    expect(verifyVisit(token, now + VISIT_MAX_AGE_S * 1000 + HOUR)).toBe(false);
  });

  it("stops verifying when the club code is changed", () => {
    process.env.KIOSK_MEMBER_CODE = "4821";
    const now = Date.now();
    const token = mintVisit(now);

    process.env.KIOSK_MEMBER_CODE = "9137";
    expect(verifyVisit(token, now + HOUR)).toBe(false);
  });

  it("still remembers a visitor when no code is configured at all", () => {
    const now = Date.now();
    expect(verifyVisit(mintVisit(now), now + HOUR)).toBe(true);
  });
});
