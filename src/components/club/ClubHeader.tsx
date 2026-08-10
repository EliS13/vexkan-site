"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { org } from "@/content/club/org";

/**
 * Ordered by what a visitor wants first: take something, see what we run, find
 * out who we are, then check the record. Results sit after About on purpose,
 * because leading with placings is asking to be impressed rather than giving.
 * Join is last and is a tab like any other, so no page has to sell it.
 */
const NAV = [
  { href: org.guideHref, label: "Resources" },
  { href: "/programs", label: "Programs" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Results" },
  { href: "/contact", label: "Contact" },
  { href: "/register", label: "Join" },
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
        <Link href="/" className="group flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold text-white"
            style={{ background: "var(--purple)", boxShadow: "var(--shadow-rest)" }}
            aria-hidden="true"
          >
            VK
          </span>
          <span className="truncate font-serif text-[15px] font-semibold tracking-tight">
            {org.name}
          </span>
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
