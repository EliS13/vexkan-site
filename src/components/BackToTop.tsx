"use client";

import { useEffect, useState } from "react";

/**
 * Back to the top, bottom right.
 *
 * An anchor rather than a button, pointed at the `#top` marker in the root
 * layout, so it still works if it is clicked before this component hydrates —
 * the browser jumps to the anchor on its own. The click handler only exists to
 * make that jump smooth and to keep `#top` out of the address bar.
 *
 * It stays hidden until there is something to scroll back from. A control that
 * appears on a screen it cannot do anything to is just something in the way,
 * and this sits over the content in the corner where a phone's thumb lives.
 */

/**
 * Roughly one screen. Below this the header is still close enough to reach by
 * scrolling, and the button would be offering to solve a problem nobody has.
 */
const SHOW_AFTER_PX = 800;

export function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    /*
     * Read straight off the event rather than deferring into a
     * requestAnimationFrame. The rAF version needed a "already queued" latch to
     * avoid stacking callbacks, and that latch is a trap: a tab backgrounded
     * mid-scroll never runs the frame, so the flag stays raised and the button
     * stops responding for the rest of the page's life.
     *
     * Nothing is gained by the deferral either. This reads one scroll offset
     * and sets a boolean — it forces no layout, and React drops the render when
     * the value has not changed, so the common case costs a comparison.
     */
    function onScroll() {
      setShown(window.scrollY > SHOW_AFTER_PX);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    /*
     * Let modified clicks through — ctrl, cmd, middle click and the rest are a
     * reader asking their browser for something else, and hijacking those is
     * how a link stops behaving like a link.
     */
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    e.preventDefault();
    window.scrollTo({
      top: 0,
      /* Smooth is a nicety; someone who has asked for less motion gets none. */
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  return (
    <a
      href="#top"
      onClick={onClick}
      aria-label="Back to top"
      /*
       * `hidden` rather than unmounted, so nothing shifts as it comes and goes,
       * and it is out of the tab order while invisible.
       */
      hidden={!shown}
      className="back-to-top lift fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full"
      style={{
        background: "color-mix(in srgb, var(--surface) 92%, transparent)",
        border: "1px solid var(--line)",
        backdropFilter: "saturate(1.6) blur(12px)",
        WebkitBackdropFilter: "saturate(1.6) blur(12px)",
        color: "var(--ink-body)",
      }}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </a>
  );
}
