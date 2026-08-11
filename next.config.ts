import type { NextConfig } from "next";

/**
 * The sign-in kiosk is a third site in this repository, served at
 * signin.vexkan.ca. Its pages live under /kiosk so they get their own route
 * group and layout, and the rewrites below map the subdomain onto that prefix.
 *
 * beforeFiles rather than afterFiles: afterFiles resolves real pages first,
 * which would serve the club site's own routes on the subdomain. The negative
 * lookahead keeps Next's own asset paths from being rewritten with everything
 * else.
 */
const kioskRewrites = [
  {
    source: "/:path((?!_next|__nextjs).*)",
    has: [{ type: "host" as const, value: "signin.vexkan.ca" }],
    destination: "/kiosk/:path*",
  },
  /*
   * Development. There is no subdomain on a dev server, so `localhost:3000`
   * serves the kiosk and `127.0.0.1:3000` serves the club site — same server,
   * two hostnames, nothing to toggle by hand.
   */
  {
    source: "/",
    has: [{ type: "host" as const, value: "localhost" }],
    destination: "/kiosk",
  },
  {
    source: "/:path(pair|coach)",
    has: [{ type: "host" as const, value: "localhost" }],
    destination: "/kiosk/:path",
  },
];

const nextConfig: NextConfig = {
  async rewrites() {
    return { beforeFiles: kioskRewrites, afterFiles: [], fallback: [] };
  },
};

export default nextConfig;
