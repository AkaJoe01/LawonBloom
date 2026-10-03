"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { MIN_COVER_WIDTH } from "@/lib/validation/media";

export interface CoverSelection {
  id: string;
  url: string;
  width: number;
}

interface PickerItem {
  id: string;
  url: string;
  width: number;
  height: number;
  altText: string | null;
  isDecorative: boolean;
}

export default function CoverPicker({
  value,
  onChange,
  errorMessage,
}: {
  value: CoverSelection | null;
  onChange: (next: CoverSelection | null) => void;
  errorMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PickerItem[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const loading = items === null && listError === null;

  useEffect(() => {
    if (!open || !loading) return;
    let cancelled = false;
    fetch("/api/admin/media?page=1")
      .then(async (res) => {
        if (!res.ok) throw new Error("list failed");
        const data = (await res.json()) as { items?: PickerItem[] };
        if (!cancelled) setItems(data.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setListError("Could not load images. Try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [open, loading]);

  const tooNarrow = value !== null && value.width < MIN_COVER_WIDTH;

  return (
    <div className="mt-1">
      {value ? (
        <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
          <div className="relative aspect-video overflow-hidden rounded-md border border-outline-variant bg-background">
            <Image
              src={value.url}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
              priority
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className={`text-xs ${tooNarrow ? "text-error" : "text-on-surface-variant"}`}>
              {value.width}px wide
              {tooNarrow
                ? ` — must be at least ${MIN_COVER_WIDTH}px to publish`
                : ` — at least ${MIN_COVER_WIDTH}px required`}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-8 items-center rounded-md border border-outline-variant px-3 text-sm text-foreground hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-outline-variant px-3 text-sm text-on-surface-variant hover:border-error hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
              >
                <X size={13} aria-hidden="true" /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-4 py-6 text-center">
          <p className="text-sm text-on-surface-variant">No cover image selected.</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-3 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Choose from library
          </button>
          <p className="mt-2 text-xs text-on-surface-variant">
            Need a new image?{" "}
            <Link href="/admin/media" className="text-primary underline underline-offset-2">
              Upload it to Media
            </Link>
            .
          </p>
        </div>
      )}

      {errorMessage ? (
        <p role="alert" className="mt-1 text-xs text-error">
          {errorMessage}
        </p>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Choose a cover image">
          <button
            type="button"
            aria-label="Close cover picker"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/50 focus-visible:outline-none"
          />
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-outline-variant bg-background shadow-xl">
            <header className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Choose a cover image</h2>
                <p className="text-xs text-on-surface-variant">Most recent 24 images</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-md p-1.5 text-on-surface-variant hover:bg-surface-container-low hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </header>
            <div className="min-h-40 overflow-y-auto p-5">
              {loading ? (
                <p className="py-8 text-center text-sm text-on-surface-variant">Loading images…</p>
              ) : listError ? (
                <div className="py-8 text-center">
                  <p role="alert" className="text-sm text-error">
                    {listError}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setListError(null);
                      setItems(null);
                    }}
                    className="mt-3 text-sm text-primary underline underline-offset-2"
                  >
                    Retry
                  </button>
                </div>
              ) : (items ?? []).length === 0 ? (
                <div className="py-8 text-center text-sm text-on-surface-variant">
                  <p>No images in the library yet.</p>
                  <Link href="/admin/media" className="mt-2 inline-block text-primary underline underline-offset-2">
                    Upload your first image
                  </Link>
                </div>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {(items ?? []).map((item) => {
                    const selected = value?.id === item.id;
                    const narrow = item.width < MIN_COVER_WIDTH;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onChange({ id: item.id, url: item.url, width: item.width });
                            setOpen(false);
                          }}
                          className={`w-full overflow-hidden rounded-lg border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                            selected ? "border-primary ring-2 ring-primary" : "border-outline-variant hover:border-primary"
                          }`}
                        >
                          <span className="relative block aspect-video bg-surface-container-low">
                            <Image
                              src={item.url}
                              alt=""
                              fill
                              sizes="200px"
                              className="object-cover"
                            />
                          </span>
                          <span
                            className={`block px-2 py-1 text-[11px] ${
                              narrow ? "text-error" : "text-on-surface-variant"
                            }`}
                          >
                            {item.width} × {item.height}
                            {narrow ? " — too narrow" : ""}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <footer className="flex items-center justify-between border-t border-outline-variant px-5 py-3">
              <Link href="/admin/media" className="text-sm text-primary underline underline-offset-2">
                Open Media library
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 items-center rounded-md border border-outline-variant px-4 text-sm text-foreground hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Cancel
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
