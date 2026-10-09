import type { Prisma } from "@prisma/client";
import { logEvent } from "@/lib/observability/log";
import { NextResponse } from "next/server";
import { requireStaff, perUserGate } from "@/lib/auth/guards";
import { getDb } from "@/lib/db";
import { apiError } from "@/lib/api-error";
import { computeReadingTime, derivePlainText, suggestUniqueSlug } from "@/lib/posts/derive";
import { refFieldErrors } from "@/lib/posts/write";
import { originRejection } from "@/lib/security/origin";
import { zodFieldErrors } from "@/lib/validation/common";
import { postCreate, postListQuery } from "@/lib/validation/post";

export const runtime = "nodejs";

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const parsed = postListQuery.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
  });
  if (!parsed.success) {
    return apiError(400, "validation", "Invalid query parameters.", { fieldErrors: zodFieldErrors(parsed.error) });
  }

  const { status, category, q, page } = parsed.data;
  const where: Prisma.PostWhereInput = {
    ...(status ? { status } : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
  };

  const db = getDb();
  const [items, total] = await db.$transaction([
    db.post.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        excerpt: true,
        readingTime: true,
        category: { select: { name: true, slug: true } },
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        createdByUser: { select: { name: true } },
      },
    }),
    db.post.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize: PAGE_SIZE });
}

export async function POST(request: Request) {
  const rejected = originRejection(request);
  if (rejected) return rejected;

  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const gate = await perUserGate(guard.session.user.id, 30, 60, "post-create");
  if (gate) return gate;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return apiError(400, "invalid_json", "Invalid JSON body.");
  }
  const parsed = postCreate.safeParse(raw);
  if (!parsed.success) {
    return apiError(400, "validation", "Invalid post.", { fieldErrors: zodFieldErrors(parsed.error) });
  }
  const input = parsed.data;

  const db = getDb();
  const refErrors = await refFieldErrors(db, input);
  if (refErrors) {
    return apiError(400, "validation", "Invalid references.", { fieldErrors: refErrors });
  }

  const slugTaken = async (slug: string) => Boolean(await db.post.findUnique({ where: { slug } }));
  if (await slugTaken(input.slug)) {
    const suggestion = await suggestUniqueSlug(input.slug, slugTaken);
    return apiError(409, "duplicate_slug", "That slug is already in use.", { suggestion });
  }

  const plainText = derivePlainText(input.content);
  const post = await db.post.create({
    data: {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt ?? null,
      content: input.content as unknown as Prisma.InputJsonValue,
      plainText,
      readingTime: computeReadingTime(plainText),
      categoryId: input.categoryId,
      coverImageId: input.coverImageId ?? null,
      disclaimer: input.disclaimer,
      reviewerName: input.reviewerName ?? null,
      reviewerCredential: input.reviewerCredential ?? null,
      reviewedAt: input.reviewedAt ?? null,
      faqs: input.faqs as unknown as Prisma.InputJsonValue,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
      noindex: input.noindex,
      createdBy: guard.session.user.id,
    },
    select: { id: true, slug: true, status: true, createdAt: true },
  });

  logEvent("post_created", { userId: guard.session.user.id, postId: post.id });

  return NextResponse.json(post, { status: 201 });
}
