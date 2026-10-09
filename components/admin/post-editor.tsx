"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Eye, Lock, Plus, Trash2, X } from "lucide-react";
import TiptapEditor from "./tiptap-editor";
import CoverPicker, { type CoverSelection } from "./cover-picker";
import { slugify } from "@/lib/posts/derive";
import { zodFieldErrors } from "@/lib/validation/common";
import { hasBlockContent, postPublish, type TiptapDoc } from "@/lib/validation/post";
import { MIN_COVER_WIDTH } from "@/lib/validation/media";

export interface AdminCategory {
  id: string;
  name: string;
}

export interface EditorPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: TiptapDoc | null;
  categoryId: string;
  coverImageId: string | null;
  coverImageUrl?: string | null;
  coverImageWidth?: number | null;
  status: "DRAFT" | "PUBLISHED";
  disclaimer: string;
  reviewerName: string | null;
  reviewerCredential: string | null;
  reviewedAt: string | null;
  faqs: { question: string; answer: string }[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  noindex: boolean;
}

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

const EMPTY_DOC: TiptapDoc = { type: "doc", content: [{ type: "paragraph" }] } as TiptapDoc;

const inputClass =
  "mt-1 w-full rounded-md border border-outline-variant bg-background px-3 py-2 text-sm text-foreground placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:text-on-surface-variant";

const labelClass = "text-sm font-medium text-foreground";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-error">
      {message}
    </p>
  );
}

export default function PostEditor({ categories, initial }: { categories: AdminCategory[]; initial: EditorPost | null }) {
  const router = useRouter();
  const isNew = initial === null;
  const [id, setId] = useState<string | null>(initial?.id ?? null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [slugSuggestion, setSlugSuggestion] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [cover, setCover] = useState<CoverSelection | null>(() =>
    initial?.coverImageId && initial.coverImageUrl
      ? { id: initial.coverImageId, url: initial.coverImageUrl, width: initial.coverImageWidth ?? 0 }
      : null,
  );
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState<TiptapDoc>(initial?.content ?? EMPTY_DOC);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(initial?.faqs ?? []);
  const [disclaimer, setDisclaimer] = useState(initial?.disclaimer ?? "");
  const [reviewerName, setReviewerName] = useState(initial?.reviewerName ?? "");
  const [reviewerCredential, setReviewerCredential] = useState(initial?.reviewerCredential ?? "");
  const [reviewedAt, setReviewedAt] = useState(() => {
    if (initial?.reviewedAt) return initial.reviewedAt.slice(0, 10);
    return new Date().toISOString().slice(0, 10);
  });
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? "");
  const [noindex, setNoindex] = useState(initial?.noindex ?? false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initial?.status ?? "DRAFT");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const dirtyRef = useRef(false);
  const saveTimer = useRef<number | null>(null);
  const stateRef = useRef<Record<string, unknown>>({});

  useEffect(() => {
    stateRef.current = {
      id,
      title,
      slug,
      slugTouched,
      categoryId,
      cover,
      excerpt,
      content,
      faqs,
      disclaimer,
      reviewerName,
      reviewerCredential,
      reviewedAt,
      metaTitle,
      metaDescription,
      noindex,
      status,
    };
  });

  const clearError = (key: string) =>
    setFieldErrors((previous) => {
      if (!(key in previous)) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });

  const buildBody = useCallback(() => {
    const s = stateRef.current as {
      title: string;
      slug: string;
      status: string;
      categoryId: string;
      cover: CoverSelection | null;
      excerpt: string;
      content: TiptapDoc;
      faqs: { question: string; answer: string }[];
      disclaimer: string;
      reviewerName: string;
      reviewerCredential: string;
      reviewedAt: string;
      metaTitle: string;
      metaDescription: string;
      noindex: boolean;
    };
    return {
      title: s.title.trim(),
      slug: s.slug,
      content: s.content,
      categoryId: s.categoryId,
      coverImageId: s.cover ? s.cover.id : null,
      excerpt: s.excerpt.trim() ? s.excerpt.trim() : undefined,
      disclaimer: s.disclaimer,
      reviewerName: s.reviewerName.trim() || null,
      reviewerCredential: s.reviewerCredential.trim() || null,
      reviewedAt: s.reviewedAt ? new Date(`${s.reviewedAt}T12:00:00.000Z`).toISOString() : null,
      faqs: s.faqs,
      metaTitle: s.metaTitle.trim() || null,
      metaDescription: s.metaDescription.trim() || null,
      noindex: s.noindex,
    };
  }, []);

  const patchBody = useCallback(() => {
    const body = buildBody();
    const s = stateRef.current as { status: string };
    if (s.status === "PUBLISHED") {
      return { ...body, slug: undefined };
    }
    return body;
  }, [buildBody]);

  const mapError = useCallback(async (res: Response) => {
    const data = (await res.json().catch(() => null)) as
      | { error?: { fieldErrors?: Record<string, string>; suggestion?: string } }
      | null;
    if (data?.error?.fieldErrors) setFieldErrors(data.error.fieldErrors);
    if (data?.error?.suggestion) setSlugSuggestion(data.error.suggestion);
    return data;
  }, []);

  const flush = useCallback(async () => {
    const s = stateRef.current as { id: string | null };
    if (!s.id || !dirtyRef.current) return;
    setSaveState("saving");
    try {
      const res = await fetch(`/api/admin/posts/${s.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patchBody()),
      });
      if (res.ok) {
        dirtyRef.current = false;
        setSaveState("saved");
        setSavedAt(new Date());
        setSlugSuggestion(null);
      } else {
        await mapError(res);
        setSaveState("error");
      }
    } catch {
      setSaveState("error");
    }
  }, [patchBody, mapError]);

  const createDraft = useCallback(async (): Promise<string | null> => {
    setSaveState("saving");
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildBody()),
      });
      const data = (await res.json().catch(() => null)) as
        | { id?: string; error?: { fieldErrors?: Record<string, string>; suggestion?: string } }
        | null;
      if (res.status === 201 && data?.id) {
        dirtyRef.current = false;
        setSaveState("saved");
        setSavedAt(new Date());
        setId(data.id);
        setSlugSuggestion(null);
        router.replace(`/admin/posts/${data.id}`);
        return data.id;
      }
      if (res.status === 409 && data?.error?.suggestion) setSlugSuggestion(data.error.suggestion);
      if (data?.error?.fieldErrors) setFieldErrors(data.error.fieldErrors);
      setSaveState("error");
      return null;
    } catch {
      setSaveState("error");
      return null;
    }
  }, [buildBody, router]);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    setSaveState("dirty");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void flush();
    }, 30_000);
  }, [flush]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      const s = stateRef.current as { id: string | null };
      if (!s.id) return;
      event.preventDefault();
      event.returnValue = "";
      void fetch(`/api/admin/posts/${s.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patchBody()),
        keepalive: true,
      }).catch(() => undefined);
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [patchBody]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function handlePublish() {
    if (busy) return;
    const parsed = postPublish.safeParse(buildBody());
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setBusy(true);
    setFieldErrors({});
    setSlugSuggestion(null);
    let postId = stateRef.current.id as string | null;
    if (!postId) {
      postId = await createDraft();
      if (!postId) {
        setBusy(false);
        return;
      }
    }
    try {
      const res = await fetch(`/api/admin/posts/${postId}/publish`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.ok) {
        dirtyRef.current = false;
        setStatus("PUBLISHED");
        setSaveState("saved");
        setSavedAt(new Date());
        const payload = (await res.json()) as { slug?: string };
        setToast(payload.slug ? `Published — live at /blog/${payload.slug}` : "Published");
      } else if (res.status === 404) {
        setToast("This post no longer exists.");
      } else {
        await mapError(res);
        if (res.status !== 422 && res.status !== 400 && res.status !== 409) setSaveState("error");
      }
    } catch {
      setSaveState("error");
    } finally {
      setBusy(false);
    }
  }

  async function handleUnpublish() {
    if (busy || !id) return;
    if (!window.confirm("Move this post back to draft? It will disappear from the public site.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}/unpublish`, { method: "POST" });
      if (res.ok) {
        setStatus("DRAFT");
        setToast("Moved back to draft.");
      } else {
        await mapError(res);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (busy || !id) return;
    if (!window.confirm("Delete this post permanently? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (res.ok || res.status === 404) {
        dirtyRef.current = false;
        router.push("/admin/posts");
      }
    } finally {
      setBusy(false);
    }
  }

  const blockers: string[] = [];
  if (!hasBlockContent(content)) blockers.push("Add body content");
  if (disclaimer.trim().length < 20) blockers.push("Write a disclaimer (20+ characters)");
  if (!cover) blockers.push("Attach a cover image");
  else if (cover.width < MIN_COVER_WIDTH)
    blockers.push(`Cover image must be at least ${MIN_COVER_WIDTH}px wide (this one is ${cover.width}px)`);
  if (!reviewerName.trim() || !reviewerCredential.trim())
    blockers.push("Add the reviewing clinician's name and credential");
  const publishBlocked = blockers.length > 0;

  const slugLocked = status === "PUBLISHED";

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      onBlur={() => void flush()}
      className="mx-auto max-w-3xl space-y-6"
    >
      <header className="sticky top-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-b border-outline-variant bg-background/95 px-4 py-3 backdrop-blur">
        <Link
          href="/admin/posts"
          className="text-sm text-on-surface-variant hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          ← Posts
        </Link>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            status === "PUBLISHED" ? "bg-primary-fixed text-on-primary-fixed-variant" : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          {status === "PUBLISHED" ? "Published" : "Draft"}
        </span>
        <p aria-live="polite" className="text-xs text-on-surface-variant">
          {saveState === "saving" && "Saving…"}
          {saveState === "dirty" && "Unsaved changes"}
          {saveState === "saved" && savedAt
            ? `Saved ${savedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
            : null}
          {saveState === "error" ? (
            <button type="button" onClick={() => void flush()} className="ml-1 text-error underline underline-offset-2">
              Save failed — retry
            </button>
          ) : null}
        </p>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {id ? (
            <Link
              href={`/admin/preview/${id}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-outline-variant px-3 text-sm text-foreground hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Eye size={15} aria-hidden="true" /> Preview
            </Link>
          ) : null}
          {isNew ? (
            <button
              type="button"
              onClick={() => void createDraft()}
              disabled={busy || !title.trim()}
              className="inline-flex h-9 items-center rounded-md border border-outline-variant px-3 text-sm text-foreground hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              Save draft
            </button>
          ) : null}
          {status === "PUBLISHED" ? (
            <button
              type="button"
              onClick={() => void handleUnpublish()}
              disabled={busy}
              className="inline-flex h-9 items-center rounded-md border border-outline-variant px-3 text-sm text-foreground hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handlePublish()}
              disabled={busy || publishBlocked}
              title={publishBlocked ? blockers.join(" · ") : undefined}
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Working…" : "Publish"}
            </button>
          )}
          {id ? (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={busy}
              aria-label="Delete post"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-outline-variant text-on-surface-variant hover:border-error hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error disabled:opacity-50"
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </header>

      {toast ? (
        <p role="status" className="rounded-lg border border-primary/40 bg-primary-fixed/40 px-4 py-3 text-sm text-foreground">
          {toast}
        </p>
      ) : null}

      {publishBlocked && status !== "PUBLISHED" ? (
        <section aria-label="Before you can publish" className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">Before you can publish</p>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {blockers.map((blocker) => (
              <li key={blocker} className="flex items-center gap-2">
                <X size={13} aria-hidden="true" className="text-error" />
                {blocker}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4" aria-labelledby="post-basics">
        <h2 id="post-basics" className="text-base font-semibold text-foreground">
          Basics
        </h2>
        <div>
          <label htmlFor="post-title" className={labelClass}>
            Title
          </label>
          <input
            id="post-title"
            value={title}
            onChange={(event) => {
              const value = event.target.value;
              setTitle(value);
              if (!slugTouched) setSlug(slugify(value));
              clearError("title");
              markDirty();
            }}
            maxLength={120}
            aria-invalid={fieldErrors.title ? true : undefined}
            className={inputClass}
          />
          <FieldError message={fieldErrors.title} />
        </div>
        <div>
          <label htmlFor="post-slug" className={labelClass}>
            Slug
          </label>
          <div className="flex items-center gap-2">
            <input
              id="post-slug"
              value={slug}
              disabled={slugLocked}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value.toLowerCase());
                clearError("slug");
                setSlugSuggestion(null);
                markDirty();
              }}
              aria-invalid={fieldErrors.slug ? true : undefined}
              className={inputClass}
            />
            {slugLocked ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-surface-container-high px-2 py-1.5 text-xs text-on-surface-variant">
                <Lock size={12} aria-hidden="true" /> Locked
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">Public URL: /blog/{slug || "…"}</p>
          <FieldError message={fieldErrors.slug} />
          {slugSuggestion ? (
            <p className="mt-1 text-xs text-foreground">
              That slug is taken.{" "}
              <button
                type="button"
                onClick={() => {
                  setSlug(slugSuggestion);
                  setSlugSuggestion(null);
                  markDirty();
                }}
                className="text-primary underline underline-offset-2"
              >
                Use “{slugSuggestion}”
              </button>
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="post-category" className={labelClass}>
            Category <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <select
            id="post-category"
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              clearError("categoryId");
              markDirty();
            }}
            className={inputClass}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.categoryId} />
        </div>
        <div>
          <span className={labelClass}>Cover image</span>
          <CoverPicker
            value={cover}
            onChange={(next) => {
              setCover(next);
              clearError("coverImageId");
              markDirty();
            }}
            errorMessage={fieldErrors.coverImageId}
          />
        </div>
        <div>
          <label htmlFor="post-excerpt" className={labelClass}>
            Excerpt <span className="font-normal text-on-surface-variant">(optional, shown in cards and meta)</span>
          </label>
          <textarea
            id="post-excerpt"
            value={excerpt}
            onChange={(event) => {
              setExcerpt(event.target.value);
              clearError("excerpt");
              markDirty();
            }}
            rows={2}
            maxLength={300}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-on-surface-variant">{excerpt.length}/300</p>
          <FieldError message={fieldErrors.excerpt} />
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="post-body-heading">
        <h2 id="post-body-heading" className="text-base font-semibold text-foreground">
          Body
        </h2>
        <TiptapEditor
          key={id ?? "new"}
          initialContent={content}
          onChange={(doc) => {
            setContent(doc);
            clearError("content");
            markDirty();
          }}
        />
        <FieldError message={fieldErrors.content} />
      </section>

      <section className="space-y-3" aria-labelledby="post-faq-heading">
        <div className="flex items-center justify-between">
          <h2 id="post-faq-heading" className="text-base font-semibold text-foreground">
            FAQs
          </h2>
          <button
            type="button"
            onClick={() => {
              setFaqs((previous) => [...previous, { question: "", answer: "" }]);
              markDirty();
            }}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-outline-variant px-3 text-sm text-foreground hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Plus size={14} aria-hidden="true" /> Add question
          </button>
        </div>
        {faqs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-outline-variant px-4 py-4 text-sm text-on-surface-variant">
            No FAQs yet. Add question-and-answer pairs to win snippet spots.
          </p>
        ) : (
          <ul className="space-y-4">
            {faqs.map((faq, index) => (
              <li key={index} className="rounded-lg border border-outline-variant bg-background p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                    Question {index + 1}
                  </span>
                  <span className="flex gap-1">
                    <button
                      type="button"
                      aria-label={`Move question ${index + 1} up`}
                      disabled={index === 0}
                      onClick={() => {
                        setFaqs((previous) => {
                          const next = [...previous];
                          [next[index - 1], next[index]] = [next[index], next[index - 1]];
                          return next;
                        });
                        markDirty();
                      }}
                      className="rounded p-1 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move question ${index + 1} down`}
                      disabled={index === faqs.length - 1}
                      onClick={() => {
                        setFaqs((previous) => {
                          const next = [...previous];
                          [next[index + 1], next[index]] = [next[index], next[index + 1]];
                          return next;
                        });
                        markDirty();
                      }}
                      className="rounded p-1 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove question ${index + 1}`}
                      onClick={() => {
                        setFaqs((previous) => previous.filter((_, i) => i !== index));
                        markDirty();
                      }}
                      className="rounded p-1 text-on-surface-variant hover:text-error"
                    >
                      <X size={14} />
                    </button>
                  </span>
                </div>
                <div className="mt-2 space-y-3">
                  <div>
                    <label htmlFor={`faq-q-${index}`} className="sr-only">
                      Question {index + 1}
                    </label>
                    <input
                      id={`faq-q-${index}`}
                      value={faq.question}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFaqs((previous) => previous.map((item, i) => (i === index ? { ...item, question: value } : item)));
                        clearError(`faqs.${index}.question`);
                        markDirty();
                      }}
                      placeholder="Question"
                      className={inputClass}
                    />
                    <FieldError message={fieldErrors[`faqs.${index}.question`]} />
                  </div>
                  <div>
                    <label htmlFor={`faq-a-${index}`} className="sr-only">
                      Answer {index + 1}
                    </label>
                    <textarea
                      id={`faq-a-${index}`}
                      value={faq.answer}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFaqs((previous) => previous.map((item, i) => (i === index ? { ...item, answer: value } : item)));
                        clearError(`faqs.${index}.answer`);
                        markDirty();
                      }}
                      placeholder="Answer"
                      rows={3}
                      className={inputClass}
                    />
                    <FieldError message={fieldErrors[`faqs.${index}.answer`]} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="post-disclaimer-heading">
        <h2 id="post-disclaimer-heading" className="text-base font-semibold text-foreground">
          Disclaimer <span className="text-sm font-normal text-error">required to publish</span>
        </h2>
        <textarea
          value={disclaimer}
          onChange={(event) => {
            setDisclaimer(event.target.value);
            clearError("disclaimer");
            markDirty();
          }}
          rows={3}
          maxLength={2000}
          aria-label="Medical disclaimer"
          aria-invalid={fieldErrors.disclaimer ? true : undefined}
          placeholder="This article is for information only and does not replace personalized advice from a qualified fertility specialist."
          className={inputClass}
        />
        <p className="text-xs text-on-surface-variant">{disclaimer.trim().length}/2000 (minimum 20 to publish)</p>
        <FieldError message={fieldErrors.disclaimer} />
      </section>

      <section className="space-y-3 rounded-xl border border-outline-variant bg-background p-4" aria-labelledby="post-review-heading">
        <h2 id="post-review-heading" className="text-base font-semibold text-foreground">
          Review attestation
        </h2>
        <p className="text-xs text-on-surface-variant">Author attestation — not a licensure verification.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="reviewer-name" className={labelClass}>
              Reviewer name
            </label>
            <input
              id="reviewer-name"
              value={reviewerName}
              onChange={(event) => {
                setReviewerName(event.target.value);
                clearError("reviewerName");
                markDirty();
              }}
              maxLength={120}
              className={inputClass}
            />
            <FieldError message={fieldErrors.reviewerName} />
          </div>
          <div>
            <label htmlFor="reviewer-credential" className={labelClass}>
              Credential
            </label>
            <input
              id="reviewer-credential"
              value={reviewerCredential}
              onChange={(event) => {
                setReviewerCredential(event.target.value);
                clearError("reviewerCredential");
                markDirty();
              }}
              maxLength={120}
              placeholder="MBBS, FRCOG"
              className={inputClass}
            />
            <FieldError message={fieldErrors.reviewerCredential} />
          </div>
          <div>
            <label htmlFor="reviewed-at" className={labelClass}>
              Reviewed on
            </label>
            <input
              id="reviewed-at"
              type="date"
              value={reviewedAt}
              onChange={(event) => {
                setReviewedAt(event.target.value);
                clearError("reviewedAt");
                markDirty();
              }}
              className={inputClass}
            />
            <FieldError message={fieldErrors.reviewedAt} />
          </div>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="post-seo-heading">
        <h2 id="post-seo-heading" className="text-base font-semibold text-foreground">
          SEO
        </h2>
        <div>
          <label htmlFor="meta-title" className={labelClass}>
            Meta title
          </label>
          <input
            id="meta-title"
            value={metaTitle}
            onChange={(event) => {
              setMetaTitle(event.target.value);
              clearError("metaTitle");
              markDirty();
            }}
            maxLength={60}
            placeholder={title.slice(0, 60)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-on-surface-variant">{metaTitle.length}/60</p>
          <FieldError message={fieldErrors.metaTitle} />
        </div>
        <div>
          <label htmlFor="meta-description" className={labelClass}>
            Meta description
          </label>
          <textarea
            id="meta-description"
            value={metaDescription}
            onChange={(event) => {
              setMetaDescription(event.target.value);
              clearError("metaDescription");
              markDirty();
            }}
            rows={2}
            maxLength={160}
            placeholder={(excerpt || "").slice(0, 160)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-on-surface-variant">{metaDescription.length}/160</p>
          <FieldError message={fieldErrors.metaDescription} />
        </div>
        <div className="flex items-start gap-2">
          <input
            id="noindex"
            type="checkbox"
            checked={noindex}
            onChange={(event) => {
              setNoindex(event.target.checked);
              markDirty();
            }}
            className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <div>
            <label htmlFor="noindex" className={labelClass}>
              Hide from search engines
            </label>
            <p className="text-xs text-on-surface-variant">
              Adds <code>noindex</code> and removes this post from the sitemap. Use for placeholder or
              unpublished-in-search content.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-outline-variant bg-background p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">Search preview</p>
          <p className="mt-2 truncate text-lg text-[#1a0dab]">{metaTitle || title || "Post title"}</p>
          <p className="truncate text-sm text-[#006621]">lawonbloomfertilitycentre.com/blog/{slug || "…"}</p>
          <p className="mt-0.5 line-clamp-2 text-sm text-[#4d5156]">
            {metaDescription || excerpt || "The meta description will appear here."}
          </p>
        </div>
        <div className="rounded-lg border border-outline-variant bg-background p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">Social card preview</p>
          <div className="mt-2 rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <p className="truncate text-sm font-semibold text-foreground">{metaTitle || title || "Post title"}</p>
            <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant">
              {metaDescription || excerpt || "Social description preview."}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-wide text-on-surface-variant">
              lawonbloomfertilitycentre.com
            </p>
          </div>
        </div>
      </section>
    </form>
  );
}
