/** A small turning ring, for a button that is busy and wants to look it. */
export function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block size-[0.9em] shrink-0 animate-spin rounded-full border-[3px] border-current border-r-transparent align-[-0.1em]"
    />
  );
}

/**
 * The look a camera button takes while it works: grey rather than a faded
 * version of its own colour, which read as "still pressable" on the iPad.
 */
export const WORKING_BUTTON =
  "disabled:bg-k-rule disabled:text-k-sketch aria-busy:cursor-wait";
