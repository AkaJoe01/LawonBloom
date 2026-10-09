"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiChatProps {
  className?: string;
}

export default function AiChat({ className }: AiChatProps) {
  const [chatQuery, setChatQuery] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    <div className={cn("mx-auto max-w-2xl mb-8", className)}>
      <div className="rounded-3xl border border-outline-variant/30 bg-surface-bright/60 backdrop-blur overflow-hidden">
        <div className="flex items-center gap-2 px-6 pt-5 pb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">AI Concierge</span>
          <span className="ml-auto text-[11px] uppercase tracking-wider text-on-surface-variant">Live</span>
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
                  <p className="text-xs font-medium text-on-surface-variant mb-1">
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
                  <p className="text-xs font-medium text-on-surface-variant mb-1">AI Concierge</p>
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
            <p className="text-sm text-on-surface-variant leading-7">
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
  );
}
