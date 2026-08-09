import Link from "next/link";
import { org } from "@/content/club/org";
import { programs } from "@/content/club/programs";

export function ClubFooter() {
  return (
    <footer className="border-t bg-surface" style={{ borderColor: "var(--line)" }}>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-base font-semibold">{org.name}</p>
          <p className="mt-2 text-sm text-muted">{org.tagline}</p>
          <p className="mt-4 text-sm text-muted">
            A nonprofit robotics club for {org.gradesLabel.toLowerCase()} in {org.city}.
          </p>
        </div>

        <div>
          <p className="eyebrow text-[var(--muted)]">Programs</p>
          <ul className="mt-3 space-y-2 text-sm">
            {programs.slice(0, 5).map((p) => (
              <li key={p.slug}>
                <Link href={`/programs/${p.slug}`} className="text-[var(--ink-body)] hover:underline">
                  {p.shortTitle}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/programs" className="text-[var(--ink-body)] hover:underline">
                All programs
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-[var(--muted)]">Club</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about" className="text-[var(--ink-body)] hover:underline">About us</Link></li>
            <li><Link href="/events" className="text-[var(--ink-body)] hover:underline">Events</Link></li>
            <li><Link href="/register" className="text-[var(--ink-body)] hover:underline">Register</Link></li>
            <li><Link href={org.guideHref} className="text-[var(--ink-body)] hover:underline">Field Guide</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-[var(--muted)]">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink-body)]">
            <li><a href={org.phoneHref} className="hover:underline">{org.phone}</a></li>
            <li><a href={org.emailHref} className="hover:underline">{org.email}</a></li>
            <li className="text-muted">{org.address}</li>
          </ul>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto max-w-6xl px-5 py-5 text-[13px] text-muted">
          <p>
            © {new Date().getFullYear()} {org.name}. VexKan is not affiliated with VEX Robotics or
            the REC Foundation. Competition rules and game manuals come from{" "}
            <a
              href="https://www.vexrobotics.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--ink-body)]"
            >
              VEX Robotics
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
