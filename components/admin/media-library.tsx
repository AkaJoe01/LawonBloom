"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, X } from "lucide-react";
import MediaUpload from "./media-upload";
import type { mediaPublicItem } from "@/lib/media/usage";

export type MediaItem = Omit<ReturnType<typeof mediaPublicItem>, "createdAt"> & { createdAt: string };

export interface MediaDetail {
  media: MediaItem;
  usage: { usedBy: number; titles: string[] };
}

function pageHref(page: number): string {
  return page > 1 ? `/admin/media?page=${page}` : "/admin/media";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function DetailDrawer({
  detail,
  page,
  canDelete,
}: {
  detail: MediaDetail;
  page: number;
  canDelete: boolean;
}) {
  const router = useRouter();
  const { media, usage } = detail;
  const [altText, setAltText] = useState(media.altText ?? "");
  const [decorative, setDecorative] = useState(media.isDecorative);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inUse, setInUse] = useState<{ usedBy: number; titles: string[] } | null>(null);

  const close = () => router.push(pageHref(page));

  async function saveMeta() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/media/${media.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ altText: altText.trim() || null, isDecorative: decorative }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        setError(data?.error?.message ?? "Could not save image details.");
      }
    } catch {
      setError("Could not save image details.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (busy) return;
    if (!window.confirm("Delete this image? This cannot be undone.")) return;
    setBusy(true);
    setError(null);
    setInUse(null);
    try {
      const res = await fetch(`/api/admin/media/${media.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push(pageHref(page));
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => null)) as
        | { error?: { code?: string; message?: string; usedBy?: number; titles?: string[] } }
        | null;
      if (res.status === 409 && data?.error) {
        setInUse({ usedBy: data.error.usedBy ?? 0, titles: data.error.titles ?? [] });
      } else {
        setError(data?.error?.message ?? "Could not delete this image.");
      }
    } catch {
      setError("Could not delete this image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label="Image details">
      <button
        type="button"
        aria-label="Close image details"
        onClick={close}
        className="absolute inset-0 bg-foreground/40 focus-visible:outline-none"
      />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-outline-variant bg-background shadow-xl">
        <header className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Image details</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-md p-1.5 text-on-surface-variant hover:bg-surface-container-low hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-5 px-5 py-5">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low">
            <Image
              src={media.url}
              alt={media.isDecorative ? "" : (media.altText ?? "")}
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-contain"
              priority
            />
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-on-surface-variant">Dimensions</dt>
            <dd className="text-foreground">
              {media.width} × {media.height}
            </dd>
            <dt className="text-on-surface-variant">Size</dt>
            <dd className="text-foreground">{formatBytes(media.bytes)}</dd>
            <dt className="text-on-surface-variant">Type</dt>
            <dd className="text-foreground">{media.mimeType}</dd>
            <dt className="text-on-surface-variant">Uploaded</dt>
            <dd className="text-foreground">{formatDate(media.createdAt)}</dd>
          </dl>

          <div className="space-y-3 rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <div>
              <label htmlFor="media-alt" className="text-sm font-medium text-foreground">
                Alt text
              </label>
              <input
                id="media-alt"
                value={altText}
                onChange={(event) => setAltText(event.target.value)}
                maxLength={200}
                disabled={decorative}
                placeholder="Describe the image for screen readers"
                className="mt-1 w-full rounded-md border border-outline-variant bg-background px-3 py-2 text-sm text-foreground placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="mt-1 text-xs text-on-surface-variant">{altText.length}/200</p>
            </div>
            <label className="flex items-start gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={decorative}
                onChange={(event) => setDecorative(event.target.checked)}
                className="mt-0.5 size-4 accent-primary"
              />
              <span>
                Decorative image — no alt text needed
                <span className="block text-xs text-on-surface-variant">
                  Screen readers will skip this image entirely.
                </span>
              </span>
            </label>
            <button
              type="button"
              onClick={() => void saveMeta()}
              disabled={busy}
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save details"}
            </button>
          </div>

          <section aria-label="Usage" className="rounded-lg border border-outline-variant bg-background p-4">
            <h3 className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">Usage</h3>
            {usage.usedBy > 0 ? (
              <>
                <p className="mt-2 text-sm text-foreground">
                  Used in {usage.usedBy} {usage.usedBy === 1 ? "post" : "posts"}
                </p>
                <ul className="mt-1 space-y-0.5 text-sm text-on-surface-variant">
                  {usage.titles.map((title) => (
                    <li key={title} className="truncate">
                      {title}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-2 text-sm text-on-surface-variant">Not used in any post yet.</p>
            )}
          </section>

          {inUse ? (
            <div role="alert" className="rounded-lg border border-error/50 bg-error/10 px-4 py-3 text-sm text-error">
              <p className="font-medium">
                Still used by {inUse.usedBy} {inUse.usedBy === 1 ? "post" : "posts"}:
              </p>
              <ul className="mt-1 list-inside list-disc">
                {inUse.titles.map((title) => (
                  <li key={title}>{title}</li>
                ))}
              </ul>
              <p className="mt-1.5">Remove it from those posts first, or swap their cover image.</p>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          ) : null}

          {canDelete ? (
            <button
              type="button"
              onClick={() => void remove()}
              disabled={busy}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-error px-4 text-sm font-medium text-error hover:bg-error hover:text-on-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error disabled:opacity-50"
            >
              <Trash2 size={15} aria-hidden="true" /> Delete image
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function MediaLibrary({
  items,
  total,
  page,
  pageSize,
  detail,
  canDelete,
}: {
  items: MediaItem[];
  total: number;
  page: number;
  pageSize: number;
  detail: MediaDetail | null;
  canDelete: boolean;
}) {
  const router = useRouter();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const openDetail = (id: string) => {
    const search = new URLSearchParams();
    if (page > 1) search.set("page", String(page));
    search.set("detail", id);
    router.push(`/admin/media?${search.toString()}`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Media</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {total} {total === 1 ? "image" : "images"}
          </p>
        </div>
      </header>

      <MediaUpload />

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-outline-variant bg-background p-8 text-center text-sm text-on-surface-variant">
          No images yet. Upload your first image above.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => openDetail(item.id)}
                className="group w-full overflow-hidden rounded-xl border border-outline-variant bg-background text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="relative block aspect-square bg-surface-container-low">
                  <Image
                    src={item.url}
                    alt={item.isDecorative ? "" : (item.altText ?? "")}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                    className="object-cover"
                  />
                </span>
                <span className="block px-2 py-1.5 text-xs text-on-surface-variant">
                  {item.width} × {item.height} · {formatBytes(item.bytes)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Media pagination" className="flex items-center justify-between gap-3">
          <Link
            href={pageHref(page - 1)}
            aria-disabled={page <= 1 ? true : undefined}
            className={`rounded-md border border-outline-variant px-3 py-1.5 text-sm ${
              page <= 1 ? "pointer-events-none text-on-surface-variant/50" : "text-foreground hover:bg-surface-container-low"
            }`}
          >
            ← Previous
          </Link>
          <p className="text-sm text-on-surface-variant">
            Page {page} of {totalPages}
          </p>
          <Link
            href={pageHref(page + 1)}
            aria-disabled={page >= totalPages ? true : undefined}
            className={`rounded-md border border-outline-variant px-3 py-1.5 text-sm ${
              page >= totalPages
                ? "pointer-events-none text-on-surface-variant/50"
                : "text-foreground hover:bg-surface-container-low"
            }`}
          >
            Next →
          </Link>
        </nav>
      ) : null}

      {detail ? <DetailDrawer key={detail.media.id} detail={detail} page={page} canDelete={canDelete} /> : null}
    </div>
  );
}
