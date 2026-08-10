import Link from "next/link";
import { isTbd } from "@/content/club/types";

/**
 * Renders a program fact, or the placeholder sentence with a route to ask,
 * so a parent never sees a blank where a fee or a time should be.
 */
export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b py-3 sm:flex-row sm:gap-6" style={{ borderColor: "var(--line)" }}>
      <dt className="eyebrow w-40 shrink-0 pt-1 text-[var(--muted)]">{label}</dt>
      <dd className="text-[var(--ink-body)]">
        {isTbd(value) ? (
          <Link href="/contact" className="underline decoration-dotted underline-offset-4 hover:opacity-80">
            {value}
          </Link>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
