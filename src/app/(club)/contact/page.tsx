import type { Metadata } from "next";
import { org } from "@/content/club/org";
import { Section } from "@/components/club/Section";
import { Card } from "@/components/club/Card";
import { Button } from "@/components/club/Button";

export const metadata: Metadata = {
  title: `Contact, ${org.name}`,
  description: `Reach ${org.name} by phone at ${org.phone} or email at ${org.email}. Based in ${org.address}.`,
};

export default function ContactPage() {
  return (
    <>
      <Section
        title="Get in touch"
        titleAs="h1"
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lift-hover h-full">
            <p className="eyebrow text-[var(--muted)]">Phone</p>
            <a href={org.phoneHref} className="mt-2 block text-lg font-semibold hover:underline">
              {org.phone}
            </a>
          </Card>
          <Card className="lift-hover h-full">
            <p className="eyebrow text-[var(--muted)]">Email</p>
            <a href={org.emailHref} className="mt-2 block text-lg font-semibold break-all hover:underline">
              {org.email}
            </a>
          </Card>
          <Card className="lift-hover h-full">
            <p className="eyebrow text-[var(--muted)]">Where we are</p>
            <p className="mt-2 text-lg font-semibold">{org.address}</p>
          </Card>
        </div>
      </Section>

      <Section title="Before you write">
        <div className="flex flex-wrap gap-3">
          <Button href="/guide" size="lg">Read the free guides</Button>
          <Button href="/programs" size="lg" variant="secondary">See what we run</Button>
        </div>
      </Section>
    </>
  );
}
