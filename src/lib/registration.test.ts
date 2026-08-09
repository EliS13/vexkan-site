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

  it("accepts notes at exactly the length cap", () => {
    expect(validateRegistration({ ...valid(), notes: "x".repeat(1000) }).notes).toBeUndefined();
  });

  it("trims whitespace before validating the email", () => {
    expect(
      validateRegistration({ ...valid(), guardianEmail: "  anne@example.com  " }).guardianEmail
    ).toBeUndefined();
  });

  it("trims whitespace before validating the program slug", () => {
    expect(
      validateRegistration({ ...valid(), programSlug: "  vex-iq-foundation-g1-2  " }).programSlug
    ).toBeUndefined();
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

  it("quotes fields containing a lone carriage return", () => {
    expect(toCsv([{ ...row, notes: "line one\rline two" }])).toContain('"line one\rline two"');
  });

  it("quotes fields containing a carriage return and newline", () => {
    expect(toCsv([{ ...row, notes: "line one\r\nline two" }])).toContain('"line one\r\nline two"');
  });

  it("renders a null note as an empty field", () => {
    expect(toCsv([row]).trim().endsWith(",")).toBe(true);
  });
});
