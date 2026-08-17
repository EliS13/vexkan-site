import { describe, it, expect } from "vitest";
import { checkMemberCode, isMemberCodeRequired, nameMatches } from "./admin";

describe("the members' code", () => {
  it("is off until KIOSK_MEMBER_CODE is set", () => {
    delete process.env.KIOSK_MEMBER_CODE;
    expect(isMemberCodeRequired()).toBe(false);
    expect(checkMemberCode("anything")).toBe(false);
  });

  it("accepts the code administration gave out", () => {
    process.env.KIOSK_MEMBER_CODE = "4821";
    expect(checkMemberCode("4821")).toBe(true);
    expect(checkMemberCode("4822")).toBe(false);
    expect(checkMemberCode("")).toBe(false);
    delete process.env.KIOSK_MEMBER_CODE;
  });

  it("also accepts the organizer passcode, so a coach is never locked out", () => {
    process.env.KIOSK_MEMBER_CODE = "4821";
    process.env.KIOSK_ADMIN_PASSCODE = "let-me-in";
    expect(checkMemberCode("let-me-in")).toBe(true);
    delete process.env.KIOSK_MEMBER_CODE;
    delete process.env.KIOSK_ADMIN_PASSCODE;
  });

  it("does not leak the admin passcode through a length comparison", () => {
    process.env.KIOSK_MEMBER_CODE = "4821";
    expect(checkMemberCode("48210")).toBe(false);
    delete process.env.KIOSK_MEMBER_CODE;
  });
});

describe("nameMatches", () => {
  it("accepts the member's own first name, however it was typed", () => {
    expect(nameMatches("michael", "Michael")).toBe(true);
    expect(nameMatches("  MICHAEL ", "Michael")).toBe(true);
  });

  it("refuses somebody else's name", () => {
    expect(nameMatches("Michael", "Cyrus")).toBe(false);
    expect(nameMatches("", "Cyrus")).toBe(false);
    expect(nameMatches(undefined, "Cyrus")).toBe(false);
  });
});
