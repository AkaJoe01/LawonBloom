import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { BLOG_TAG, postTag } from "@/lib/cache";
import { getDb } from "@/lib/db";

export const BLOG_PAGE_SIZE = 9;
export const RSS_POST_LIMIT = 20;

const PUBLISHED = "PUBLISHED" as const;

export const postCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  publishedAt: true,
  readingTime: true,
  category: { select: { name: true, slug: true } },
  coverImage: { select: { url: true, width: true, height: true, altText: true, isDecorative: true } },
} satisfies Prisma.PostSelect;

export const postPageSelect = {
  ...postCardSelect,
  categoryId: true,
  content: true,
  plainText: true,
  disclaimer: true,
  reviewerName: true,
  reviewerCredential: true,
  reviewedAt: true,
  faqs: true,
  metaTitle: true,
  metaDescription: true,
  noindex: true,
  updatedAt: true,
  createdByUser: { select: { name: true } },
} satisfies Prisma.PostSelect;

export type PostCardData = Prisma.PostGetPayload<{ select: typeof postCardSelect }>;
export type PostPageData = Prisma.PostGetPayload<{ select: typeof postPageSelect }>;

function asDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function reviveCard<T extends { publishedAt: Date | string | null }>(row: T): T {
  if (!row.publishedAt) return row;
  return { ...row, publishedAt: asDate(row.publishedAt) };
}

function revivePage(row: PostPageData): PostPageData {
  return {
    ...reviveCard(row),
    updatedAt: asDate(row.updatedAt),
    reviewedAt: row.reviewedAt ? asDate(row.reviewedAt) : null,
  };
}

async function fetchIndexPage(page: number): Promise<{ items: PostCardData[]; total: number }> {
  const db = getDb();
  const where: Prisma.PostWhereInput = { status: PUBLISHED };
  const [items, total] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * BLOG_PAGE_SIZE,
      take: BLOG_PAGE_SIZE,
      select: postCardSelect,
    }),
    db.post.count({ where }),
  ]);
  return { items, total };
}

export async function getBlogIndex(page: number): Promise<{
  items: PostCardData[];
  total: number;
}> {
  const data = await unstable_cache(fetchIndexPage, ["blog-index"], {
    revalidate: 60,
    tags: [BLOG_TAG],
  })(page);
  return { total: data.total, items: data.items.map(reviveCard) };
}

async function fetchCategoryPage(
  slug: string,
  page: number,
): Promise<{ category: { name: string; slug: string; description: string | null }; items: PostCardData[]; total: number } | null> {
  const db = getDb();
  const category = await db.category.findUnique({
    where: { slug },
    select: { name: true, slug: true, description: true },
  });
  if (!category) return null;
  const where: Prisma.PostWhereInput = { status: PUBLISHED, category: { slug } };
  const [items, total] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * BLOG_PAGE_SIZE,
      take: BLOG_PAGE_SIZE,
      select: postCardSelect,
    }),
    db.post.count({ where }),
  ]);
  return { category, items, total };
}

export async function getBlogCategory(
  slug: string,
  page: number,
): Promise<{
  category: { name: string; slug: string; description: string | null };
  items: PostCardData[];
  total: number;
} | null> {
  const data = await unstable_cache(fetchCategoryPage, ["blog-category"], {
    revalidate: 60,
    tags: [BLOG_TAG],
  })(slug, page);
  if (!data) return null;
  return { category: data.category, total: data.total, items: data.items.map(reviveCard) };
}

function searchWhere(q: string): Prisma.Sql {
  const pattern = `%${q.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
  return Prisma.sql`status = 'PUBLISHED' AND (
    "searchTsv" @@ websearch_to_tsquery('english', ${q})
    OR "title" ILIKE ${pattern} ESCAPE '\\'
    OR "plainText" ILIKE ${pattern} ESCAPE '\\'
  )`;
}

export async function searchPublishedPosts(
  q: string,
  page: number,
): Promise<{ items: PostCardData[]; total: number }> {
  const db = getDb();
  const where = searchWhere(q);
  const offset = (page - 1) * BLOG_PAGE_SIZE;
  const [idRows, countRows] = await Promise.all([
    db.$queryRaw<{ id: string }[]>(
      Prisma.sql`SELECT id FROM "Post" WHERE ${where}
        ORDER BY ts_rank_cd("searchTsv", websearch_to_tsquery('english', ${q})) DESC, "publishedAt" DESC
        LIMIT ${BLOG_PAGE_SIZE} OFFSET ${offset}`,
    ),
    db.$queryRaw<{ count: bigint }[]>(
      Prisma.sql`SELECT COUNT(*) AS count FROM "Post" WHERE ${where}`,
    ),
  ]);
  const total = countRows.length > 0 ? Number(countRows[0].count) : 0;
  const ids = idRows.map((row) => row.id);
  if (ids.length === 0) return { items: [], total };
  const rows = await db.post.findMany({ where: { id: { in: ids } }, select: postCardSelect });
  const byId = new Map(rows.map((row) => [row.id, row]));
  const items = ids.flatMap((id) => {
    const row = byId.get(id);
    return row ? [reviveCard(row)] : [];
  });
  return { items, total };
}

async function fetchPostBySlug(slug: string): Promise<PostPageData | null> {
  const db = getDb();
  return db.post.findFirst({ where: { slug, status: PUBLISHED }, select: postPageSelect });
}

export async function getPostBySlug(slug: string): Promise<PostPageData | null> {
  const post = await unstable_cache(fetchPostBySlug, ["blog-post"], {
    revalidate: 300,
    tags: [BLOG_TAG, postTag(slug)],
  })(slug);
  return post ? revivePage(post) : null;
}

async function fetchRelatedPosts(slug: string, categoryId: string): Promise<PostCardData[]> {
  const db = getDb();
  const rows = await db.post.findMany({
    where: { status: PUBLISHED, category: { id: categoryId }, slug: { not: slug } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: postCardSelect,
  });
  return rows.map(reviveCard);
}

export async function getRelatedPosts(slug: string, categoryId: string): Promise<PostCardData[]> {
  return unstable_cache(fetchRelatedPosts, ["blog-related"], { revalidate: 60, tags: [BLOG_TAG] })(
    slug,
    categoryId,
  );
}

async function fetchCategories(): Promise<
  { name: string; slug: string; publishedCount: number }[]
> {
  const db = getDb();
  const rows = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      name: true,
      slug: true,
      _count: { select: { posts: { where: { status: PUBLISHED } } } },
    },
  });
  return rows.map((row) => ({ name: row.name, slug: row.slug, publishedCount: row._count.posts }));
}

export function getBlogCategories() {
  return unstable_cache(fetchCategories, ["blog-categories"], { revalidate: 60, tags: [BLOG_TAG] })();
}

async function fetchRssPosts(): Promise<
  {
    title: string;
    slug: string;
    excerpt: string | null;
    plainText: string;
    publishedAt: Date | null;
    category: { name: string };
  }[]
> {
  const db = getDb();
  return db.post.findMany({
    where: { status: PUBLISHED },
    orderBy: { publishedAt: "desc" },
    take: RSS_POST_LIMIT,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      plainText: true,
      publishedAt: true,
      category: { select: { name: true } },
    },
  });
}

export async function getRssPosts() {
  const posts = await unstable_cache(fetchRssPosts, ["blog-rss"], {
    revalidate: 1800,
    tags: [BLOG_TAG],
  })();
  return posts.map(reviveCard);
}
