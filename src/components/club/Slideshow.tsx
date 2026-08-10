"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/content/club/photos";

type Props = {
  photos: Photo[];
  /** Milliseconds between slides. Auto-advance is off entirely when omitted. */
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
 * Auto-advance stops on hover, on keyboard focus, and whenever the reader has
 * asked for reduced motion. There is also a real pause control, because WCAG
 * 2.2.2 wants a mechanism to stop anything that moves on its own.
 */
export function Slideshow({ photos, interval = 5000, priority = false }: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion.current) setPlaying(false);
  }, []);

  const go = useCallback(
    (next: number) => setIndex(((next % photos.length) + photos.length) % photos.length),
    [photos.length]
  );

  useEffect(() => {
    if (!playing || paused || photos.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % photos.length), interval);
    return () => window.clearInterval(id);
  }, [playing, paused, photos.length, interval]);

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
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            {photos.map((p, i) => (
              <button
                key={p.src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show photo ${i + 1} of ${photos.length}`}
                aria-current={i === index ? "true" : undefined}
                className="h-2.5 rounded-full transition-all"
                style={{
                  width: i === index ? 22 : 10,
                  background: i === index ? "var(--purple)" : "var(--line)",
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPlaying((v) => !v)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous photo"
              className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next photo"
              className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
