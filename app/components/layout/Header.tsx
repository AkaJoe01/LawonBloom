"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Stethoscope,
  Compass,
  Crown,
  HeartHandshake,
} from "lucide-react";

const navItems = [
  { label: "Our Sanctuary", href: "/our-sanctuary", icon: Building2 },
  {
    label: "Clinical Excellence",
    href: "/clinical-excellence",
    icon: Stethoscope,
  },
  { label: "The Journey", href: "/thejourney", icon: Compass },
  { label: "Elite Care", href: "/elite-care", icon: Crown },
  { label: "Concierge", href: "/concierge", icon: HeartHandshake },
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
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-[#B76E79]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/thejourney"
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
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-[#B76E79]"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/thejourney"
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