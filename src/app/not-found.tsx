import { ClubHeader } from "@/components/club/ClubHeader";
import { ClubFooter } from "@/components/club/ClubFooter";
import { NotFoundContent } from "@/components/club/NotFoundContent";

/**
 * The (club) route group's not-found only fires when a matched route inside
 * that group calls notFound() (e.g. an invalid /programs/[slug]). A URL that
 * doesn't match any route at all — including anything under /guide, which has
 * no not-found of its own — falls through to this root-level file instead.
 *
 * The root layout is a bare document shell (no header/footer of its own), so
 * this file renders the club chrome directly, matching what
 * (club)/layout.tsx does, rather than leaving visitors on an orphan page.
 * vexkan.ca is primarily the club site, so club chrome is the right default
 * even though this file also catches unmatched /guide/* URLs.
 */
export default function NotFound() {
  return (
    <div className="club flex min-h-full flex-1 flex-col">
      <ClubHeader />
      <main id="main" className="flex-1">
        <NotFoundContent />
      </main>
      <ClubFooter />
    </div>
  );
}
