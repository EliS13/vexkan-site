"use client";

import { useState } from "react";
import { org } from "@/content/club/org";

/**
 * Request a free workshop for a school, library or community group.
 *
 * This composes an email rather than posting to a database. The club has one
 * table, for registrations, and a request that quietly landed in a second one
 * nobody checks would be worse than no form at all — a teacher would think
 * they had asked, and never hear back. An email arrives somewhere a person
 * already reads.
 *
 * Because of that, the submit button is a mailto link built from the fields,
 * and the composed message is shown underneath so anyone whose browser has no
 * mail client can copy it into their own. Both routes reach the same inbox.
 */

const FIELD_CLASS =
  "mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-base bg-[var(--surface)] border";

type Request = {
  organisation: string;
  contactName: string;
  email: string;
  grades: string;
  when: string;
  notes: string;
};

const EMPTY: Request = {
  organisation: "",
  contactName: "",
  email: "",
  grades: "",
  when: "",
  notes: "",
};

/** The message the club receives, in the order it is useful to read. */
function compose(r: Request): string {
  const lines = [
    `Organisation: ${r.organisation || "—"}`,
    `Contact: ${r.contactName || "—"}`,
    `Email: ${r.email || "—"}`,
    `Grade level: ${r.grades || "—"}`,
    `Rough date: ${r.when || "—"}`,
    "",
    r.notes || "(no extra notes)",
  ];
  return lines.join("\n");
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--ink-body)]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function WorkshopRequestForm() {
  const [form, setForm] = useState<Request>(EMPTY);
  const [showMessage, setShowMessage] = useState(false);

  function set<K extends keyof Request>(key: K, value: Request[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  /*
   * Enough to be worth sending. Deliberately not a validator: the club would
   * rather answer a half-filled request than turn a teacher away over a
   * missing grade level.
   */
  const ready = form.organisation.trim() !== "" && form.email.trim() !== "";

  const subject = form.organisation
    ? `Workshop request, ${form.organisation}`
    : "Workshop request";

  const href = `${org.emailHref}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    compose(form)
  )}`;

  return (
    <div className="max-w-2xl">
      <div className="grid gap-5">
        <Field label="School or organisation">
          <input
            className={FIELD_CLASS}
            style={{ borderColor: "var(--line)" }}
            value={form.organisation}
            autoComplete="organization"
            onChange={(e) => set("organisation", e.target.value)}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name">
            <input
              className={FIELD_CLASS}
              style={{ borderColor: "var(--line)" }}
              value={form.contactName}
              autoComplete="name"
              onChange={(e) => set("contactName", e.target.value)}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              inputMode="email"
              className={FIELD_CLASS}
              style={{ borderColor: "var(--line)" }}
              value={form.email}
              autoComplete="email"
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Grade level" hint="For example, Grades 4 to 6.">
            <input
              className={FIELD_CLASS}
              style={{ borderColor: "var(--line)" }}
              value={form.grades}
              onChange={(e) => set("grades", e.target.value)}
            />
          </Field>
          <Field label="Rough date" hint="A month is enough. We'll work out the rest.">
            <input
              className={FIELD_CLASS}
              style={{ borderColor: "var(--line)" }}
              value={form.when}
              onChange={(e) => set("when", e.target.value)}
            />
          </Field>
        </div>

        <Field
          label="Anything else?"
          hint="Optional. Group size, room, whether you already have kit."
        >
          <textarea
            rows={4}
            className={FIELD_CLASS}
            style={{ borderColor: "var(--line)" }}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-5">
        {/*
         * An anchor, not a button: it opens the visitor's own mail client with
         * the message already written, and it still works if this component
         * never hydrates. Disabled styling without the href, so it cannot send
         * a blank request that nobody can reply to.
         */}
        <a
          href={ready ? href : undefined}
          aria-disabled={ready ? undefined : true}
          className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold text-white transition-opacity ${
            ready ? "hover:opacity-90" : "pointer-events-none opacity-60"
          }`}
          style={{ background: "var(--purple)" }}
        >
          Send the request
        </a>

        <button
          type="button"
          onClick={() => setShowMessage((v) => !v)}
          className="text-sm font-semibold text-[var(--purple-text)] underline underline-offset-4"
        >
          {showMessage ? "Hide the message" : "Rather send it yourself?"}
        </button>
      </div>

      {!ready && (
        <p className="mt-3 text-xs text-muted">
          We need the organisation and an email address before we can send this.
        </p>
      )}

      {showMessage && (
        <div
          className="mt-6 rounded-2xl p-5"
          style={{ background: "var(--neutral-bg)", border: "1px solid var(--line)" }}
        >
          <p className="text-sm text-[var(--ink-body)]">
            Email{" "}
            <a className="font-semibold underline underline-offset-4" href={org.emailHref}>
              {org.email}
            </a>{" "}
            with this, or phone{" "}
            <a className="font-semibold underline underline-offset-4" href={org.phoneHref}>
              {org.phone}
            </a>
            .
          </p>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-[13px] text-muted">
            {compose(form)}
          </pre>
        </div>
      )}
    </div>
  );
}
