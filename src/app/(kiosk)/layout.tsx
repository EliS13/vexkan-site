import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VexKan sign in",
  /* A kiosk is not a document. Nothing here should be indexed or shared. */
  robots: { index: false, follow: false },
};

/**
 * The kiosk has no club header, no footer, and no navigation. It is one screen
 * that does one thing, on an iPad bolted to a table by the door.
 */
export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return <main id="main" className="min-h-dvh flex-1 bg-[#14171a] text-[#e8eaed]">{children}</main>;
}
