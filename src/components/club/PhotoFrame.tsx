import Image from "next/image";
import type { Photo } from "@/content/club/photos";

/**
 * Shapes rather than pixel sizes, so a photograph can be asked for the shape
 * the layout needs and the crop is decided in one place.
 */
const RATIO = {
  wide: "aspect-[16/9]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
} as const;

type Props = {
  photo: Photo;
  ratio?: keyof typeof RATIO;
  /** Matches what the layout actually gives the image. Wrong here costs bytes. */
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * One photograph, standing on its own.
 *
 * Most pictures on this site are stronger this way than in a carousel: nothing
 * slides them away, and they can sit next to the paragraph they illustrate.
 * The caption is optional and usually absent, because a caption that only
 * repeats the photograph is noise.
 */
export function PhotoFrame({
  photo,
  ratio = "landscape",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  className = "",
}: Props) {
  return (
    <figure
      className={`lift overflow-hidden rounded-3xl ${className}`}
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <div className={`relative ${RATIO[ratio]}`}>
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          className="object-cover"
          priority={priority}
        />
      </div>
      {photo.caption && (
        <figcaption className="px-5 py-3 text-sm text-muted">{photo.caption}</figcaption>
      )}
    </figure>
  );
}
