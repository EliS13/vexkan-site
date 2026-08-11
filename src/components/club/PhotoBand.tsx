import Image from "next/image";
import type { Photo } from "@/content/club/photos";

/**
 * A photograph run edge to edge between two sections.
 *
 * It does one job: break the run of white cards so the page does not read as
 * a single list. Height is capped in viewport units so it stays a band on a
 * laptop rather than swallowing the screen, with a floor for phones.
 *
 * `band-drift` gives it a slow parallax as it passes, driven by the browser's
 * own scroll timeline in `globals.css`. No JavaScript, and the photograph is
 * fully visible whether or not the animation ever runs.
 */
export function PhotoBand({ photo }: { photo: Photo }) {
  return (
    <div
      className="relative h-[38vh] min-h-[240px] w-full border-y"
      style={{ borderColor: "var(--line)" }}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="100vw"
        className="band-drift object-cover"
      />
    </div>
  );
}
