import { NextResponse } from "next/server";

/**
 * Makes the kiosk installable, so an iPad by the door launches it fullscreen
 * with no Safari chrome.
 *
 * A route handler rather than Next's manifest.ts convention: that convention
 * only generates at the app root, which would serve this manifest on the club
 * site too. Here it lives under /kiosk and the subdomain rewrite maps it to
 * /manifest.webmanifest, so only the kiosk advertises itself as an app.
 */
export function GET() {
  return NextResponse.json(
    {
      name: "VexKan Sign In",
      short_name: "VexKan",
      description: "Sign in and out of the VexKan robotics club room.",
      start_url: "/",
      scope: "/",
      display: "standalone",
      orientation: "any",
      background_color: "#fbf7f0",
      theme_color: "#fbf7f0",
      /*
       * The V mark, not the wordmark. A 996x248 logo gets letterboxed into a
       * square homescreen tile with most of it empty; the V is the club's mark
       * at the size a tile actually is. Maskable is a separate, unrounded copy
       * so Android's circle crop cannot clip the letter.
       */
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
