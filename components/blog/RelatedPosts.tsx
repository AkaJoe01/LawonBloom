import PostCard from "./PostCard";
import type { PostCardData } from "@/lib/blog/queries";

export default function RelatedPosts({ posts }: { posts: PostCardData[] }) {
  if (posts.length === 0) return null;
  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="font-serif text-2xl text-foreground md:text-3xl">
        Related reading
      </h2>
      <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} headingLevel="h3" />
        ))}
      </ul>
    </section>
  );
}
