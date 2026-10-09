"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Trash2 } from "lucide-react";

export interface EnquiryRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  postSlug: string | null;
  consentAt: string;
  consentVersion: string;
  readAt: string | null;
  createdAt: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function readError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
  return data?.error?.message ?? "Something went wrong. Please try again.";
}

export default function EnquiriesPanel({ items: initial }: { items: EnquiryRow[] }) {
  const [items, setItems] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const unread = items.filter((item) => item.readAt === null).length;

  async function toggleRead(item: EnquiryRow) {
    if (busyId) return;
    const markRead = item.readAt === null;
    setBusyId(item.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/enquiries/${item.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: markRead ? "read" : "unread" }),
      });
      if (!res.ok) {
        setError(await readError(res));
        return;
      }
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, readAt: markRead ? new Date().toISOString() : null } : row,
        ),
      );
    } catch {
      setError("Could not update the enquiry. Check your connection and retry.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: EnquiryRow) {
    if (!window.confirm(`Delete the enquiry from ${item.name}? This cannot be undone.`)) return;
    setBusyId(item.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/enquiries/${item.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        setError(await readError(res));
        return;
      }
      setItems((prev) => prev.filter((row) => row.id !== item.id));
    } catch {
      setError("Could not delete the enquiry. Check your connection and retry.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Enquiries</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {items.length} {items.length === 1 ? "message" : "messages"} · {unread} unread
          </p>
        </div>
      </header>

      {error && (
        <div role="alert" className="rounded-lg border border-error/50 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-outline-variant bg-background p-8 text-center text-sm text-on-surface-variant">
          No enquiries yet. Contact-form submissions will appear here.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={`rounded-xl border bg-background p-4 ${
                item.readAt === null
                  ? "border-outline-variant border-l-4 border-l-primary"
                  : "border-outline-variant border-l-4 border-l-transparent"
              }`}
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <a
                  href={`mailto:${item.email}`}
                  className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-2 hover:underline"
                >
                  <Mail aria-hidden size={14} />
                  {item.email}
                </a>
                {item.phone && <p className="text-sm text-on-surface-variant">{item.phone}</p>}
                {item.postSlug && (
                  <Link
                    href={`/blog/${item.postSlug}`}
                    className="text-xs text-on-surface-variant underline-offset-2 hover:text-foreground hover:underline"
                  >
                    re: /blog/{item.postSlug}
                  </Link>
                )}
                <time dateTime={item.createdAt} className="ml-auto text-xs text-on-surface-variant">
                  {formatDate(item.createdAt)}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-on-surface">{item.message}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-on-surface-variant">
                  Consent {item.consentVersion} granted {formatDate(item.consentAt)}
                  {item.readAt ? ` · read ${formatDate(item.readAt)}` : " · unread"}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleRead(item)}
                    disabled={busyId === item.id}
                    className="rounded-md border border-outline-variant px-2.5 py-1.5 text-sm text-foreground hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {item.readAt === null ? "Mark read" : "Mark unread"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(item)}
                    disabled={busyId === item.id}
                    className="inline-flex items-center gap-1.5 rounded-md border border-outline-variant px-2.5 py-1.5 text-sm text-foreground hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 aria-hidden size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
