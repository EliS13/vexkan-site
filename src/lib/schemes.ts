/**
 * The book's colour system, in one place.
 *
 * Signal orange for decisions and design work, pine for building and testing,
 * brass for anything time-bound, and a warm grey for everything else. Every
 * tool and diagram reads from here, so the on-screen colours and the ones in an
 * exported deck cannot drift apart.
 */
export const SCHEMES = {
  purple: { solid: "var(--purple)", bg: "var(--purple-bg)", text: "var(--purple-text)", hex: "CC4A16" },
  teal: { solid: "var(--teal)", bg: "var(--teal-bg)", text: "var(--teal-text)", hex: "1F7A4C" },
  amber: { solid: "var(--amber)", bg: "var(--amber-bg)", text: "var(--amber-text)", hex: "8A6508" },
  neutral: { solid: "#a8a29a", bg: "#f1eee9", text: "#5a544d", hex: "A8A29A" },
} as const;

/** Keying off this rather than `string` means a new scheme fails the build, not the page. */
export type Scheme = keyof typeof SCHEMES;

export function scheme(name: Scheme) {
  return SCHEMES[name];
}
