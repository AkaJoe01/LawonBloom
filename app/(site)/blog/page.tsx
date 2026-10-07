import type { Metadata } from "next";
import BlogHeader from "@/components/blog/BlogHeader";
import BlogPagination from "@/components/blog/BlogPagination";
import CategoryNav from "@/components/blog/CategoryNav";
import EnquiryForm from "@/components/blog/EnquiryForm";
import PostCard from "@/components/blog/PostCard";
import { BLOG_PAGE_SIZE, getBlogCategories, getBlogIndex } from "@/lib/blog/queries";
import { buildIndexMetadata } from "@/lib/seo";
import { blogPageQuery } from "@/lib/validation/blog";

export const dynamic = "force-dynamic";

function readPage(
  sp: Record<string, string | string[] | undefined>,
): number {
  const parsed = blogPageQuery.safeParse({
    page: typeof sp.page === "string" ? sp.page : undefined,
  });
  return parsed.success ? parsed.data.page : 1;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  return buildIndexMetadata(readPage(await searchParams));
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = readPage(sp);

  const [{ items, total }, categories] = await Promise.all([
    getBlogIndex(page),
    getBlogCategories(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 md:pt-16">
      <BlogHeader />
      <CategoryNav categories={categories} />

      {items.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-outline-variant bg-background p-10 text-center text-sm text-on-surface-variant">
          No articles published yet. New writing from the clinic is on its way.
        </p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post, index) => (
            <PostCard key={post.id} post={post} featured={index === 0 && page === 1} />
          ))}
        </ul>
      )}

      <BlogPagination page={page} totalPages={totalPages} basePath="/blog" />

      <div className="mt-16">
        <EnquiryForm variant="compact" />
      </div>
    </div>
  );
}