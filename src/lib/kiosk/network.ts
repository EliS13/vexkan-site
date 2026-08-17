/**
 * Keeping sign-in to the club's own network.
 *
 * A browser cannot read which wifi it is joined to — there is no API for it,
 * deliberately. What the server can see is the public IP the request arrived
 * from, and every device on the club's wifi shares that one address. So the
 * check is: does this request come from the same place the club room does.
 *
 * Three things this does not do, worth being straight about:
 *
 *  - A phone on mobile data inside the club room fails it, because that traffic
 *    leaves through the carrier rather than the club's connection.
 *  - A VPN defeats it, since the exit address is what gets compared.
 *  - Most ISPs hand out dynamic addresses, so the club's IP will change without
 *    warning and sign-in will start refusing everyone. That is why an empty
 *    setting means "allow anywhere" rather than "allow nothing": a lapsed
 *    address should not lock the club out of its own attendance system on a
 *    meeting night.
 *
 * It stops a student signing in from home, which is the actual problem. It is
 * not a security boundary.
 */

/** Comma-separated public IPs or CIDR blocks. Empty disables the check. */
export function allowedNetworks(): string[] {
  return (process.env.KIOSK_ALLOWED_IPS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isNetworkCheckOn(): boolean {
  return allowedNetworks().length > 0;
}

/**
 * The client's address, as the platform reports it. Vercel puts the real client
 * first in x-forwarded-for; everything after it is proxy hops and must not be
 * trusted or matched against.
 */
export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? null;
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n > 255) return null;
    value = value * 256 + n;
  }
  return value;
}

/** Handles a bare address or a CIDR block such as 24.108.0.0/16. */
export function matchesRule(ip: string, rule: string): boolean {
  if (!rule.includes("/")) return ip === rule;

  const [base, bitsText] = rule.split("/");
  const bits = Number(bitsText);
  if (!Number.isInteger(bits) || bits < 0 || bits > 32) return false;

  const ipInt = ipv4ToInt(ip);
  const baseInt = ipv4ToInt(base);
  if (ipInt === null || baseInt === null) return false;

  // A /0 would shift by 32, which is a no-op in JS rather than a wipe.
  const mask = bits === 0 ? 0 : (-1 << (32 - bits)) >>> 0;
  return (ipInt & mask) >>> 0 === (baseInt & mask) >>> 0;
}

export type NetworkVerdict =
  | { allowed: true; reason: "check-off" | "on-network" }
  | { allowed: false; reason: "wrong-network" | "no-ip" };

export function checkNetwork(headers: Headers): NetworkVerdict {
  const rules = allowedNetworks();
  if (rules.length === 0) return { allowed: true, reason: "check-off" };

  const ip = clientIp(headers);
  // No address at all means the platform is not reporting one. Refusing here
  // would fail closed on a misconfiguration rather than on a real intruder.
  if (!ip) return { allowed: false, reason: "no-ip" };

  return rules.some((rule) => matchesRule(ip, rule))
    ? { allowed: true, reason: "on-network" }
    : { allowed: false, reason: "wrong-network" };
}
