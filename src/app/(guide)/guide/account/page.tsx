import { AccountPanel } from "./AccountPanel";

export const metadata = { title: "Account — Built From the Ground Up" };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <p className="eyebrow text-[var(--muted)]">Account</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">
        Sign in to keep your work
      </h1>
      <p className="mt-3 text-muted">
        Signing in saves your engineering notebook, season plan, and recent questions to your
        account instead of just this browser, so you can pick the notebook back up on a school
        computer and hand it to a judge from a different laptop.
      </p>

      <div className="mt-8">
        <AccountPanel />
      </div>

      <div className="mt-8 rounded-xl border p-4" style={{ borderColor: "var(--line)" }}>
        <p className="eyebrow text-[var(--muted)]">
          What gets stored, and what does not
        </p>
        <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-muted">
          <li>
            Stored: notebook entries and their photos, your season plan, your team name, and the
            questions you have asked.
          </li>
          <li>
            Not stored: anything you do not type in. There is no tracking, and nothing is shared
            with other teams.
          </li>
          <li>
            Each account can only read its own rows, enforced by the database itself rather than by
            the app.
          </li>
          <li>
            If most of your team is under 13, have a coach or parent own the account. Signing out
            leaves everything on the device untouched.
          </li>
        </ul>
      </div>
    </div>
  );
}
