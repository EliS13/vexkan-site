/**
 * The club has never published class times, fees, or term dates. Rather than
 * guess at them, every unknown holds this sentence, which renders verbatim and
 * links to the contact page. `src/content/club/TODO.md` lists every field
 * currently set to it.
 */
export const TBD = "Contact us for current details" as const;

export type Tbd = typeof TBD;

/** A value the club has published, or the placeholder standing in for it. */
export type Maybe<T> = T | Tbd;

export function isTbd(value: unknown): value is Tbd {
  return value === TBD;
}

export type Hours = {
  days: string;
  time: string;
};
