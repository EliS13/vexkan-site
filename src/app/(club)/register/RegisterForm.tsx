"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { programs, getProgram } from "@/content/club/programs";
import { org } from "@/content/club/org";
import {
  emptyRegistration,
  hasErrors,
  validateRegistration,
  type FieldErrors,
  type RegistrationInput,
} from "@/lib/registration";
import { submitRegistration, isCloudConfigured } from "@/lib/registrationsApi";

const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const FIELD_CLASS =
  "mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-base bg-[var(--surface)] border";

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--ink-body)]">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-xs font-medium text-[var(--purple-text)]">
          {error}
        </span>
      )}
    </label>
  );
}

export function RegisterForm() {
  const params = useSearchParams();
  const preselected = params.get("program") ?? "";
  const initial = getProgram(preselected) ? preselected : "";

  const [form, setForm] = useState<RegistrationInput>(emptyRegistration(initial));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  /* Bots fill hidden fields; parents do not. */
  const [honeypot, setHoneypot] = useState("");
  const [openedAt] = useState(() => Date.now());

  function set<K extends keyof RegistrationInput>(key: K, value: RegistrationInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFailure(null);

    if (honeypot || Date.now() - openedAt < 2000) {
      setDone(true);
      return;
    }

    const found = validateRegistration(form);
    setErrors(found);
    if (hasErrors(found)) return;

    setSubmitting(true);
    const result = await submitRegistration(form);
    setSubmitting(false);

    if (result.ok) setDone(true);
    else setFailure(result.message);
  }

  if (done) {
    return (
      <div
        className="rounded-2xl p-8"
        style={{ background: "var(--teal-bg)", border: "1px solid var(--teal)" }}
      >
        <h2 className="text-xl font-semibold text-[var(--teal-text)]">Registration received</h2>
        <p className="mt-3 text-[var(--ink-body)]">
          Thank you. We&apos;ll be in touch at the email or phone number you gave us to confirm the
          schedule and answer any questions. If you don&apos;t hear from us within a few days,
          call {org.phone}.
        </p>
        <Link href="/programs" className="mt-6 inline-block font-semibold text-[var(--teal-text)] hover:underline">
          Back to programs
        </Link>
      </div>
    );
  }

  if (!isCloudConfigured) {
    const fallback = getProgram(form.programSlug)?.legacyFormUrl;
    return (
      <div className="rounded-2xl p-8" style={{ background: "var(--amber-bg)", border: "1px solid var(--amber)" }}>
        <h2 className="text-xl font-semibold text-[var(--amber-text)]">
          Online registration isn&apos;t switched on yet
        </h2>
        <p className="mt-3 text-[var(--ink-body)]">
          Please email <a className="underline" href={org.emailHref}>{org.email}</a> or call{" "}
          <a className="underline" href={org.phoneHref}>{org.phone}</a> and we&apos;ll sign your
          child up.
        </p>
        {fallback && (
          <p className="mt-3 text-[var(--ink-body)]">
            You can also use{" "}
            <a className="underline" href={fallback} target="_blank" rel="noopener noreferrer">
              our registration form
            </a>
            .
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-2xl">
      <div className="grid gap-5">
        <Field label="Program" error={errors.programSlug}>
          <select
            className={FIELD_CLASS}
            style={{ borderColor: "var(--line)" }}
            value={form.programSlug}
            onChange={(e) => set("programSlug", e.target.value)}
          >
            <option value="">Choose a program…</option>
            {programs.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.shortTitle} — {p.gradeLabel}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Student's first name" error={errors.studentFirst}>
            <input
              className={FIELD_CLASS}
              style={{ borderColor: "var(--line)" }}
              value={form.studentFirst}
              autoComplete="off"
              onChange={(e) => set("studentFirst", e.target.value)}
            />
          </Field>
          <Field label="Student's last name" error={errors.studentLast}>
            <input
              className={FIELD_CLASS}
              style={{ borderColor: "var(--line)" }}
              value={form.studentLast}
              autoComplete="off"
              onChange={(e) => set("studentLast", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Student's grade" error={errors.studentGrade}>
          <select
            className={FIELD_CLASS}
            style={{ borderColor: "var(--line)" }}
            value={form.studentGrade}
            onChange={(e) => set("studentGrade", e.target.value)}
          >
            <option value="">Choose a grade…</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>
        </Field>

        <Field label="Parent or guardian's name" error={errors.guardianName}>
          <input
            className={FIELD_CLASS}
            style={{ borderColor: "var(--line)" }}
            value={form.guardianName}
            autoComplete="name"
            onChange={(e) => set("guardianName", e.target.value)}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" error={errors.guardianEmail}>
            <input
              type="email"
              inputMode="email"
              className={FIELD_CLASS}
              style={{ borderColor: "var(--line)" }}
              value={form.guardianEmail}
              autoComplete="email"
              onChange={(e) => set("guardianEmail", e.target.value)}
            />
          </Field>
          <Field label="Phone" error={errors.guardianPhone}>
            <input
              type="tel"
              inputMode="tel"
              className={FIELD_CLASS}
              style={{ borderColor: "var(--line)" }}
              value={form.guardianPhone}
              autoComplete="tel"
              onChange={(e) => set("guardianPhone", e.target.value)}
            />
          </Field>
        </div>

        <Field
          label="Anything we should know?"
          error={errors.notes}
          hint="Optional. Previous robotics experience, or anything that would help us support your child."
        >
          <textarea
            rows={4}
            className={FIELD_CLASS}
            style={{ borderColor: "var(--line)" }}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>

        <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
          <label>
            Leave this field empty
            <input
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </label>
        </div>
      </div>

      {failure && (
        <p role="alert" className="mt-5 rounded-xl px-4 py-3 text-sm" style={{ background: "var(--purple-bg)", color: "var(--purple-text)" }}>
          {failure}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-7 rounded-xl px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: "var(--purple)" }}
      >
        {submitting ? "Sending…" : "Send registration"}
      </button>

      <p className="mt-4 text-xs text-muted">
        We use these details only to contact you about {org.name} programs. We don&apos;t share them
        with anyone, and you can ask us to delete them at any time by emailing{" "}
        <a className="underline" href={org.emailHref}>{org.email}</a>.
      </p>
    </form>
  );
}
