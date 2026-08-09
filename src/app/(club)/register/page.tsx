import type { Metadata } from "next";
import { Suspense } from "react";
import { org } from "@/content/club/org";
import { Section } from "@/components/club/Section";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: `Register — ${org.name}`,
  description: `Register a student for a ${org.name} robotics program in ${org.city}.`,
};

export default function RegisterPage() {
  return (
    <Section
      eyebrow="Register"
      title="Sign your child up"
      titleAs="h1"
      lead="Tell us which program and how to reach you. We'll confirm the current schedule and fees, and answer any questions before anything is committed."
    >
      {/* useSearchParams needs a Suspense boundary or the static build fails. */}
      <Suspense fallback={<p className="text-muted">Loading the form…</p>}>
        <RegisterForm />
      </Suspense>
    </Section>
  );
}
