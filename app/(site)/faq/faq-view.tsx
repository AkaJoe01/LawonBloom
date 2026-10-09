"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, MessageSquare, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { faqs } from "./faqs";
import AiChat from "@/components/aiChat/AiChat";

const categories = ["All Inquiries", ...new Set(faqs.map((f) => f.category))];


export default function FaqView() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState("All Inquiries");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === "All Inquiries" || faq.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="mx-auto w-full max-w-360 overflow-hidden px-6 pt-20 pb-24 lg:px-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="col-span-1 text-center md:col-span-8 md:col-start-3">
            <h1 className="font-display text-5xl leading-[0.95] text-primary sm:text-6xl md:text-7xl lg:text-[84px] lg:leading-[1.1] mb-6">
              Clarity &amp; Calm
            </h1>
            <p className="font-body-large mx-auto mb-12 max-w-2xl text-on-surface-variant">
              We understand that the journey to parenthood is filled with profound questions. Find reassurance and detailed guidance within our sanctuary of knowledge.
            </p>

            {/* AI Chat */}
            <AiChat />

            {/* Search */}
            <div className="group relative mx-auto max-w-2xl">
              <div className="pointer-events-none absolute inset-y-0 left-6 flex items-center">
                <Search className="h-6 w-6 text-primary/50 transition-colors group-focus-within:text-primary" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-outline-variant/30 bg-surface/80 py-5 pl-16 pr-6 text-base text-foreground backdrop-blur placeholder:text-on-surface-variant/50 transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="Search frequently asked questions..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="mx-auto w-full max-w-360 px-6 py-16 lg:px-20">
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full px-6 py-3 font-label-caps transition-all",
                activeCategory === cat
                  ? "bg-surface-container text-primary shadow-sm"
                  : "border border-surface-container bg-transparent text-on-surface-variant hover:bg-surface-container/50",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:mb-28">
          <div className="flex flex-col gap-4 md:col-span-10 md:col-start-2">
            {filteredFaqs.length === 0 ? (
              <p className="py-12 text-center text-on-surface-variant">
                No results found for &quot;{searchQuery}&quot;. Try a different search term.
              </p>
            ) : (
              filteredFaqs.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                  <div
                    key={i}
                    className={cn(
                      "rounded-2xl border border-outline-variant/30 transition-all",
                      isOpen
                        ? "bg-surface-bright shadow-sm"
                        : "bg-surface/60 hover:bg-surface-bright/70",
                    )}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="flex w-full items-start justify-between gap-4 p-6 text-left md:p-8"
                    >
                      <h3
                        className={cn(
                          "pr-4 text-lg leading-snug transition-colors md:text-xl",
                          isOpen
                            ? "text-primary"
                            : "text-foreground group-hover:text-primary",
                        )}
                      >
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={cn(
                          "mt-1 h-5 w-5 shrink-0 transition-transform duration-300 md:h-6 md:w-6",
                          isOpen
                            ? "rotate-180 text-primary"
                            : "text-on-surface-variant/50",
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                      )}
                    >
                      <div className="border-t border-outline-variant/20 px-6 pb-6 pt-4 text-base leading-7 text-on-surface-variant md:px-8 md:pb-8">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full px-6 py-20 lg:px-20 lg:py-28">
        <div className="absolute inset-0 z-0 bg-surface-container-low/50" />
        <div className="relative z-10 mx-auto grid max-w-360 items-center gap-8 md:grid-cols-12">
          <div className="col-span-1 min-w-0 md:col-span-5 md:col-start-2">
            <h2 className="font-h1-editorial mb-6 text-primary">Still Seeking Clarity?</h2>
            <p className="font-body-large mb-10 text-on-surface-variant">
              Our Concierge Team is available around the clock to provide deeply personal answers to any delicate questions you may hold.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="/journey/consultation"
                className="inline-flex rounded-full bg-primary px-8 py-4 font-label-caps text-on-primary shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
              >
                Choose Your Specialist
              </Link>
            </div>
          </div>

          <div className="col-span-1 mt-10 min-w-0 md:col-span-5 md:mt-0">
            <div className="relative overflow-hidden rounded-[32px] border border-outline-variant/30 bg-surface-bright/60 p-8 backdrop-blur">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary-fixed/30 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-tertiary-fixed/20 blur-3xl" />
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-label-caps text-on-surface-variant">Live Counsel</p>
                    <p className="text-base text-foreground">Available Now</p>
                  </div>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-label-caps text-on-surface-variant">Confidential Email</p>
                    <p className="break-all text-base text-foreground">lawonbloomfertilitycentre@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}