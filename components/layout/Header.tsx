"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Stethoscope,
  Compass,
} from "lucide-react";

const navItems = [
  { label: "About", href: "/about", icon: Stethoscope },
  {
    label: "Sanctuary",
    href: "/sanctuary",
    icon: Building2,
    children: [{ label: "Services", href: "/sanctuary/services" }],
  },
  {
    label: "Journey",
    href: "/journey",
    icon: Compass,
    children: [
      { label: "Stories", href: "/journey/stories" },
      { label: "Consultation", href: "/journey/consultation" },
    ],
  },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white bg-opacity-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg tracking-wide text-[#2b2b2b]">
          LAWONBLOOM
        </Link>

        <nav className="hidden md:flex gap-8 text-sm text-[#2b2b2b]">
          {navItems.map((item) => (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className="transition hover:text-[#B76E79]"
              >
                {item.label}
              </Link>
              {item.children ? (
                <div className="pointer-events-none absolute left-0 top-full mt-2 hidden min-w-[220px] rounded-3xl border border-[#E6E3DB] bg-white p-4 shadow-lg shadow-black/5 group-hover:pointer-events-auto group-hover:block">
                  <div className="space-y-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-2xl px-3 py-2 text-sm text-[#2b2b2b] transition hover:bg-[#f7f6f3] hover:text-[#B76E79]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/journey"
            className="hidden md:inline-flex bg-[#B76E79] text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-[#9D5E6A] transition"
          >
            BEGIN YOUR JOURNEY
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="md:hidden border-t bg-white bg-opacity-100"
          >
            <nav className="flex flex-col gap-1 px-6 py-4 text-sm text-[#2b2b2b]">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-[#B76E79]"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                    {item.children ? (
                      <div className="ml-8 mt-1 flex flex-col gap-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="rounded-lg px-3 py-2 text-sm text-[#2b2b2b] transition hover:bg-[#f7f6f3] hover:text-[#B76E79]"
                            onClick={() => setMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
              <Link
                href="/journey"
                className="mt-2 inline-flex w-full justify-center rounded-md bg-[#B76E79] px-4 py-3 text-sm font-bold text-white hover:bg-[#9D5E6A]"
                onClick={() => setMenuOpen(false)}
              >
                BEGIN YOUR JOURNEY
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}