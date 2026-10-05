import Link from "next/link";

export interface NavCategory {
  name: string;
  slug: string;
}

export default function CategoryNav({
  categories,
  current,
}: {
  categories: NavCategory[];
  current?: string;
}) {
  return (
    <nav aria-label="Categories" className="mt-8 -mx-6 px-6 md:-mx-0 md:px-0">
      <ul className="flex gap-2 overflow-x-auto pb-2">
        <li className="shrink-0">
          <Link
            href="/blog"
            aria-current={current === undefined ? "page" : undefined}
            className={`inline-flex h-9 items-center rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              current === undefined
                ? "border-primary bg-primary text-on-primary"
                : "border-outline-variant text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            All
          </Link>
        </li>
        {categories.map((category) => {
          const active = current === category.slug;
          return (
            <li key={category.slug} className="shrink-0">
              <Link
                href={`/blog/category/${category.slug}`}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-9 items-center rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
