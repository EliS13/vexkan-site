import Image from "next/image";
import type { Person } from "@/content/club/people";
import { founderPhoto } from "@/content/club/photos";
import { Card } from "./Card";

export function PersonCard({ person }: { person: Person }) {
  return (
    <Card className="lift-hover">
      <div className="flex items-center gap-5">
        {/*
         * A real photograph where there is one. The initials badge stays as the
         * fallback so adding a second person does not need a photo first.
         */}
        <span
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl"
          style={{ background: "var(--purple)" }}
        >
          {/*
           * Anchored to the top. A square crop out of a portrait photograph
           * takes its window from the middle by default, which on a head and
           * shoulders shot cuts the face in half.
           */}
          <Image
            src={founderPhoto.src}
            alt={founderPhoto.alt}
            fill
            sizes="80px"
            className="object-cover object-top"
          />
        </span>
        <div>
          <h3 className="text-lg font-semibold">{person.name}</h3>
          <p className="eyebrow text-[var(--muted)]">{person.role}</p>
        </div>
      </div>
      <p className="mt-5 text-sm text-[var(--ink-body)]">{person.bio}</p>
    </Card>
  );
}
