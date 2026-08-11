"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { org } from "@/content/club/org";

/**
 * Four tabs, and none of them sells anything.
 *
 * The two free things come first, in the order a visitor can use them: read the
 * guides, or have us come and teach. Programs and the competition record are
 * not tabs at all any more — they live on the home page, so the logo is the way
 * back to both. Joining is a conversation now rather than a form, which is why
 * there is no Join tab: Contact is the whole route in.
 */
const NAV = [
  { href: org.guideHref, label: "Resources" },
  { href: "/community", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function ClubHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        borderColor: "var(--line)",
        background: "color-mix(in srgb, var(--surface) 88%, transparent)",
        backdropFilter: "saturate(1.6) blur(12px)",
        WebkitBackdropFilter: "saturate(1.6) blur(12px)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <Link href="/" className="ml-1 flex min-w-0 items-center sm:ml-3" aria-label={`${org.name}, home`}>
          {/*
           * The club's own logo, which already reads "VexKan Robotics Club", so
           * repeating the name beside it would say the same thing twice. The
           * accessible name lives on the link instead.
           */}
          <Image
            src="/logo-vexkan.png"
            alt=""
            width={996}
            height={248}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        {/*
         * One pill holds the whole nav, and the active item is a filled chip
         * inside it. It gives the bar a single shape instead of six loose
         * links, and it tells you where you are without an underline.
         */}
        <nav className="hidden md:block">
          <ul
            className="flex items-center gap-0.5 rounded-full p-1"
            style={{ background: "var(--neutral-bg)", border: "1px solid var(--line)" }}
          >
            {NAV.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className="block rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-colors"
                    style={
                      active
                        ? { background: "var(--surface)", color: "var(--foreground)", boxShadow: "var(--shadow-rest)" }
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

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="club-mobile-nav"
          className="rounded-full px-4 py-2 text-sm font-medium md:hidden"
          style={{ border: "1px solid var(--line)", background: "var(--surface)" }}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="club-mobile-nav" className="border-t md:hidden" style={{ borderColor: "var(--line)" }}>
          <ul className="mx-auto flex max-w-6xl flex-col gap-0.5 px-4 py-3">
            {NAV.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-[15px] font-medium"
                    style={
                      active
                        ? { background: "var(--neutral-bg)", color: "var(--foreground)" }
                        : { color: "var(--ink-body)" }
                    }
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
