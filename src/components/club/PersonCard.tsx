import type { Person } from "@/content/club/people";
import { Card } from "./Card";

export function PersonCard({ person }: { person: Person }) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <span
          className="readout flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
          style={{ background: "var(--purple)" }}
          aria-hidden="true"
        >
          {person.initials}
        </span>
        <div>
          <h3 className="text-base font-semibold">{person.name}</h3>
          <p className="eyebrow text-[var(--muted)]">{person.role}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-[var(--ink-body)]">{person.bio}</p>
    </Card>
  );
}
