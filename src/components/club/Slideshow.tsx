"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Photo } from "@/content/club/photos";

type Props = {
  photos: Photo[];
  /** Milliseconds between slides. Slow on purpose: these are photographs to look at. */
  interval?: number;
  /**
   * How much width the layout actually gives this slideshow. The default suits
   * the half-width column on the home page; a full-width one has to say so, or
   * the browser is told to fetch an image for half the space and the
   * photographs come out soft on a retina screen.
   */
  sizes?: string;
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
 * The arrows sit on the photograph rather than in a bar underneath it, so the
 * controls do not take height away from the image on a phone. Advancing stops
 * on hover and on keyboard focus, and never starts at all for a reader who has
 * asked for reduced motion, so a slide can still be held still.
 */
export function Slideshow({
  photos,
  interval = 9000,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: Props) {
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
      <div className="relative aspect-[16/10]">
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
              sizes={sizes}
              className="object-cover"
              priority={priority && i === 0}
            />
          </div>
        ))}

        {photos.length > 1 && (
          <>
            {([
              { dir: -1, side: "left", label: "Previous photo", glyph: "\u2039" },
              { dir: 1, side: "right", label: "Next photo", glyph: "\u203a" },
            ] as const).map((a) => (
              <button
                key={a.side}
                type="button"
                onClick={() => go(index + a.dir)}
                aria-label={a.label}
                className="absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-2xl leading-none transition-opacity hover:opacity-100"
                style={{
                  [a.side]: 12,
                  background: "rgba(255,255,255,0.9)",
                  color: "var(--foreground)",
                  boxShadow: "var(--shadow-rest)",
                  opacity: 0.82,
                  paddingBottom: 3,
                }}
              >
                {a.glyph}
              </button>
            ))}
          </>
        )}

        {photos[index].caption && (
          <p
            className="absolute inset-x-0 bottom-0 px-6 pb-12 pt-10 text-sm font-medium text-white sm:text-base"
            style={{ background: "linear-gradient(to top, rgba(23,21,15,0.78), transparent)" }}
          >
            {photos[index].caption}
          </p>
        )}
      </div>

      {photos.length > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
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
                background: i === index ? "var(--purple)" : "rgba(255,255,255,0.65)",
                boxShadow: "0 1px 3px rgba(23,21,15,0.35)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
