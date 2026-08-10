import { Button } from "@/components/club/Button";

/**
 * Shared 404 body for both `src/app/(club)/not-found.tsx` (fires when a
 * matched route inside the club group calls notFound(), e.g. a bad
 * /programs/[slug]) and the root `src/app/not-found.tsx` (fires for any URL
 * that doesn't match a route at all, including under /guide). Because both
 * contexts render this same copy, it stays neutral about which side of the
 * site the visitor was headed for rather than assuming programs.
 */
export function NotFoundContent() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <p className="eyebrow text-[var(--muted)]">404</p>
      <h1 className="mt-2 text-3xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="club-lead mt-4">
        The link may be out of date. Here&apos;s how to get back on track.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/programs">Browse programs</Button>
        <Button href="/guide" variant="secondary">
          Field guide
        </Button>
        <Button href="/" variant="secondary">
          Go home
        </Button>
      </div>
    </div>
  );
}
