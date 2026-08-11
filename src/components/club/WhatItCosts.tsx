import Link from "next/link";
import { COST_ASSISTANCE, COST_COVERS, COST_NOTE } from "@/content/club/programs";
import { isTbd, type Maybe } from "@/content/club/types";
import { org } from "@/content/club/org";

/**
 * What a program costs, stated where a family can act on it.
 *
 * Two rules this block exists to keep:
 *
 *  - It never appears on `/guide`, `/community` or the home page. Those are the
 *    genuinely free side of the club and a fee anywhere near them blurs the one
 *    line the whole site depends on.
 *  - It always appears before anyone types a name into a form. A parent who
 *    finds the cost on the program page feels informed; a parent who finds it
 *    after filling in a signup form feels handled. Same number, opposite
 *    outcome.
 *
 * With no figure published it says so plainly and gives two ways to ask, rather
 * than going quiet — silence about money is what sends a family to the phone
 * already suspicious.
 */
export function WhatItCosts({ cost, heading = "What it costs" }: { cost: Maybe<string>; heading?: string }) {
  const published = !isTbd(cost);

  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <h3 className="text-lg font-semibold">{heading}</h3>

      {published ? (
        <p className="score mt-3 text-3xl font-semibold text-[var(--purple-text)]">{cost}</p>
      ) : (
        <p className="club-lead mt-3">
          Email{" "}
          <a href={org.emailHref} className="font-semibold underline underline-offset-4">
            {org.email}
          </a>{" "}
          or call{" "}
          <a href={org.phoneHref} className="font-semibold underline underline-offset-4">
            {org.phone}
          </a>{" "}
          for more details. The guides and the community workshops stay free either way.
        </p>
      )}

      <p className="eyebrow mt-6 text-[var(--muted)]">What it pays for</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {COST_COVERS.map((item) => (
          <li key={item} className="flex gap-3 text-sm">
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: "var(--purple)" }}
              aria-hidden="true"
            />
            <span className="text-[var(--ink-body)]">{item}</span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-muted">{COST_NOTE}</p>

      {/* The contact details are already above, so this only needs the offer. */}
      <p className="mt-4 text-sm text-[var(--ink-body)]">
        {COST_ASSISTANCE}{" "}
        <Link href="/contact" className="font-semibold text-[var(--purple-text)] underline underline-offset-4">
          Contact us
        </Link>
        .
      </p>
    </div>
  );
}
