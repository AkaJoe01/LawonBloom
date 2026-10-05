import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import BlogPagination from "@/components/blog/BlogPagination";
import CategoryNav from "@/components/blog/CategoryNav";
import PostCard from "@/components/blog/PostCard";
import { BLOG_PAGE_SIZE, getBlogCategories, getBlogCategory } from "@/lib/blog/queries";
import { blogPageQuery } from "@/lib/validation/blog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getBlogCategory(slug, 1);
  if (!category) return { title: "Category not found" };
  return { title: category.category.name };
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const parsed = blogPageQuery.safeParse({
    page: typeof sp.page === "string" ? sp.page : undefined,
  });
  const page = parsed.success ? parsed.data.page : 1;

  const [result, categories] = await Promise.all([
    getBlogCategory(slug, page),
    getBlogCategories(),
  ]);
  if (!result) notFound();

  const totalPages = Math.max(1, Math.ceil(result.total / BLOG_PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 md:pt-16">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Category</p>
        <h1 className="mt-6 font-serif text-4xl leading-[1] tracking-[-0.04em] text-foreground md:text-5xl">
          {result.category.name}
        </h1>
        {result.category.description ? (
          <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
            {result.category.description}
          </p>
        ) : null}
      </header>

      <CategoryNav categories={categories} current={result.category.slug} />

      {result.items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-outline-variant bg-background p-10 text-center">
          <p className="text-sm text-on-surface-variant">
            No articles in {result.category.name} yet.
          </p>
          <Link
            href="/blog"
            className="mt-3 inline-block text-sm font-medium text-primary underline underline-offset-2"
          >
            Browse all articles
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((post, index) => (
            <PostCard key={post.id} post={post} featured={index === 0 && page === 1} />
          ))}
        </ul>
      )}

      <BlogPagination page={page} totalPages={totalPages} basePath={`/blog/category/${slug}`} />
    </div>
  );
}
