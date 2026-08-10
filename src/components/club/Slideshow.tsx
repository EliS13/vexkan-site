"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type { Photo } from "@/content/club/photos";

type Props = {
  photos: Photo[];
  /** The first slide is eager-loaded only where the slideshow is above the fold. */
  priority?: boolean;
  className?: string;
};

/**
 * A manual slideshow: arrows, dots, swipe and arrow keys.
 *
 * It does not advance on its own. Auto-advancing would move content out from
 * under someone mid-read and would need a pause control to be usable, and the
 * brief asks for nothing that delays or disturbs content. Every slide is in the
 * markup from the start; only the offset changes.
 */
export function Slideshow({ photos, priority = false, className = "" }: Props) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  const count = photos.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  if (count === 0) return null;

  return (
    <div className={className}>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Photos from the club"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
          if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
        }}
        onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchStart.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStart.current;
          /* 40px so a slightly diagonal scroll does not flick the slide. */
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          touchStart.current = null;
        }}
        className="group relative aspect-[4/3] w-full overflow-hidden rounded-3xl"
        style={{ background: "var(--neutral-bg)", border: "1px solid var(--line)", boxShadow: "var(--shadow-rest)" }}
      >
        {photos.map((p, i) => (
          <div
            key={p.src}
            aria-hidden={i !== index}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: i === index ? 1 : 0 }}
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover"
              priority={priority && i === 0}
            />
          </div>
        ))}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-lg font-semibold transition-transform hover:scale-105"
              style={{ background: "rgba(255,255,255,0.92)", color: "var(--foreground)", boxShadow: "var(--shadow-lift)" }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-lg font-semibold transition-transform hover:scale-105"
              style={{ background: "rgba(255,255,255,0.92)", color: "var(--foreground)", boxShadow: "var(--shadow-lift)" }}
            >
              ›
            </button>
            <p
              className="readout absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px]"
              style={{ background: "rgba(23,21,15,0.62)", color: "#f3efe8" }}
            >
              {index + 1} / {count}
            </p>
          </>
        )}
      </div>

      {/* Caption lives outside the frame so it never sits on top of a face. */}
      <p aria-live="polite" className="mt-3 min-h-[1.5rem] text-sm text-muted">
        {photos[index].caption}
      </p>

      {count > 1 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to photo ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className="h-2.5 rounded-full transition-all"
              style={{
                width: i === index ? 26 : 10,
                background: i === index ? "var(--purple)" : "var(--line)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
