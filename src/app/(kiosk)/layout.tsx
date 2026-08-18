import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VexKan sign in",
  /* Homescreen launch on iPad and iPhone: no Safari chrome, dark status bar. */
  appleWebApp: { capable: true, statusBarStyle: "default", title: "VexKan" },
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
  /*
   * Static files in public/, so the dot in each name keeps them clear of the
   * subdomain rewrite. iOS gets an unrounded square: it applies its own corner
   * mask, and a pre-rounded tile inside that mask reads as a shrunken sticker.
   */
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  /* A kiosk is not a document. Nothing here should be indexed or shared. */
  robots: { index: false, follow: false },
};

/**
 * The kiosk has no club header, no footer, and no navigation. It is one screen
 * that does one thing, on an iPad bolted to a table by the door.
 */
export const viewport = {
  /* A kiosk is not a document: no pinch-zoom, and the layout respects the notch. */
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover" as const,
  themeColor: "#fbf7f0",
};

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="min-h-dvh flex-1 bg-k-paper text-k-ink">
      {/*
       * The tap confirmation is the only animation in the kiosk. Both keyframes
       * are applied through motion-safe: variants, so `prefers-reduced-motion`
       * leaves the panel appearing instantly rather than not at all.
       */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pop {
          from { opacity: 0; transform: scale(0.92) }
          to   { opacity: 1; transform: scale(1) }
        }
      `}</style>
      {children}
    </main>
  );
}
