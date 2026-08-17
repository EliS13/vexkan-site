import type { Member } from "@/lib/kiosk/types";

/**
 * Photographs are phase 4. Until then a member is identified by initials on a
 * colour derived from their id, which at least stays the same tile every
 * meeting so it can be found by position and colour rather than by reading.
 */
function hueFor(seed: string): number {
  // FNV-1a, then spaced by the golden angle. Taking the hash modulo 360
  // directly clusters ids that share a prefix — "member-01" through
  // "member-12" all landed within a few degrees of each other, which is
  // exactly the case this has to separate.
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash % 1000) * 137.508 % 360;
}

export function Avatar({ member, signedIn }: { member: Member; signedIn: boolean }) {
  const initials = `${member.firstName[0] ?? ""}${member.lastName[0] ?? ""}`.toUpperCase();

  if (member.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- blob URLs, sized fixed
      <img
        src={member.photoUrl}
        alt=""
        className={`size-full rounded-xl object-cover ${signedIn ? "" : "opacity-60 grayscale"}`}
      />
    );
  }

  const hue = hueFor(`${member.firstName}${member.lastName}`);
  return (
    /*
     * Initials, dashed. Sign-up always takes a photograph, so a member without
     * one came in from the old system, and the dashed edge marks that at a
     * glance — a tile still waiting for a face rather than one that lost it.
     */
    <div
      aria-hidden
      className="grid size-full place-items-center rounded-xl border-2 border-dashed font-serif text-[clamp(1.5rem,4vw,2.5rem)] font-bold"
      style={
        signedIn
          ? {
              background: `hsl(${hue} 55% 22%)`,
              color: `hsl(${hue} 70% 82%)`,
              borderColor: `hsl(${hue} 45% 40%)`,
            }
          : {
              background: `hsl(${hue} 12% 20%)`,
              color: `hsl(${hue} 10% 55%)`,
              borderColor: "#3a424b",
            }
      }
    >
      {initials}
    </div>
  );
}
