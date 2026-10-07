import type { Prisma } from "@prisma/client";
import { logEvent } from "@/lib/observability/log";
import { NextResponse } from "next/server";
import { requireStaff, perUserGate } from "@/lib/auth/guards";
import { getDb } from "@/lib/db";
import { apiError } from "@/lib/api-error";
import { suggestUniqueSlug } from "@/lib/posts/derive";
import { docStats, refFieldErrors, revalidatePostTags } from "@/lib/posts/write";
import { originRejection } from "@/lib/security/origin";
import { zodFieldErrors } from "@/lib/validation/common";
import { postUpdate } from "@/lib/validation/post";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const db = getDb();
  const post = await db.post.findUnique({ where: { id } });
  if (!post) return apiError(404, "not_found", "Post not found.");

  return NextResponse.json(post);
}

export async function PATCH(request: Request, { params }: Params) {
  const rejected = originRejection(request);
  if (rejected) return rejected;

  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const gate = await perUserGate(guard.session.user.id, 60, 60, "post-patch");
  if (gate) return gate;

  const { id } = await params;
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return apiError(400, "invalid_json", "Invalid JSON body.");
  }
  const parsed = postUpdate.safeParse(raw);
  if (!parsed.success) {
    return apiError(400, "validation", "Invalid post.", { fieldErrors: zodFieldErrors(parsed.error) });
  }
  const body = parsed.data;
  const rawRecord = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const provided = (key: string) => key in rawRecord && rawRecord[key] !== undefined;
  const nextSlug = provided("slug") && typeof body.slug === "string" ? body.slug : null;
  const nextContent = provided("content") && body.content !== undefined ? body.content : null;

  const db = getDb();
  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) return apiError(404, "not_found", "Post not found.");

  if (nextSlug !== null && existing.status === "PUBLISHED" && nextSlug !== existing.slug) {
    return apiError(400, "slug_locked", "Slug cannot be changed after publish.", {
      fieldErrors: { slug: "Slug cannot be changed after publish." },
    });
  }
  if (existing.status === "PUBLISHED" && provided("coverImageId") && !body.coverImageId) {
    return apiError(400, "validation", "Invalid post.", {
      fieldErrors: { coverImageId: "Published posts require a cover image." },
    });
  }

  const refErrors = await refFieldErrors(db, {
    categoryId: provided("categoryId") ? body.categoryId : null,
    coverImageId: provided("coverImageId") ? body.coverImageId : null,
  });
  if (refErrors) {
    return apiError(400, "validation", "Invalid references.", { fieldErrors: refErrors });
  }

  if (nextSlug !== null && nextSlug !== existing.slug) {
    const clash = await db.post.findFirst({ where: { slug: nextSlug, NOT: { id } } });
    if (clash) {
      const suggestion = await suggestUniqueSlug(nextSlug, async (slug) =>
        Boolean(await db.post.findUnique({ where: { slug } })),
      );
      return apiError(409, "duplicate_slug", "That slug is already in use.", { suggestion });
    }
  }

  const data: Prisma.PostUncheckedUpdateInput = { updatedBy: guard.session.user.id };
  if (provided("title")) data.title = body.title;
  if (nextSlug !== null) data.slug = nextSlug;
  if (provided("excerpt")) data.excerpt = body.excerpt ?? null;
  if (provided("disclaimer")) data.disclaimer = body.disclaimer ?? "";
  if (provided("reviewerName")) data.reviewerName = body.reviewerName ?? null;
  if (provided("reviewerCredential")) data.reviewerCredential = body.reviewerCredential ?? null;
  if (provided("reviewedAt")) data.reviewedAt = body.reviewedAt ?? null;
  if (provided("faqs")) data.faqs = body.faqs as unknown as Prisma.InputJsonValue;
  if (provided("metaTitle")) data.metaTitle = body.metaTitle ?? null;
  if (provided("metaDescription")) data.metaDescription = body.metaDescription ?? null;
  if (provided("categoryId")) data.categoryId = body.categoryId;
  if (provided("coverImageId")) data.coverImageId = body.coverImageId ?? null;
  if (nextContent !== null) {
    data.content = nextContent as unknown as Prisma.InputJsonValue;
    const stats = docStats(nextContent);
    data.plainText = stats.plainText;
    data.readingTime = stats.readingTime;
  }

  const updated = await db.post.update({
    where: { id },
    data,
    select: { id: true, slug: true, status: true, updatedAt: true },
  });

  if (existing.status === "PUBLISHED") {
    revalidatePostTags(existing.slug);
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: Params) {
  const rejected = originRejection(request);
  if (rejected) return rejected;

  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const gate = await perUserGate(guard.session.user.id, 60, 60, "post-delete");
  if (gate) return gate;

  const { id } = await params;
  const db = getDb();
  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) return apiError(404, "not_found", "Post not found.");

  await db.post.delete({ where: { id } });
  revalidatePostTags(existing.slug);

  logEvent("post_deleted", { userId: guard.session.user.id, postId: id });

  return new Response(null, { status: 204 });
}
