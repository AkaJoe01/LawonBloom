"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";

const navItems = [
  { label: "Our Sanctuary", href: "/#sanctuary" },
  { label: "Clinical Excellence", href: "/clinical-excellence" },
  { label: "The Journey", href: "/journey" },
  { label: "Elite Care", href: "/journey/consultation" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const scrolled = useScroll(10);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => {
    if (href === "/#sanctuary") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-50 mx-auto w-full max-w-5xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out",
        {
          "bg-surface/80 supports-[backdrop-filter]:bg-surface/50 border-outline-variant/25 backdrop-blur-2xl md:top-4 md:max-w-4xl md:shadow":
            scrolled && !open,
          "bg-surface/90": open,
        },
      )}
    >
      <nav
        className={cn(
          "flex h-16 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
          {
            "md:px-2": scrolled,
          },
        )}
      >
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <span className="overflow-hidden rounded-full ring-1 ring-primary/10">
            <Image
              src="/logo/logo.JPG"
              alt="Lawonbloom"
              width={44}
              height={44}
              className="h-9 w-9 object-cover md:h-8 md:w-8"
              priority
            />
          </span>
          {/* <span className="font-display hidden text-lg tracking-tight text-foreground sm:inline md:text-base">
            LawonBloom
          </span> */}
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "relative",
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <motion.span
                  layoutId="navIndicator"
                  className="absolute bottom-0 left-4 right-4 h-px bg-primary"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          ))}
          <div className="ml-2 pl-2 border-l border-outline-variant/20">
            <Link
              href="/journey/consultation"
              className={buttonVariants({
                variant: "default",
                className: "section-label h-9 rounded-full px-5",
              })}
            >
              Begin Your Journey
            </Link>
          </div>
        </div>

        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(!open)}
          className="lg:hidden rounded-full"
        >
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>

      <div
        className={cn(
          "bg-surface/90 fixed top-16 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div
          data-slot={open ? "open" : "closed"}
          className={cn(
            "data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out",
            "flex h-full w-full flex-col justify-between gap-y-2 p-4",
          )}
        >
          <div className="grid gap-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={buttonVariants({
                  variant: "ghost",
                  className: "justify-start h-12 uppercase tracking-[0.18em] text-sm",
                })}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/journey/consultation"
              className={buttonVariants({
                variant: "default",
                className: "w-full h-12 rounded-full uppercase tracking-[0.18em] text-sm",
              })}
              onClick={() => setOpen(false)}
            >
              Begin Your Journey
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
