import Image from "next/image";
import Link from "next/link";
import type { PostCardData } from "@/lib/blog/queries";

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function PostCard({
  post,
  headingLevel = "h2",
  featured = false,
}: {
  post: PostCardData;
  headingLevel?: "h2" | "h3";
  featured?: boolean;
}) {
  const Heading = headingLevel;
  const cover = post.coverImage;
  const date = post.publishedAt ? new Date(post.publishedAt) : null;

  return (
    <li className={featured ? "sm:col-span-2" : undefined}>
      <Link
        href={`/blog/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant bg-background transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className={`relative bg-surface-container-low ${featured ? "aspect-[16/8]" : "aspect-[16/9]"}`}>
          {cover ? (
            <Image
              src={cover.url}
              alt={cover.isDecorative ? "" : (cover.altText ?? "")}
              fill
              priority={featured}
              sizes={
                featured
                  ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              }
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-surface-container-low"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            {post.category.name}
          </p>
          <Heading
            className={`font-serif leading-snug text-foreground transition-colors group-hover:text-primary ${
              featured ? "text-2xl md:text-3xl" : "text-xl"
            }`}
          >
            {post.title}
          </Heading>
          {post.excerpt ? (
            <p className={`text-sm leading-relaxed text-on-surface-variant ${featured ? "" : "line-clamp-3"}`}>
              {post.excerpt}
            </p>
          ) : null}
          <p className="mt-auto flex flex-wrap items-center gap-x-2 pt-2 text-xs text-on-surface-variant">
            {date ? <time dateTime={date.toISOString()}>{formatDate(date)}</time> : null}
            {date ? <span aria-hidden="true">·</span> : null}
            <span>{post.readingTime} min read</span>
          </p>
        </div>
      </Link>
    </li>
  );
}
