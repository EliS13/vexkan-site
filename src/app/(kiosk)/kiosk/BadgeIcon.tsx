import type { Badge, BadgeTier } from "@/lib/kiosk/badges";

/**
 * The artwork for a badge.
 *
 * Drawn rather than lettered. The first version used typographic glyphs — ①,
 * ★, ◆ — which rendered as whatever font the iPad felt like and read as
 * punctuation on a photograph rather than as something earned.
 *
 * Everything is inline SVG on currentColor plus a per-tier gradient, so a badge
 * scales from the 24px corner of a tile to the leaderboard without going soft,
 * and needs no network request on a kiosk that may be on club wifi.
 */

/* Metal, roughly: a bright edge, a mid face, a shaded underside. */
const METAL: Record<BadgeTier, { light: string; mid: string; dark: string; ink: string }> = {
  gold: { light: "#ffe89a", mid: "#f3b73d", dark: "#a9741a", ink: "#4a3208" },
  silver: { light: "#f2f4f7", mid: "#c3c9d1", dark: "#7d858e", ink: "#2f343a" },
  bronze: { light: "#f0bd8e", mid: "#cd8b4a", dark: "#8a5426", ink: "#3d2410" },
  milestone: { light: "#9df0c4", mid: "#3fbb82", dark: "#1d6b48", ink: "#0c2e1f" },
  streak: { light: "#f5b98a", mid: "#e8743c", dark: "#a13d13", ink: "#3d1808" },
  special: { light: "#cbb6f5", mid: "#9b7ae0", dark: "#5b3fa0", ink: "#241640" },
};

export function BadgeIcon({ badge, className = "" }: { badge: Badge; className?: string }) {
  const metal = METAL[badge.tier];
  const id = `g-${badge.tier}-${badge.shape}`;

  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label={`${badge.label}, ${badge.detail}`}
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={metal.light} />
          <stop offset="55%" stopColor={metal.mid} />
          <stop offset="100%" stopColor={metal.dark} />
        </linearGradient>
      </defs>
      <Shape badge={badge} fill={`url(#${id})`} metal={metal} />
    </svg>
  );
}

function Shape({
  badge,
  fill,
  metal,
}: {
  badge: Badge;
  fill: string;
  metal: (typeof METAL)[BadgeTier];
}) {
  switch (badge.shape) {
    /* A disc on two ribbon tails, with the placing struck into it. */
    case "medal":
      return (
        <>
          <path d="M9 2 L14 14 L11 16 L6 5 Z" fill={metal.dark} />
          <path d="M23 2 L18 14 L21 16 L26 5 Z" fill={metal.mid} />
          <circle cx="16" cy="21" r="9.5" fill={fill} stroke={metal.dark} strokeWidth="1.2" />
          <circle cx="16" cy="21" r="6.6" fill="none" stroke={metal.light} strokeWidth="0.9" opacity="0.55" />
          <text
            x="16"
            y="21"
            textAnchor="middle"
            dominantBaseline="central"
            fill={metal.ink}
            fontSize="9.5"
            fontWeight="700"
            fontFamily="ui-serif, Georgia, serif"
          >
            {badge.place ?? ""}
          </text>
        </>
      );

    /* All time: a star, because it outranks any single season. */
    case "star":
      return (
        <>
          <path
            d="M16 2.5 L20 12 L30 12.8 L22.4 19.3 L24.8 29 L16 23.8 L7.2 29 L9.6 19.3 L2 12.8 L12 12 Z"
            fill={fill}
            stroke={metal.dark}
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <path d="M16 6.5 L18.6 12.8 L25 13.3 L20.2 17.4" fill="none" stroke={metal.light} strokeWidth="1" opacity="0.6" />
        </>
      );

    /* Hours: a cut gem, the thing that accumulates and does not reset. */
    case "gem":
      return (
        <>
          <path
            d="M9 4 H23 L30 12 L16 29 L2 12 Z"
            fill={fill}
            stroke={metal.dark}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M9 4 L12.5 12 L16 29 L19.5 12 L23 4" fill="none" stroke={metal.dark} strokeWidth="0.9" opacity="0.5" />
          <path d="M2 12 H30" stroke={metal.dark} strokeWidth="0.9" opacity="0.5" />
          <path d="M10.5 5.5 L13.5 11.5" stroke={metal.light} strokeWidth="1" opacity="0.65" />
        </>
      );

    /* Streak: a flame. */
    case "flame":
      return (
        <>
          <path
            d="M16 1.5 C19.5 7 24.5 9.5 24.5 16.5 C24.5 22.6 20.7 27.5 16 27.5 C11.3 27.5 7.5 22.6 7.5 16.5 C7.5 11.5 10.5 9.5 12 6 C13 9 14 10 15 11 C15.6 8.2 15.4 4.8 16 1.5 Z"
            fill={fill}
            stroke={metal.dark}
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <path
            d="M16 15 C18 17.6 19.4 19 19.4 21.3 C19.4 23.9 17.9 25.6 16 25.6 C14.1 25.6 12.6 23.9 12.6 21.3 C12.6 19.2 14 17.6 16 15 Z"
            fill={metal.light}
            opacity="0.75"
          />
        </>
      );

    /* Returned and Founder: a laurel, for coming back across seasons. */
    case "laurel":
      return (
        <>
          <path
            d="M12 4 C6 8 4.5 14 6.5 20 C8 24.5 11.5 27 16 28.5"
            fill="none"
            stroke={fill}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M20 4 C26 8 27.5 14 25.5 20 C24 24.5 20.5 27 16 28.5"
            fill="none"
            stroke={fill}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx="16" cy="14" r="4.6" fill={fill} stroke={metal.dark} strokeWidth="1" />
          <circle cx="16" cy="14" r="2.2" fill={metal.ink} opacity="0.35" />
        </>
      );

    /* Marathon: a clock, for one long sitting. */
    case "clock":
      return (
        <>
          <circle cx="16" cy="16" r="13" fill={fill} stroke={metal.dark} strokeWidth="1.3" />
          <circle cx="16" cy="16" r="9.6" fill="none" stroke={metal.light} strokeWidth="0.9" opacity="0.5" />
          <path d="M16 8.5 V16 L21.5 19.5" fill="none" stroke={metal.ink} strokeWidth="2.2" strokeLinecap="round" />
        </>
      );

    /* Visits: stacked plates, one per return. */
    case "layers":
      return (
        <>
          <path d="M16 3 L29 9.5 L16 16 L3 9.5 Z" fill={fill} stroke={metal.dark} strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M3 15.5 L16 22 L29 15.5" fill="none" stroke={fill} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M3 21.5 L16 28 L29 21.5" fill="none" stroke={fill} strokeWidth="2.6" strokeLinejoin="round" opacity="0.75" />
        </>
      );
  }
}
