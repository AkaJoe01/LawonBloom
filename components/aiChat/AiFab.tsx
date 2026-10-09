"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import AiChat from "./AiChat";

export default function AiFab() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    }, 0);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <div
        className={cn("fixed inset-0 z-[55]", open ? "block" : "hidden")}
        aria-hidden={!open}
      >
        <div
          className="absolute inset-0 bg-surface/40 backdrop-blur-[2px]"
          onClick={close}
        />
        <div
          ref={panelRef}
          id="ai-concierge-panel"
          role="dialog"
          aria-modal="true"
          aria-label="AI Concierge"
          className="absolute bottom-24 right-6 max-h-[calc(100dvh-9rem)] w-[min(92vw,24rem)] overflow-y-auto"
        >
          <AiChat className="m-0 max-w-none" />
        </div>
      </div>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="ai-concierge-panel"
        aria-label={open ? "Close AI Concierge" : "Ask the AI Concierge"}
        className={cn(
          "fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-on-primary shadow-lg shadow-primary/25 transition-all hover:bg-primary/90",
          open ? "z-[60]" : "z-40",
        )}
      >
        {open ? (
          <X className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        )}
        {open ? "Close" : "Chat With AI"}
      </button>
    </>
  );
}
