import { Button } from "@/components/club/Button";

/**
 * The (club) route group's not-found only fires when a matched route inside
 * that group calls notFound() (e.g. an invalid /programs/[slug]). A URL that
 * doesn't match any route at all — including anything under /guide, which has
 * no not-found of its own — falls through to this root-level file instead. It
 * mirrors (club)/not-found.tsx so every 404 on the site looks the same.
 */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <p className="eyebrow text-[var(--muted)]">404</p>
      <h1 className="mt-2 text-3xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="club-lead mt-4">
        The link may be out of date. Our programs and contact details are a click away.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/programs">Browse programs</Button>
        <Button href="/" variant="secondary">Go home</Button>
      </div>
    </div>
  );
}
