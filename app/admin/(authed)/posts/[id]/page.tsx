import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostEditor, { type EditorPost } from "@/components/admin/post-editor";
import { getDb } from "@/lib/db";
import type { TiptapDoc } from "@/lib/validation/post";

export const metadata: Metadata = { title: "Edit post" };

interface Faq {
  question: string;
  answer: string;
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const [post, categories] = await Promise.all([
    db.post.findUnique({ where: { id } }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!post) notFound();

  const initial: EditorPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content ? (post.content as unknown as TiptapDoc) : null,
    categoryId: post.categoryId,
    coverImageId: post.coverImageId,
    status: post.status,
    disclaimer: post.disclaimer,
    reviewerName: post.reviewerName,
    reviewerCredential: post.reviewerCredential,
    reviewedAt: post.reviewedAt ? post.reviewedAt.toISOString() : null,
    faqs: Array.isArray(post.faqs) ? (post.faqs as unknown as Faq[]) : null,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
  };

  return <PostEditor categories={categories} initial={initial} />;
}
