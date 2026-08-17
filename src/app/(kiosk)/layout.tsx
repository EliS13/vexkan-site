import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VexKan sign in",
  /* Homescreen launch on iPad and iPhone: no Safari chrome, dark status bar. */
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "VexKan" },
  formatDetection: { telephone: false },
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
  themeColor: "#14171a",
};

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="min-h-dvh flex-1 bg-[#14171a] text-[#e8eaed]">
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
