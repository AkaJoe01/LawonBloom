import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireStaff, perUserGate } from "@/lib/auth/guards";
import { getDb } from "@/lib/db";
import { apiError } from "@/lib/api-error";
import { logEvent, ridOf } from "@/lib/observability/log";
import { docStats, refFieldErrors, revalidatePostTags } from "@/lib/posts/write";
import { originRejection } from "@/lib/security/origin";
import { zodFieldErrors } from "@/lib/validation/common";
import { MIN_COVER_WIDTH } from "@/lib/validation/media";
import { postPublish } from "@/lib/validation/post";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const rejected = originRejection(request);
  if (rejected) return rejected;
  const rid = ridOf(request) ?? undefined;

  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const gate = await perUserGate(guard.session.user.id, 60, 60, "post-publish");
  if (gate) return gate;

  const { id } = await params;
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return apiError(400, "invalid_json", "Invalid JSON body.");
  }
  const parsed = postPublish.safeParse(raw);
  if (!parsed.success) {
    return apiError(422, "validation", "Post is not ready to publish.", {
      fieldErrors: zodFieldErrors(parsed.error),
    });
  }
  const input = parsed.data;

  const db = getDb();
  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) return apiError(404, "not_found", "Post not found.");

  if (existing.status === "PUBLISHED" && input.slug !== existing.slug) {
    return apiError(400, "slug_locked", "Slug cannot be changed after publish.", {
      fieldErrors: { slug: "Slug cannot be changed after publish." },
    });
  }

  const refErrors = await refFieldErrors(db, {
    categoryId: input.categoryId,
    coverImageId: input.coverImageId,
  });
  if (refErrors) {
    return apiError(422, "validation", "Post is not ready to publish.", { fieldErrors: refErrors });
  }

  const cover = await db.media.findUnique({ where: { id: input.coverImageId }, select: { width: true } });
  if (cover && cover.width < MIN_COVER_WIDTH) {
    return apiError(422, "validation", "Post is not ready to publish.", {
      fieldErrors: {
        coverImageId: `Cover image must be at least ${MIN_COVER_WIDTH}px wide (this one is ${cover.width}px).`,
      },
    });
  }

  if (input.slug !== existing.slug) {
    const clash = await db.post.findFirst({ where: { slug: input.slug, NOT: { id } } });
    if (clash) {
      return apiError(409, "duplicate_slug", "That slug is already in use.", {
        suggestion: input.slug,
      });
    }
  }

  const stats = docStats(input.content);
  const published = await db.post.update({
    where: { id },
    data: {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt ?? null,
      content: input.content as unknown as Prisma.InputJsonValue,
      plainText: stats.plainText,
      readingTime: stats.readingTime,
      categoryId: input.categoryId,
      coverImageId: input.coverImageId,
      disclaimer: input.disclaimer,
      reviewerName: input.reviewerName ?? null,
      reviewerCredential: input.reviewerCredential ?? null,
      reviewedAt: input.reviewedAt ?? null,
      faqs: input.faqs as unknown as Prisma.InputJsonValue,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
      status: "PUBLISHED",
      publishedAt: existing.publishedAt ?? new Date(),
      publishedBy: guard.session.user.id,
      updatedBy: guard.session.user.id,
    },
    select: { slug: true, status: true, publishedAt: true, updatedAt: true },
  });

  revalidatePostTags(existing.slug);
  if (existing.slug !== published.slug) revalidatePostTags(published.slug);

  logEvent("publish", { rid, userId: guard.session.user.id, postId: id });

  return NextResponse.json(published);
}
