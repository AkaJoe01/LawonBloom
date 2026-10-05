import Link from "next/link";

function pageUrl(basePath: string, page: number, params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function BlogPagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const extra = params ?? {};
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between gap-3">
      <Link
        href={pageUrl(basePath, page - 1, extra)}
        rel="prev"
        aria-disabled={page <= 1 ? true : undefined}
        className={`rounded-full border border-outline-variant px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          page <= 1
            ? "pointer-events-none text-on-surface-variant/50"
            : "text-foreground hover:border-primary hover:text-primary"
        }`}
      >
        ← Previous
      </Link>
      <p className="text-sm text-on-surface-variant">
        Page {page} of {totalPages}
      </p>
      <Link
        href={pageUrl(basePath, page + 1, extra)}
        rel="next"
        aria-disabled={page >= totalPages ? true : undefined}
        className={`rounded-full border border-outline-variant px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          page >= totalPages
            ? "pointer-events-none text-on-surface-variant/50"
            : "text-foreground hover:border-primary hover:text-primary"
        }`}
      >
        Next →
      </Link>
    </nav>
  );
}
