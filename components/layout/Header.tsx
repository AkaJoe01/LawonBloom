"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Our Sanctuary", href: "/#sanctuary" },
  { label: "Clinical Excellence", href: "/#services" },
  { label: "The Journey", href: "/journey" },
  { label: "Elite Care", href: "/journey/consultation" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-outline-variant/30 bg-surface/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-360 items-center justify-between gap-6 px-6 py-5 lg:px-20">
        <Link href="/" className="font-display text-2xl tracking-[0.22em] text-primary uppercase">
          Lawonbloom
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="section-label text-sm italic tracking-wide text-on-surface-variant transition-colors hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/journey/consultation" className="hidden rounded-full border border-primary/30 px-6 py-3 section-label text-primary transition-colors hover:bg-primary hover:text-on-primary lg:inline-flex">
            Begin Your Journey
          </Link>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/40 bg-surface text-foreground transition-colors hover:border-primary hover:text-primary lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-outline-variant/30 bg-surface/95 px-6 py-6 backdrop-blur-2xl lg:hidden">
          <nav className="mx-auto flex max-w-360 flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl px-4 py-3 text-sm uppercase tracking-[0.18em] text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/journey/consultation"
              className="mt-2 inline-flex justify-center rounded-full bg-primary px-5 py-4 text-sm uppercase tracking-[0.18em] text-on-primary"
              onClick={() => setMenuOpen(false)}
            >
              Begin Your Journey
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}