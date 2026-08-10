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
