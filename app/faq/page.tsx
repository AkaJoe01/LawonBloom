"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronDown, MessageSquare, Mail, Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    category: "The First Step",
    question: "What should I expect during my initial consultation at the Sanctuary?",
    answer:
      "Your initial consultation is designed to be a profound listening session rather than a standard clinical appointment. Conducted in one of our private, sunlit suites, you will meet with a Senior Fertility Specialist and a dedicated Wellness Concierge. We review your complete medical history, discuss your emotional and physical readiness, and begin drafting a personalized roadmap. The focus is entirely on your unique story, ensuring you feel heard, understood, and enveloped in our care from the very first moment.",
  },
  {
    category: "Concierge Services",
    question: "How does Lawonbloom ensure privacy for high-profile clientele?",
    answer:
      "Discretion is woven into every layer of our sanctuary. From private entry protocols and unmarked suites to encrypted communications and biometric-secured medical records, every detail is engineered for absolute confidentiality. Our concierge team coordinates all logistics — from discreet transportation to private accommodation — ensuring your journey remains profoundly private. Staff are bound by stringent NDAs, and our facilities are designed to eliminate any unwanted encounters.",
  },
  {
    category: "Clinical Pathways",
    question: "What holistic therapies are integrated into the clinical pathways?",
    answer:
      "We believe the body responds best to treatment when the mind is at peace. Our integrated holistic therapies include acupuncture sessions timed to optimize uterine receptivity, nutritional counseling tailored to fertility, mindfulness and meditation protocols, and gentle yoga designed for reproductive health. Each therapy is scientifically evaluated and coordinated with your clinical timeline to ensure seamless integration.",
  },
  {
    category: "Holistic Support",
    question: "How is the psychological well-being of intended parents supported?",
    answer:
      "Our dedicated psychological support team includes licensed therapists specializing in reproductive mental health. We offer private counselling sessions, support groups, and stress-management protocols throughout your journey. From the initial consultation through post-treatment, our wellness concierge monitors your emotional wellbeing, providing resources and support tailored to your unique needs. We also offer partner and family counselling to ensure your entire support system is nurtured.",
  },
  {
    category: "Concierge Services",
    question: "What travel and accommodation support is available for international patients?",
    answer:
      "Our global concierge team provides end-to-end travel coordination including visa assistance, airport transfers, luxury accommodation booking, and local transportation. We partner with exclusive hotels and serviced apartments that understand the need for privacy and comfort. For longer stays, we can arrange fully equipped private residences with kitchen facilities and dedicated workspaces, ensuring you feel at home throughout your treatment journey.",
  },
  {
    category: "Clinical Pathways",
    question: "What is the typical timeline for an IVF cycle at Lawonbloom?",
    answer:
      "A complete IVF cycle at our sanctuary typically spans 4 to 6 weeks from initial stimulation to embryo transfer. This includes ovarian stimulation (10-14 days), egg retrieval (a single-day procedure), fertilization and embryo culture (5-6 days), and embryo transfer. The exact timeline is personalized based on your individual protocol, diagnostic results, and response to medications. Your dedicated care coordinator will provide a detailed calendar at the start of your journey.",
  },
];

const categories = ["All Inquiries", ...new Set(faqs.map((f) => f.category))];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState("All Inquiries");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatQuery, setChatQuery] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === "All Inquiries" || faq.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAskAI = async () => {
    const q = chatQuery.trim();
    if (!q || loading) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setChatQuery("");
    setLoading(true);
    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: data.error || "Sorry, I couldn't process your question." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

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
            <div className="mx-auto max-w-2xl mb-8">
              <div className="rounded-3xl border border-outline-variant/30 bg-surface-bright/60 backdrop-blur overflow-hidden">
                <div className="flex items-center gap-2 px-6 pt-5 pb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">AI Concierge</span>
                  <span className="ml-auto text-[11px] uppercase tracking-wider text-on-surface-variant/60">Live</span>
                </div>

                <div className="px-6 pb-3">
                  <div className="h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                </div>

                {messages.length > 0 && (
                  <div className="max-h-72 space-y-3 overflow-y-auto px-6 pb-4 scroll-smooth">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex gap-3 rounded-xl p-4 text-sm leading-6",
                          msg.role === "user"
                            ? "bg-surface-container-low"
                            : "bg-primary/[0.04] border border-primary/[0.08]",
                        )}
                      >
                        <div className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                          msg.role === "user" ? "bg-surface-container-high" : "bg-primary/10",
                        )}>
                          {msg.role === "user" ? (
                            <User className="h-3.5 w-3.5 text-on-surface-variant" />
                          ) : (
                            <Bot className="h-3.5 w-3.5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-on-surface-variant/60 mb-1">
                            {msg.role === "user" ? "You" : "AI Concierge"}
                          </p>
                          <p className="text-foreground leading-7">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex gap-3 rounded-xl bg-primary/[0.04] border border-primary/[0.08] p-4">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Bot className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-on-surface-variant/60 mb-1">AI Concierge</p>
                          <div className="flex gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}

                {messages.length === 0 && (
                  <div className="px-6 pb-2">
                    <p className="text-sm text-on-surface-variant/60 leading-7">
                      Ask me anything about our fertility services, treatments, or what to expect at Lawonbloom.
                    </p>
                  </div>
                )}

                <div className="border-t border-outline-variant/20 px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="flex items-center justify-between rounded-full border border-outline-variant/30 bg-surface/60 pl-4 sm:pl-5 transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30">
                    <input
                      type="text"
                      value={chatQuery}
                      onChange={(e) => setChatQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                      className="min-w-0 bg-transparent py-2.5 text-sm text-foreground placeholder:text-on-surface-variant/50 outline-none"
                      placeholder="Ask anything..."
                    />
                    <button
                      onClick={handleAskAI}
                      disabled={!chatQuery.trim() || loading}
                      className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 mx-1.5 text-xs font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Ask
                    </button>
                  </div>
                </div>
              </div>
            </div>

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
          <div className="col-span-1 md:col-span-5 md:col-start-2">
            <h2 className="font-h1-editorial mb-6 text-primary">Still Seeking Clarity?</h2>
            <p className="font-body-large mb-10 text-on-surface-variant">
              Our Concierge Team is available around the clock to provide deeply personal answers to any delicate questions you may hold.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="/concierge/contact"
                className="inline-flex rounded-full bg-primary px-8 py-4 font-label-caps text-on-primary shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
              >
                Connect with a Concierge
              </Link>
            </div>
          </div>

          <div className="col-span-1 mt-10 md:col-span-5 md:mt-0">
            <div className="relative overflow-hidden rounded-[32px] border border-outline-variant/30 bg-surface-bright/60 p-8 backdrop-blur">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary-fixed/30 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-tertiary-fixed/20 blur-3xl" />
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-label-caps text-on-surface-variant">Live Counsel</p>
                    <p className="text-base text-foreground">Available Now</p>
                  </div>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-label-caps text-on-surface-variant">Confidential Email</p>
                    <p className="text-base text-foreground">lawonbloomfertilitycentre@gmail.com.com</p>
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
