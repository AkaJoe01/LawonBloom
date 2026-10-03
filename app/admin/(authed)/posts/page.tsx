import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { POSTS_PAGE_SIZE, postListOrderBy, postListWhere } from "@/lib/posts/list";
import { postListQuery } from "@/lib/validation/post";

export const metadata: Metadata = { title: "Posts" };

const statusStyles: Record<string, string> = {
  DRAFT: "bg-surface-container-high text-on-surface-variant",
  PUBLISHED: "bg-primary-fixed text-on-primary-fixed-variant",
};

function filterUrl(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return `/admin/posts${qs ? `?${qs}` : ""}`;
}

function sortHref(
  current: { sort: string; dir: string; status?: string; category?: string; q?: string },
  sort: string,
): string {
  const nextDir = current.sort === sort && current.dir === "asc" ? "desc" : "asc";
  return filterUrl({
    sort,
    dir: nextDir,
    status: current.status,
    category: current.category,
    q: current.q,
    page: undefined,
  });
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const single = (key: string): string | undefined => {
    const value = sp[key];
    return typeof value === "string" ? value : undefined;
  };

  const parsed = postListQuery.safeParse({
    status: single("status"),
    category: single("category"),
    q: single("q"),
    page: single("page"),
  });
  const query = parsed.success ? parsed.data : postListQuery.parse({});
  const sort = single("sort") ?? "updated";
  const dir = single("dir") ?? (sort === "title" ? "asc" : "desc");
  const filtersActive = Boolean(query.status || query.category || query.q);

  const db = getDb();
  const where = postListWhere(query);
  const [items, total, categories] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: postListOrderBy(sort, dir),
      skip: (query.page - 1) * POSTS_PAGE_SIZE,
      take: POSTS_PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        category: { select: { name: true, slug: true } },
        createdByUser: { select: { name: true } },
      },
    }),
    db.post.count({ where }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true, slug: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PAGE_SIZE));
  const pageHref = (page: number) =>
    filterUrl({
      status: query.status,
      category: query.category,
      q: query.q,
      sort: sort !== "updated" ? sort : undefined,
      dir: sort !== "updated" ? dir : undefined,
      page: page > 1 ? String(page) : undefined,
    });

  const sortIndicator = (key: string) => {
    if (sort !== key) return null;
    return <span aria-hidden="true">{dir === "asc" ? " ↑" : " ↓"}</span>;
  };
  const ariaSort = (key: string): "ascending" | "descending" | undefined =>
    sort === key ? (dir === "asc" ? "ascending" : "descending") : undefined;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Posts</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {total} {total === 1 ? "post" : "posts"}
            {filtersActive ? " matching filters" : ""}
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          New post
        </Link>
      </header>

      <form method="get" action="/admin/posts" className="flex flex-wrap items-end gap-3 rounded-xl border border-outline-variant bg-background p-4">
        <div className="min-w-40">
          <label htmlFor="filter-status" className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            Status
          </label>
          <select
            id="filter-status"
            name="status"
            defaultValue={query.status ?? ""}
            className="mt-1 w-full rounded-md border border-outline-variant bg-background px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">All</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
        <div className="min-w-44">
          <label htmlFor="filter-category" className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            Category
          </label>
          <select
            id="filter-category"
            name="category"
            defaultValue={query.category ?? ""}
            className="mt-1 w-full rounded-md border border-outline-variant bg-background px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-48 flex-1">
          <label htmlFor="filter-q" className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            Search
          </label>
          <input
            id="filter-q"
            name="q"
            type="search"
            defaultValue={query.q ?? ""}
            placeholder="Title contains…"
            className="mt-1 w-full rounded-md border border-outline-variant bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Filter
        </button>
        {filtersActive ? (
          <Link
            href="/admin/posts"
            className="h-9 rounded-md border border-outline-variant px-3 py-2 text-sm text-foreground hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Clear
          </Link>
        ) : null}
      </form>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-outline-variant bg-background p-8 text-center text-sm text-on-surface-variant">
          {filtersActive
            ? "No posts match these filters. Try clearing them."
            : "No posts yet. Create your first draft."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-outline-variant bg-background">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <caption className="sr-only">Blog posts with status, category, author, and last updated</caption>
            <thead>
              <tr className="border-b border-outline-variant text-left text-xs uppercase tracking-wide text-on-surface-variant">
                <th scope="col" aria-sort={ariaSort("title")} className="px-4 py-3 font-medium">
                  <a href={sortHref({ sort, dir, status: query.status, category: query.category, q: query.q }, "title")} className="hover:text-primary">
                    Title{sortIndicator("title")}
                  </a>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Category
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Author
                </th>
                <th scope="col" aria-sort={ariaSort("updated")} className="px-4 py-3 font-medium">
                  <a href={sortHref({ sort, dir, status: query.status, category: query.category, q: query.q }, "updated")} className="hover:text-primary">
                    Updated{sortIndicator("updated")}
                  </a>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {items.map((post) => (
                <tr key={post.id} className="hover:bg-surface-container-low/60">
                  <td className="max-w-72 px-4 py-3">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="block truncate font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {post.title}
                    </Link>
                    <span className="text-xs text-on-surface-variant">/{post.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[post.status] ?? ""}`}>
                      {post.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{post.category.name}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{post.createdByUser.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">
                    <time dateTime={post.updatedAt.toISOString()}>
                      {post.updatedAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link
                      href={`/admin/preview/${post.id}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Preview
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Posts pagination" className="flex items-center justify-between gap-3">
          <Link
            href={pageHref(query.page - 1)}
            aria-disabled={query.page <= 1 ? true : undefined}
            className={`rounded-md border border-outline-variant px-3 py-1.5 text-sm ${
              query.page <= 1
                ? "pointer-events-none text-on-surface-variant/50"
                : "text-foreground hover:bg-surface-container-low"
            }`}
          >
            ← Previous
          </Link>
          <p className="text-sm text-on-surface-variant">
            Page {query.page} of {totalPages}
          </p>
          <Link
            href={pageHref(query.page + 1)}
            aria-disabled={query.page >= totalPages ? true : undefined}
            className={`rounded-md border border-outline-variant px-3 py-1.5 text-sm ${
              query.page >= totalPages
                ? "pointer-events-none text-on-surface-variant/50"
                : "text-foreground hover:bg-surface-container-low"
            }`}
          >
            Next →
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
