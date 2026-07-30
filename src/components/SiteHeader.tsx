import Link from "next/link";
import { AccountMenu } from "./AccountMenu";

const NAV_LINKS = [
  { href: "/chapters", label: "Chapters" },
  { href: "/tools", label: "Tools" },
  { href: "/ask", label: "Ask" },
];

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-40 border-b bg-surface/90 backdrop-blur"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-8 shrink-0 items-center justify-center rounded-md px-2 text-xs font-bold tracking-tight text-white"
            style={{ background: "var(--purple)" }}
          >
            16688A
          </span>
          <span className="hidden truncate font-serif text-base font-semibold text-foreground sm:inline">
            Built From the Ground Up
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-2 text-sm font-medium text-[var(--ink-body)] transition-colors hover:bg-[#eae6e0] hover:text-foreground sm:px-3"
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-1 sm:ml-2">
            <AccountMenu />
          </div>
        </nav>
      </div>
    </header>
  );
}
