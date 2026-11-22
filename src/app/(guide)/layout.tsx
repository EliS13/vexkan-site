import type { Metadata } from "next";
import { ClubHeader } from "@/components/club/ClubHeader";
import { ClubFooter } from "@/components/club/ClubFooter";
import { GuideNav } from "@/components/GuideNav";

export const metadata: Metadata = {
  title: "Built to Compete — A VEX Robotics Field Guide",
  description:
    "Built to Compete by VexKan Robotics is now available. Calculators, an engineering notebook, and an assistant that gives you the next steps for VEX IQ and V5RC.",
};

/**
 * Resources share the club site's chrome, so following "Resources" from the
 * club never feels like landing on a different website. GuideNav adds the
 * section's own links underneath the club header.
 */
export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="club flex min-h-full flex-1 flex-col">
      <ClubHeader />
      <GuideNav />
      <main id="main" className="flex-1">
        {children}
      </main>
      <ClubFooter />
    </div>
  );
}
