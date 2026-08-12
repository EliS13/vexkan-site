import type { Metadata } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { BackToTop } from "@/components/BackToTop";
import "./globals.css";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

/** Geometric and slightly mechanical. Carries headings without going literary. */
const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

/** Eyebrows, labels, and every number a tool reports, so they read as instruments. */
const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vexkan.ca"),
  title: "VexKan Robotics Club",
  description:
    "A nonprofit robotics club in Calgary teaching VEX IQ and V5RC to students in Grades 1 to 12.",
};

/**
 * Header and footer live in the route group layouts, because the club site and
 * the field guide have different chrome. This file owns only the document
 * shell, the fonts, and the skip link.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${mono.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {/* What the back-to-top control points at, so it works without JavaScript. */}
        <span id="top" />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
        >
          Skip to content
        </a>
        {children}
        {/*
         * Here rather than in either route group's layout: the field guide's
         * chapters are as long as anything on the club site, so both want it.
         */}
        <BackToTop />
        {/*
         * Real Core Web Vitals and visitor counts. Worth having on a site this
         * photograph-heavy, read mostly by students on phones. Both report only
         * from Vercel deployments; locally they are inert.
         */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
