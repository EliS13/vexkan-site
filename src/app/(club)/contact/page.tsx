import type { Metadata } from "next";
import { org } from "@/content/club/org";
import { Section } from "@/components/club/Section";
import { Card } from "@/components/club/Card";
import { Button } from "@/components/club/Button";

export const metadata: Metadata = {
  title: `Contact — ${org.name}`,
  description: `Reach ${org.name} by phone at ${org.phone} or email at ${org.email}. Based in ${org.address}.`,
};

export default function ContactPage() {
  return (
    <>
      <Section
        eyebrow="Contact"
        title="Get in touch"
        titleAs="h1"
        lead="Questions about a program, a schedule, or fees are welcome — those are the things we get asked most, and we answer them properly."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <Card>
            <p className="eyebrow text-[var(--muted)]">Phone</p>
            <a href={org.phoneHref} className="mt-2 block text-lg font-semibold hover:underline">
              {org.phone}
            </a>
            <p className="mt-2 text-sm text-muted">Best during our opening hours.</p>
          </Card>
          <Card>
            <p className="eyebrow text-[var(--muted)]">Email</p>
            <a href={org.emailHref} className="mt-2 block text-lg font-semibold break-all hover:underline">
              {org.email}
            </a>
            <p className="mt-2 text-sm text-muted">We usually reply within a couple of days.</p>
          </Card>
          <Card>
            <p className="eyebrow text-[var(--muted)]">Where we are</p>
            <p className="mt-2 text-lg font-semibold">{org.address}</p>
            <p className="mt-2 text-sm text-muted">
              Please arrange a visit before coming in.
            </p>
          </Card>
        </div>
      </Section>

      <Section tone="surface" title="Opening hours">
        <div className="max-w-md">
          <dl>
            {org.hours.map((h) => (
              <div
                key={h.days}
                className="flex items-baseline justify-between gap-6 border-b py-3"
                style={{ borderColor: "var(--line)" }}
              >
                <dt className="text-[var(--ink-body)]">{h.days}</dt>
                <dd className="readout font-medium">{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section title="Ready to sign up?">
        <p className="club-lead max-w-2xl">
          Registration takes about a minute. Tell us your child&apos;s grade and how to reach you,
          and we&apos;ll confirm the current schedule and answer any questions.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href="/register" size="lg">Register your child</Button>
          <Button href="/programs" size="lg" variant="secondary">Browse programs</Button>
        </div>
      </Section>
    </>
  );
}
