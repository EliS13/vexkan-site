"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "./AccountMenu";

/**
 * The Resources section sits inside the club site's own header and footer, so
 * it reads as one site. This bar is the only thing it adds: the way between the
 * book's landing page, the tools and Ask, plus the account menu that keeps a
 * team's notebook and planner in sync.
 */
const LINKS = [
  { href: "/guide", label: "Built to Compete" },
  { href: "/guide/tools", label: "Tools" },
  { href: "/guide/ask", label: "Ask" },
];

function isActive(pathname: string, href: string) {
  return href === "/guide" ? pathname === "/guide" : pathname.startsWith(href);
}

export function GuideNav() {
  const pathname = usePathname();

  return (
    <div className="border-b" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-2">
        <nav aria-label="Resources">
          <ul className="flex items-center gap-1">
            {LINKS.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className="block rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors"
                    style={
                      active
                        ? { background: "var(--neutral-bg)", color: "var(--foreground)" }
                        : { color: "var(--muted)" }
                    }
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <AccountMenu />
      </div>
    </div>
  );
}
