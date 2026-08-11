"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Photo } from "@/content/club/photos";

/**
 * How far the photograph travels, as a percentage of its own height.
 *
 * The matching oversize lives on `.photo-band img` in globals.css and has to
 * stay above 1 + 2×DRIFT%, or the drift pulls an edge into the frame.
 */
const DRIFT = 7;

/**
 * A wide photograph between two sections, drifting slowly as it passes.
 *
 * It does one job: break the run of white cards so the page does not read as
 * a single list. Held to the same column as everything else rather than run
 * edge to edge, so it reads as part of the page instead of a banner dropped
 * across it, and its height is clamped so it stays a band on a wide screen
 * without collapsing to a letterbox slice on a narrow one.
 *
 * The drift is driven here rather than by CSS `animation-timeline`, which only
 * Chrome and a very recent Safari support — most visitors would have seen a
 * still photograph. This costs one passive scroll listener on one element,
 * throttled to a frame, and only while the band is near the screen. The
 * photograph is fully rendered and fully visible before any of it runs, so
 * nothing here gates content: with JavaScript off, or reduced motion asked
 * for, it is simply a still photograph.
 */
export function PhotoBand({ photo }: { photo: Photo }) {
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const f = frame.current;
    if (!f) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let queued = false;

    const apply = () => {
      queued = false;
      const r = f.getBoundingClientRect();
      /*
       * 0 as the band appears at the bottom of the screen, 1 as it leaves the
       * top. Centred on 0 so the photograph sits where it was framed when the
       * band is halfway across.
       */
      /*
       * Clamped, because the band spends most of the page off-screen and the
       * raw ratio keeps going past both ends: a band far below the fold
       * computes to -17%, which is further than the oversize covers and would
       * show an edge on the way in.
       */
      const raw = (window.innerHeight - r.top) / (window.innerHeight + r.height);
      const travelled = Math.min(1, Math.max(0, raw));
      const offset = (travelled * 2 - 1) * DRIFT;
      /*
       * Written to the frame as a custom property, and read by the stylesheet
       * rule on the image. Writing the image's own inline style instead does
       * not survive: next/image re-renders when the photograph loads and
       * restores whatever it was given, wiping the transform.
       */
      f.style.setProperty("--band-drift", `${offset.toFixed(2)}%`);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(apply);
    };

    /*
     * One passive listener, throttled to a frame, doing a rect read and a
     * custom-property write. An IntersectionObserver to switch it off while
     * the band is off-screen was more machinery than the saving justified,
     * and one more thing that can silently fail.
     */
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5">
      <div
        ref={frame}
        className="photo-band lift relative h-[clamp(200px,30vw,340px)] overflow-hidden rounded-3xl"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 1152px) 100vw, 1100px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
