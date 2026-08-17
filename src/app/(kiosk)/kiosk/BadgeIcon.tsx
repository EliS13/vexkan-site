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
  /* Diamond: the rung above gold, and the only cold one in the set. */
  diamond: { light: "#dff4ff", mid: "#6fc7f5", dark: "#1f6fa8", ink: "#082a3d" },
  /* Secrets read as ink and neon rather than metal — they are not ranked. */
  secret: { light: "#8ee9ff", mid: "#33b6d8", dark: "#155e75", ink: "#04222b" },
};

/*
 * Accents, so a badge is not one hue with a highlight on it.
 *
 * The metal above says what rung a badge is; these say what it is about. A
 * medal's ribbon is club colours whatever the disc is made of, a crown's jewels
 * are red and blue, a flame runs orange into yellow. Without them a wall of
 * badges reads as a wall of the same object in three finishes.
 */
const ACCENT = {
  ribbon: "#c8453d",
  ribbonDark: "#8f2f29",
  jewelA: "#e0483f",
  jewelB: "#3f7fd8",
  leaf: "#3f9e63",
  leafDark: "#256b41",
  ember: "#ffd166",
  sky: "#7cc6ff",
  night: "#2a3f66",
  iron: "#5b6470",
  face: "#f4f1e8",
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
          <path d="M9 2 L14 14 L11 16 L6 5 Z" fill={ACCENT.ribbonDark} />
          <path d="M23 2 L18 14 L21 16 L26 5 Z" fill={ACCENT.ribbon} />
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
          <path d="M16 9 L17.7 13.2 L22 13.5 L18.6 16.3 L19.8 20.5 L16 18 L12.2 20.5 L13.4 16.3 L10 13.5 L14.3 13.2 Z" fill={ACCENT.ember} opacity="0.85" />
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
          <path d="M10.5 5.5 L13.5 11.5" stroke={metal.light} strokeWidth="1" opacity="0.7" />
          <path d="M16 12 L19.5 12 L16 29 Z" fill={ACCENT.sky} opacity="0.35" />
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
            fill={ACCENT.ember}
            opacity="0.9"
          />
        </>
      );

    /*
     * Returned and Running it back: a season coming round again.
     *
     * Drawn as one thick open ring with a solid arrowhead on the end, and
     * nothing inside it. The first attempt put a clock face in the middle,
     * which at 24 pixels collapsed into a ring with a dot in it.
     */
    case "replay":
      return (
        <>
          <path
            d="M25.6 11.2 A11 11 0 1 1 20.4 5.2"
            fill="none"
            stroke={fill}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M13.8 2.2 L22.6 6.4 L14.6 11.4 Z" fill={ACCENT.ember} stroke={metal.dark} strokeWidth="0.8" strokeLinejoin="round" />
        </>
      );

    /* Founder and Comeback: a laurel. */
    case "laurel":
      return (
        <>
          <path
            d="M12 4 C6 8 4.5 14 6.5 20 C8 24.5 11.5 27 16 28.5"
            fill="none"
            stroke={ACCENT.leafDark}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M20 4 C26 8 27.5 14 25.5 20 C24 24.5 20.5 27 16 28.5"
            fill="none"
            stroke={ACCENT.leaf}
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
          <circle cx="16" cy="16" r="9.6" fill={ACCENT.face} opacity="0.9" />
          <path d="M16 9 V16 L21 19" fill="none" stroke={metal.ink} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M16 16 L16 11.5" stroke={ACCENT.jewelA} strokeWidth="1.6" strokeLinecap="round" />
        </>
      );

    /* Ironclad: a shield — volume plus consistency, the hardest to fake. */
    case "shield":
      return (
        <>
          <path
            d="M16 2 L28 6.5 V15 C28 22.5 22.8 27.6 16 30 C9.2 27.6 4 22.5 4 15 V6.5 Z"
            fill={fill}
            stroke={metal.dark}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path d="M4 13 H28" stroke={ACCENT.ribbon} strokeWidth="3" />
          <path d="M16 2 V30" stroke={metal.dark} strokeWidth="0.9" opacity="0.45" />
          <path d="M7 8 L16 5 V13 L7 15.5 Z" fill={metal.light} opacity="0.4" />
        </>
      );

    /* Dynasty: a crown, for a podium in more than one season. */
    case "crown":
      return (
        <>
          <path
            d="M3 24 L5.5 9 L12 16 L16 6 L20 16 L26.5 9 L29 24 Z"
            fill={fill}
            stroke={metal.dark}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <rect x="3" y="24" width="26" height="4.5" rx="1.4" fill={fill} stroke={metal.dark} strokeWidth="1.2" />
          <circle cx="16" cy="26.2" r="1.4" fill={ACCENT.jewelA} />
          <circle cx="9" cy="26.2" r="1.1" fill={ACCENT.jewelB} />
          <circle cx="23" cy="26.2" r="1.1" fill={ACCENT.jewelB} />
        </>
      );

    /* Workhorse: an anvil, for long visits over and over. */
    case "anvil":
      return (
        <>
          <path
            d="M4 9 H24 C24 13 21 15.5 18 16.5 V19 H23 L26 28 H8 L11 19 H14 V16.5 C10 15.6 7.5 13.6 4 13 Z"
            fill={fill}
            stroke={metal.dark}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M6 10.5 H21" stroke={ACCENT.ember} strokeWidth="1.3" opacity="0.85" />
          <circle cx="24" cy="7" r="1.3" fill={ACCENT.ember} />
        </>
      );

    /* Early Bird and Weekender: a rising sun. */
    case "sun":
      return (
        <>
          <circle cx="16" cy="18" r="7" fill={fill} stroke={metal.dark} strokeWidth="1.2" />
          {[0, 45, 90, 135].map((deg) => (
            <path
              key={deg}
              d="M16 4.5 V8.5"
              stroke={ACCENT.ember}
              strokeWidth="2.4"
              strokeLinecap="round"
              transform={`rotate(${deg} 16 18)`}
            />
          ))}
          <path d="M2.5 28 H29.5" stroke={metal.dark} strokeWidth="1.8" strokeLinecap="round" />
        </>
      );

    /* Night Owl and Last One Out: a crescent moon. */
    case "moon":
      return (
        <>
          <path
            d="M22 4 A13 13 0 1 0 28 18.5 A10.5 10.5 0 1 1 22 4 Z"
            fill={fill}
            stroke={metal.dark}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="8.5" cy="11" r="1.4" fill={ACCENT.sky} />
          <circle cx="12" cy="24" r="1" fill={ACCENT.sky} opacity="0.8" />
        </>
      );

    /* Coach: a whistle. */
    case "whistle":
      return (
        <>
          <path
            d="M4 12 H18 A7.5 7.5 0 1 1 18 27 H11 A7 7 0 0 1 4 20 Z"
            fill={fill}
            stroke={metal.dark}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="18.5" cy="19.5" r="3.4" fill={metal.ink} opacity="0.55" />
          <path d="M4 12 V8 A2 2 0 0 1 6 6 H12" fill="none" stroke={ACCENT.ribbon} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M6.5 15 H12" stroke={metal.light} strokeWidth="1.4" opacity="0.7" strokeLinecap="round" />
        </>
      );

    /* Visits: stacked plates, one per return. */
    case "layers":
      return (
        <>
          <path d="M16 3 L29 9.5 L16 16 L3 9.5 Z" fill={fill} stroke={metal.dark} strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M3 15.5 L16 22 L29 15.5" fill="none" stroke={ACCENT.sky} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M3 21.5 L16 28 L29 21.5" fill="none" stroke={ACCENT.leaf} strokeWidth="2.6" strokeLinejoin="round" />
        </>
      );
  }
}
