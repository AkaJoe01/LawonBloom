import type { Metadata } from "next";
import CategoryNav from "@/components/blog/CategoryNav";
import PostCard from "@/components/blog/PostCard";
import BlogPagination from "@/components/blog/BlogPagination";
import { BLOG_PAGE_SIZE, getBlogCategories, searchPublishedPosts } from "@/lib/blog/queries";
import { searchQuery } from "@/lib/validation/blog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search the journal",
  robots: { index: false, follow: false },
};

export default async function BlogSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawQ = (typeof sp.q === "string" ? sp.q : "").trim();
  const rawPage = typeof sp.page === "string" ? sp.page : undefined;

  const categories = await getBlogCategories();

  const parsed = searchQuery.safeParse({ q: rawQ, page: rawPage });
  const idle = rawQ.length === 0;
  const tooShort = !idle && !parsed.success;

  let results: { items: Awaited<ReturnType<typeof searchPublishedPosts>>["items"]; total: number } | null = null;
  let page = 1;
  if (parsed.success) {
    page = parsed.data.page;
    results = await searchPublishedPosts(parsed.data.q, page);
  }
  const totalPages = results ? Math.max(1, Math.ceil(results.total / BLOG_PAGE_SIZE)) : 1;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 md:pt-16">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Search</p>
        <h1 className="mt-6 font-serif text-4xl leading-[1] tracking-[-0.04em] text-foreground md:text-5xl">
          Search the journal
        </h1>
      </header>

      <form
        method="get"
        action="/blog/search"
        role="search"
        className="mt-8 flex max-w-xl gap-2"
      >
        <label htmlFor="journal-search" className="sr-only">
          Search articles
        </label>
        <input
          id="journal-search"
          type="search"
          name="q"
          defaultValue={rawQ}
          placeholder="IVF, egg freezing, IUI…"
          minLength={2}
          maxLength={100}
          className="h-11 w-full rounded-full border border-outline-variant bg-background px-4 text-sm text-foreground placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <button
          type="submit"
          className="h-11 shrink-0 rounded-full bg-primary px-5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Search
        </button>
      </form>

      <div className="mt-8">
        {idle ? (
          <div>
            <p className="text-sm text-on-surface-variant">
              Search across every published article — try “IVF”, “implantation”, or “IUI”.
            </p>
            <div className="mt-6">
              <CategoryNav categories={categories} />
            </div>
          </div>
        ) : tooShort ? (
          <p role="status" className="text-sm text-on-surface-variant">
            Keep typing — searches need at least 2 characters.
          </p>
        ) : results && results.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant bg-background p-10 text-center">
            <p className="text-sm text-on-surface-variant">
              No articles match “{rawQ}”. Try a broader term, or browse a category:
            </p>
            <div className="mt-4 flex justify-center">
              <CategoryNav categories={categories} />
            </div>
          </div>
        ) : results ? (
          <>
            <p role="status" className="text-sm text-on-surface-variant">
              {results.total} {results.total === 1 ? "result" : "results"} for “{rawQ}”
            </p>
            <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.items.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </ul>
            <BlogPagination
              page={page}
              totalPages={totalPages}
              basePath="/blog/search"
              params={{ q: rawQ }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
