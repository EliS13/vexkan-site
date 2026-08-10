"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Photo } from "@/content/club/photos";

type Props = {
  photos: Photo[];
  /** Milliseconds between slides. Slow on purpose: these are photographs to look at. */
  interval?: number;
  priority?: boolean;
};

/**
 * A photo slideshow that does not hold the page hostage.
 *
 * The first slide is server-rendered and every other slide is in the markup
 * too, so the content is present before any JavaScript runs. Advancing only
 * changes which one is visible. That keeps it inside the club's rule against
 * animations that delay content appearing.
 *
 * There are no arrows and no pause button, just dots. Advancing stops on hover
 * and on keyboard focus, and never starts at all for a reader who has asked for
 * reduced motion, so there is still a way to hold a slide still.
 */
export function Slideshow({ photos, interval = 9000, priority = false }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next: number) => setIndex(((next % photos.length) + photos.length) % photos.length),
    [photos.length]
  );

  useEffect(() => {
    if (paused || photos.length < 2) return;

    /*
     * Read straight from the media query rather than mirroring it into state.
     * With no pause button on screen, this preference has to be able to stop
     * the timer before its first tick, and a state update from an effect lands
     * after the first render it would have to prevent.
     */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => setIndex((i) => (i + 1) % photos.length), interval);
    return () => window.clearInterval(id);
  }, [paused, photos.length, interval]);

  if (photos.length === 0) return null;

  return (
    <div
      className="lift relative overflow-hidden rounded-3xl"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      role="group"
      aria-roledescription="carousel"
      aria-label="Photographs of the club"
    >
      <div className="relative aspect-[4/3]">
        {photos.map((p, i) => (
          <div
            key={p.src}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0 }}
            aria-hidden={i === index ? undefined : true}
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority={priority && i === 0}
            />
          </div>
        ))}

        {photos[index].caption && (
          <p
            className="absolute inset-x-0 bottom-0 px-5 py-4 text-sm font-medium text-white"
            style={{ background: "linear-gradient(to top, rgba(23,21,15,0.78), transparent)" }}
          >
            {photos[index].caption}
          </p>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 py-4">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show photo ${i + 1} of ${photos.length}`}
              aria-current={i === index ? "true" : undefined}
              className="h-2.5 rounded-full transition-all"
              style={{
                width: i === index ? 24 : 10,
                background: i === index ? "var(--purple)" : "var(--line)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
