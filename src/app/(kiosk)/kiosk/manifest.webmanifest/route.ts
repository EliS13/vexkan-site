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
      background_color: "#14171a",
      theme_color: "#14171a",
      icons: [{ src: "/logo-vexkan.png", sizes: "996x248", type: "image/png", purpose: "any" }],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
