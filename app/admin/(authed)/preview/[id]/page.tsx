import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostBody from "@/components/blog/PostBody";
import { getDb } from "@/lib/db";
import { renderPostHtml } from "@/lib/posts/render";
import type { TiptapDoc } from "@/lib/validation/post";

export const metadata: Metadata = { title: "Preview" };

interface Faq {
  question: string;
  answer: string;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const post = await db.post.findUnique({
    where: { id },
    include: {
      category: true,
      createdByUser: { select: { name: true } },
    },
  });
  if (!post) notFound();

  const isDraft = post.status === "DRAFT";
  const html = post.content ? renderPostHtml(post.content as unknown as TiptapDoc) : "";
  const faqs = (Array.isArray(post.faqs) ? post.faqs : []) as unknown as Faq[];
  const bylineDate = post.publishedAt ?? post.createdAt;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/admin/posts/${post.id}`}
          className="text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          ← Back to editor
        </Link>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isDraft ? "bg-surface-container-high text-on-surface-variant" : "bg-primary-fixed text-on-primary-fixed-variant"
          }`}
        >
          {isDraft ? "Draft preview" : "Published"}
        </span>
      </div>

      <p className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
        This is how the post will render on the public site.
        {isDraft ? " Drafts never appear at public URLs." : ""}
      </p>

      <article className="relative overflow-hidden rounded-xl border border-outline-variant bg-background p-6 md:p-10">
        {isDraft ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2 top-6 select-none rotate-[-14deg] text-5xl font-bold tracking-widest text-on-surface-variant/10"
          >
            DRAFT
          </span>
        ) : null}

        <p className="text-xs font-medium uppercase tracking-widest text-primary">{post.category.name}</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-foreground md:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          <time dateTime={bylineDate.toISOString()}>{formatDate(bylineDate)}</time>
          {" · "}
          {post.readingTime} min read
          {post.createdByUser.name ? <> · by {post.createdByUser.name}</> : null}
        </p>

        {post.reviewerName ? (
          <p className="mt-3 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface-variant">
            Medically reviewed by <strong className="font-semibold text-foreground">{post.reviewerName}</strong>
            {post.reviewerCredential ? `, ${post.reviewerCredential}` : ""}
            {post.reviewedAt ? <> · {formatDate(post.reviewedAt)}</> : null}
          </p>
        ) : null}

        {post.excerpt ? <p className="mt-5 text-lg leading-relaxed text-on-surface-variant">{post.excerpt}</p> : null}

        <div className="mt-6">
          {html ? (
            <PostBody html={html} />
          ) : (
            <p className="rounded-lg border border-dashed border-outline-variant p-6 text-sm text-on-surface-variant">
              The body is still empty.
            </p>
          )}
        </div>

        {post.disclaimer ? (
          <aside className="mt-8 rounded-lg border-l-4 border-primary bg-primary-fixed/30 px-4 py-3 text-sm text-foreground">
            <strong className="font-semibold">Medical disclaimer: </strong>
            {post.disclaimer}
          </aside>
        ) : null}

        {faqs.length > 0 ? (
          <section className="mt-8" aria-label="Frequently asked questions">
            <h2 className="text-xl font-semibold text-foreground">Frequently asked questions</h2>
            <dl className="mt-4 space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="font-medium text-foreground">{faq.question}</dt>
                  <dd className="mt-1 text-on-surface-variant">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </article>
    </div>
  );
}
