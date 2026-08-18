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
  /*
   * Spread across the wheel, minus the orange stretch of it.
   *
   * Orange is out of this palette everywhere else, and a member who happened to
   * hash into it wore the one colour the kiosk does not use — a tile that
   * looked like a mistake rather than like theirs. So the wheel is 322 degrees
   * wide and the gap from 12 to 50 is stepped over: true reds survive, yellow
   * picks up on the far side, and nobody lands in between.
   *
   * The step is the golden angle of *this* wheel rather than of a full circle.
   * 137.508 is 360 times the golden ratio's complement, and reused against 322
   * it lands within a whisker of three sevenths — so ids collapsed into seven
   * clumps and half the room turned up wearing the same cyan.
   */
  const spread = (Math.abs(hash % 1000) * (322 * 0.3819660113)) % 322;
  return spread < 12 ? spread : spread + 38;
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
      /*
       * Signed in, the tile is a solid piece of plastic in their colour.
       * Signed out it is the same colour drained to a wash of itself — the same
       * hue either way, because finding your own tile by its colour is the
       * whole reason the colour exists, and it must not change while you are
       * out of the room.
       *
       * Lightness is fixed per state rather than per hue so a yellow member and
       * a blue one carry the same weight on the wall, and white always reads on
       * the filled version.
       */
      style={
        signedIn
          ? {
              /*
               * Both states are pastels of one hue; only the depth changes.
               * Signed in is the darker of the two, signed out the lighter, so
               * a member's colour is recognisably theirs whether they are in
               * the room or not — which is the whole reason they have one.
               *
               * Lightness does the work and saturation stays put, because
               * dropping saturation instead is what sends the reds and yellows
               * to mud: a member was a brown square while the one beside her
               * was violet, and nobody wants to be the brown one.
               *
               * The letters are a deep version of the member's own hue rather
               * than white or black, which stays readable across every hue —
               * white fails on the yellows — and keeps the tile one colour
               * rather than a colour with type on top.
               */
              background: `hsl(${hue} 60% 74%)`,
              color: `hsl(${hue} 60% 24%)`,
              borderColor: `hsl(${hue} 50% 58%)`,
            }
          : {
              background: `hsl(${hue} 55% 94%)`,
              color: `hsl(${hue} 35% 55%)`,
              borderColor: `hsl(${hue} 40% 86%)`,
            }
      }
    >
      {initials}
    </div>
  );
}
