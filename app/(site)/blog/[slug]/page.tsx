import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookConsultationCta from "@/components/blog/BookConsultationCta";
import EnquiryForm from "@/components/blog/EnquiryForm";
import FaqSection, { type Faq } from "@/components/blog/FaqSection";
import MedicalDisclaimer from "@/components/blog/MedicalDisclaimer";
import PostBody from "@/components/blog/PostBody";
import PostHero from "@/components/blog/PostHero";
import RelatedPosts from "@/components/blog/RelatedPosts";
import ReviewerAttestation from "@/components/blog/ReviewerAttestation";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog/queries";
import { renderPostHtml } from "@/lib/posts/render";
import type { TiptapDoc } from "@/lib/validation/post";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const html = post.content ? renderPostHtml(post.content as unknown as TiptapDoc) : "";
  const faqs = (Array.isArray(post.faqs) ? post.faqs : []) as unknown as Faq[];
  const related = await getRelatedPosts(slug, post.categoryId);

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:pt-14">
      <article className="space-y-8">
        <PostHero
          title={post.title}
          category={post.category}
          publishedAt={post.publishedAt}
          readingTime={post.readingTime}
        />

        {post.reviewerName ? (
          <ReviewerAttestation
            name={post.reviewerName}
            credential={post.reviewerCredential}
            reviewedAt={post.reviewedAt}
          />
        ) : null}

        {post.excerpt ? (
          <p className="text-lg leading-relaxed text-on-surface-variant">{post.excerpt}</p>
        ) : null}

        {html ? <PostBody html={html} /> : <p className="text-sm text-on-surface-variant">This article is being updated.</p>}

        {post.disclaimer ? <MedicalDisclaimer text={post.disclaimer} /> : null}

        <FaqSection faqs={faqs} />

        <BookConsultationCta />

        <RelatedPosts posts={related} />

        <EnquiryForm variant="inline" postSlug={slug} />
      </article>
    </div>
  );
}
