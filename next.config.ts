import type { NextConfig } from "next";

/**
 * The sign-in kiosk is a third site in this repository, served at
 * signin.vexkan.ca. Its pages live under /kiosk so they get their own route
 * group and layout, and the rewrites below map the subdomain onto that prefix.
 *
 * Because of that mapping, everything inside the kiosk links and fetches
 * root-relative — "/board", not "/kiosk/board". On the subdomain the rewrite
 * adds the prefix; a link that carries it already would resolve to
 * /kiosk/kiosk/board and 404.
 *
 * beforeFiles rather than afterFiles: afterFiles resolves real pages first,
 * which would serve the club site's own routes on the subdomain. The negative
 * lookahead keeps Next's own asset paths from being rewritten with everything
 * else.
 */

/** Every path the kiosk owns, minus the /kiosk prefix. */
const KIOSK_PAGES = "board|enroll|admin";

const onSubdomain = [{ type: "host" as const, value: "signin.vexkan.ca" }];
/*
 * Development. There is no subdomain on a dev server, so `localhost:3000`
 * serves the kiosk and `127.0.0.1:3000` serves the club site — same server,
 * two hostnames, nothing to toggle by hand.
 */
const onLocalhost = [{ type: "host" as const, value: "localhost" }];

const nextConfig: NextConfig = {
  /*
   * The rewrites below map the subdomain onto /kiosk, but they do not hide the
   * real paths: without this, vexkan.ca/kiosk/admin would answer on the club
   * site too. Redirects run before rewrites, and only on the URL as requested,
   * so this closes the door on every other host without touching the
   * subdomain's own internal rewrite to /kiosk.
   */
  async redirects() {
    return [
      {
        source: "/kiosk/:path*",
        missing: [{ type: "host", value: "(signin\\.vexkan\\.ca|localhost|127\\.0\\.0\\.1)" }],
        destination: "/",
        permanent: false,
      },
    ];
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          /*
           * The lookahead has to exclude static files as well as Next's own
           * asset paths. Without the dot clause this rule rewrote everything in
           * public/ too: /logo-vexkan.png became /kiosk/logo-vexkan.png and
           * 404'd, and so did all twelve megabytes of face model weights, which
           * silently disabled face recognition on the subdomain while it worked
           * on the apex. No kiosk page path contains a dot, so treating "has a
           * dot" as "is a file" is safe here.
           */
          source: "/:path((?!_next|__nextjs|.*\\.).*)",
          has: onSubdomain,
          destination: "/kiosk/:path*",
        },
        { source: "/", has: onLocalhost, destination: "/kiosk" },
        { source: `/:page(${KIOSK_PAGES})`, has: onLocalhost, destination: "/kiosk/:page" },
        { source: "/api/:path*", has: onLocalhost, destination: "/kiosk/api/:path*" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
