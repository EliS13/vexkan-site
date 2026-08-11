/**
 * The club's trophy mark.
 *
 * Drawn rather than pulled from an icon set, because the VEX award itself is a
 * squared-off metal column rather than the two-handled cup an icon library
 * gives you. This is closer to the thing on the shelf.
 *
 * Inherits `currentColor` and the size it is given, so the same drawing works
 * as a 16px mark beside a heading and as the watermark behind the count.
 */
export function TrophyIcon({ className = "", size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* The cup */}
      <path d="M7.5 3h9v5a4.5 4.5 0 0 1-9 0V3Z" />
      {/* Handles, which are what read as "trophy" at 16px */}
      <path d="M16.5 4.5h2.2a2.3 2.3 0 0 1-2.2 4.2" />
      <path d="M7.5 4.5H5.3a2.3 2.3 0 0 0 2.2 4.2" />
      {/* Stem and plinth */}
      <path d="M12 12.5V16" />
      <path d="M8.6 20.5h6.8l-.7-3.1a1 1 0 0 0-1-.8h-3.4a1 1 0 0 0-1 .8l-.7 3.1Z" />
    </svg>
  );
}
