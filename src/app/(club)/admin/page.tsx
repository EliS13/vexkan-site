import type { Metadata } from "next";
import { Section } from "@/components/club/Section";
import { AdminDashboard } from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Registrations",
  /* Guardian contact details live behind this page. Keep it out of search. */
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Section eyebrow="Club admin" title="Registrations" titleAs="h1">
      <AdminDashboard />
    </Section>
  );
}
