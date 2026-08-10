"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  /** Stagger within a group, in milliseconds. */
  delay?: number;
  className?: string;
};

/**
 * Releases its children once, the first time they scroll into view.
 *
 * The resting markup is the visible state, and the displaced state is added
 * imperatively after mount. A reader with JS off, on a browser without
 * IntersectionObserver, or with reduced motion turned on therefore sees the
 * content rather than a blank page — the animation is additive, never a
 * precondition for reading.
 *
 * Classes are toggled straight on the node instead of through React state:
 * arming has to happen before the browser paints, and a state update scheduled
 * from an effect lands after it, which would flash the content in and back out.
 */
export function Reveal({ children, delay = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const wantsLessMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (wantsLessMotion || typeof IntersectionObserver === "undefined") return;

    /*
     * Anything already on screen at mount stays put. Animating what the reader
     * is already looking at reads as a glitch rather than as polish.
     */
    if (node.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    node.classList.add("reveal-armed");
    if (delay) node.style.transitionDelay = `${delay}ms`;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          node.classList.remove("reveal-armed");
          node.classList.add("reveal-in");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className || undefined}>
      {children}
    </div>
  );
}
