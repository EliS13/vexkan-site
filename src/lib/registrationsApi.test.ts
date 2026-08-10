import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The single most consequential invariant in this codebase: `submitRegistration`
 * must never chain `.select()` or `.single()` onto its insert. Doing so makes
 * postgrest send `Prefer: return=representation` (INSERT ... RETURNING), which
 * anonymous users' row level security rejects — turning a valid registration
 * into a lost one. This suite mocks the Supabase client so it can prove that
 * invariant directly, rather than relying on the code comment next to it.
 */
const mocks = vi.hoisted(() => {
  const selectSpy = vi.fn(() => {
    throw new Error(".select() must never be chained onto the registrations insert");
  });
  const singleSpy = vi.fn(() => {
    throw new Error(".single() must never be chained onto the registrations insert");
  });

  const state: { insertError: { message: string } | null } = { insertError: null };

  const insertSpy = vi.fn((payload: Record<string, unknown>) => {
    void payload; // captured via insertSpy.mock.calls, not needed here
    return {
      select: selectSpy,
      single: singleSpy,
      // The real query builder is a thenable, and the implementation awaits
      // the result of .insert(...) directly without chaining anything onto it.
      then: (resolve: (v: { error: unknown }) => void) => resolve({ error: state.insertError }),
    };
  });

  const fromSpy = vi.fn((table: string) => {
    void table; // captured via fromSpy.mock.calls, not needed here
    return { insert: insertSpy };
  });

  return { selectSpy, singleSpy, insertSpy, fromSpy, state };
});

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({ from: mocks.fromSpy }),
  isCloudConfigured: true,
}));

const { submitRegistration } = await import("@/lib/registrationsApi");
const { emptyRegistration } = await import("@/lib/registration");

function input(overrides: Partial<ReturnType<typeof emptyRegistration>> = {}) {
  return {
    ...emptyRegistration("vex-iq-foundation-g1-2"),
    studentFirst: "  Ada  ",
    studentLast: "  Lovelace  ",
    studentGrade: " 2 ",
    guardianName: "  Anne Byron  ",
    guardianEmail: "  anne@example.com  ",
    guardianPhone: "  403-555-0134  ",
    notes: "  ",
    ...overrides,
  };
}

beforeEach(() => {
  mocks.state.insertError = null;
  mocks.selectSpy.mockClear();
  mocks.singleSpy.mockClear();
  mocks.insertSpy.mockClear();
  mocks.fromSpy.mockClear();
});

describe("submitRegistration", () => {
  it("inserts and never chains select or single onto the builder", async () => {
    const result = await submitRegistration(input());

    expect(result.ok).toBe(true);
    expect(mocks.insertSpy).toHaveBeenCalledTimes(1);
    expect(mocks.selectSpy).not.toHaveBeenCalled();
    expect(mocks.singleSpy).not.toHaveBeenCalled();
  });

  it("sends exactly the SQL column names as the payload keys", async () => {
    await submitRegistration(input());

    const payload = mocks.insertSpy.mock.calls[0][0];
    expect(Object.keys(payload).sort()).toEqual(
      [
        "program_slug",
        "student_first",
        "student_last",
        "student_grade",
        "guardian_name",
        "guardian_email",
        "guardian_phone",
        "notes",
      ].sort()
    );
  });

  it("trims string values before inserting", async () => {
    await submitRegistration(input());

    const payload = mocks.insertSpy.mock.calls[0][0];
    expect(payload.program_slug).toBe("vex-iq-foundation-g1-2");
    expect(payload.student_first).toBe("Ada");
    expect(payload.student_last).toBe("Lovelace");
    expect(payload.student_grade).toBe("2");
    expect(payload.guardian_name).toBe("Anne Byron");
    expect(payload.guardian_email).toBe("anne@example.com");
    expect(payload.guardian_phone).toBe("403-555-0134");
  });

  it("turns empty (or whitespace-only) notes into null rather than an empty string", async () => {
    await submitRegistration(input({ notes: "   " }));

    const payload = mocks.insertSpy.mock.calls[0][0];
    expect(payload.notes).toBeNull();
  });

  it("keeps trimmed, non-empty notes", async () => {
    await submitRegistration(input({ notes: "  allergic to peanuts  " }));

    const payload = mocks.insertSpy.mock.calls[0][0];
    expect(payload.notes).toBe("allergic to peanuts");
  });

  it("resolves to a failure result instead of throwing when the insert errors", async () => {
    mocks.state.insertError = { message: "permission denied for table registrations" };

    await expect(submitRegistration(input())).resolves.toEqual(
      expect.objectContaining({ ok: false })
    );
  });
});
