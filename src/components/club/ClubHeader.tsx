"use client";

import Link from "next/link";
import { useState } from "react";
import { org } from "@/content/club/org";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
];

export function ClubHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 border-b bg-surface/90 backdrop-blur"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ background: "var(--purple)" }}
            aria-hidden="true"
          >
            VK
          </span>
          <span className="truncate font-serif text-base font-semibold">{org.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-[var(--ink-body)] transition-colors hover:bg-[#eae6e0] hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={org.guideHref}
            className="rounded-md px-3 py-2 text-sm font-medium text-[var(--ink-body)] transition-colors hover:bg-[#eae6e0] hover:text-foreground"
          >
            Field Guide
          </Link>
          <Link
            href="/register"
            className="ml-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--purple)" }}
          >
            Register
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="club-mobile-nav"
          className="rounded-md px-3 py-2 text-sm font-medium md:hidden"
          style={{ border: "1px solid var(--line)" }}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="club-mobile-nav" className="border-t md:hidden" style={{ borderColor: "var(--line)" }}>
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3">
            {[...NAV, { href: org.guideHref, label: "Field Guide" }, { href: "/register", label: "Register" }].map(
              (l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-[var(--ink-body)] hover:bg-[#eae6e0]"
                >
                  {l.label}
                </Link>
              )
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
