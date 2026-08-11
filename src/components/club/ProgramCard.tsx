import Image from "next/image";
import Link from "next/link";
import type { Program } from "@/content/club/programs";
import type { Photo } from "@/content/club/photos";

/**
 * A program with the picture of it that a parent actually reads first: someone
 * building, or the robot the team competes with.
 *
 * The whole card is the link rather than a "Details" line inside it, so the
 * photograph is part of the target instead of dead space next to it.
 */
export function ProgramCard({ program, photo }: { program: Program; photo?: Photo }) {
  return (
    <Link href={`/programs/${program.slug}`} className="group block h-full">
      <article
        className="lift lift-hover flex h-full flex-col overflow-hidden rounded-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        {photo && (
          /*
           * 4:3 rather than a letterbox. Half of these are portrait phone
           * photographs of someone at a table, and a wide crop takes their
           * heads off.
           */
          <div className="relative aspect-[4/3]">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold group-hover:text-[var(--purple-text)]">
              {program.title}
            </h3>
            <span
              className="eyebrow shrink-0 rounded-full px-2.5 py-1"
              style={{ background: "var(--purple-bg)", color: "var(--purple-text)" }}
            >
              {program.gradeLabel}
            </span>
          </div>
          <p className="mt-3 text-sm text-muted">{program.summary}</p>
          <span className="mt-5 text-sm font-semibold text-[var(--purple-text)] group-hover:underline">
            Details
          </span>
        </div>
      </article>
    </Link>
  );
}
