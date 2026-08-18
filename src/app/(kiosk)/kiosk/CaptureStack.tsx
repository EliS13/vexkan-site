"use client";

/**
 * The captures taken so far, stacked in the corner of the picture.
 *
 * Both capture screens used to lay the five slots out as a row of squares
 * beside the camera. Empty, they spent a quarter of the screen showing
 * nothing, and the one thing they said — how many are left — the capture
 * button says already.
 *
 * Overlapped rather than laid end to end, so the row is the same width at one
 * capture as at five and the picture behind it never gets rearranged. Sits on
 * the video rather than under it, which is what leaves the camera the screen.
 */
export function CaptureStack({ photos, of }: { photos: string[]; of: number }) {
  if (photos.length === 0) return null;

  return (
    <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-[#14171a]/80 py-1.5 pr-3 pl-2">
      <div className="flex">
        {photos.map((photo, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- an in-memory crop
          <img
            key={i}
            src={photo}
            alt=""
            /* Later captures sit on top, so the newest is the one fully in view. */
            style={{ zIndex: i }}
            className={`relative size-9 rounded-md border-2 border-[#35c17a] object-cover ${
              i === 0 ? "" : "-ml-4"
            }`}
          />
        ))}
      </div>
      <span className="font-mono text-[11px] tabular-nums text-[#c2c8cf]">
        {photos.length} of {of}
      </span>
    </div>
  );
}
