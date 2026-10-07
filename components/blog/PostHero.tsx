import Link from "next/link";

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PostHero({
  title,
  category,
  publishedAt,
  readingTime,
}: {
  title: string;
  category: { name: string; slug: string };
  publishedAt: Date | string | null;
  readingTime: number;
}) {
  const date = publishedAt ? new Date(publishedAt) : null;
  return (
    <header>
      <Link
        href={`/blog/category/${category.slug}`}
        className="text-xs font-medium uppercase tracking-[0.2em] text-primary hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {category.name}
      </Link>
      <h1 className="mt-4 font-serif text-3xl leading-[1.05] tracking-[-0.03em] text-foreground md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-sm text-on-surface-variant">
        {date ? (
          <>
            <time dateTime={date.toISOString()}>{formatDate(date)}</time>
            <span aria-hidden="true"> · </span>
          </>
        ) : null}
        {readingTime} min read
      </p>
    </header>
  );
}
