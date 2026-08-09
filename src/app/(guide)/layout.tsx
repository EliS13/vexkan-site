import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Built From the Ground Up — A VEX Robotics Field Guide",
  description:
    "An interactive companion to Built From the Ground Up: navigate VEX IQ and V5RC with chapter guides, calculators, and an assistant that gives you the next steps.",
};

/**
 * The field guide keeps its own chrome. Nothing here is shared with the club
 * site beyond the palette in globals.css, which is the point of the split.
 */
export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
