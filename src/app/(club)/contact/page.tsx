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
        eyebrow="Contact"
        title="Get in touch"
        titleAs="h1"
        lead="Questions about a program, a schedule, or robotics in general are all welcome, whether or not your child ever joins."
      >
        {/*
         * An honest expectation rather than a target. The people answering are
         * students, and a promise made here has to survive exam weeks and
         * competition weekends.
         */}
        <p className="club-lead mb-10 max-w-2xl">
          We are students, so replies are not instant. During build season and competition
          weekends they can take a week or more. If something is time sensitive, phone rather
          than email.
        </p>
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
            <p className="mt-2 text-sm text-muted">
              We run the club out of a home, so not every time works for a visit. Call{" "}
              <a href={org.phoneHref} className="hover:underline">{org.phone}</a> to book one.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Before you write">
        <p className="club-lead max-w-2xl">
          A lot of what people ask us is already written down. The guides, calculators and
          notebook templates are free and need no account, so it is worth a look first, and you
          may not need us at all.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href="/guide" size="lg">Read the free guides</Button>
          <Button href="/programs" size="lg" variant="secondary">See what we run</Button>
        </div>
      </Section>
    </>
  );
}
