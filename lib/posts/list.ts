import type { Prisma } from "@prisma/client";
import type { PostListQuery } from "@/lib/validation/post";

export const POSTS_PAGE_SIZE = 10;

export function postListWhere(query: PostListQuery): Prisma.PostWhereInput {
  const { status, category, q } = query;
  return {
    ...(status ? { status } : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
  };
}

export function postListOrderBy(
  sort: string | undefined,
  dir: string | undefined,
): Prisma.PostOrderByWithRelationInput {
  if (sort === "title") {
    return { title: dir === "desc" ? "desc" : "asc" };
  }
  if (sort === "published") {
    return { publishedAt: dir === "asc" ? "asc" : "desc" };
  }
  return { updatedAt: dir === "asc" ? "asc" : "desc" };
}
