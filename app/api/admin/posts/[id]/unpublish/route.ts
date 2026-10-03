import { NextResponse } from "next/server";
import { requireStaff, perUserGate } from "@/lib/auth/guards";
import { getDb } from "@/lib/db";
import { apiError } from "@/lib/api-error";
import { revalidatePostTags } from "@/lib/posts/write";
import { originRejection } from "@/lib/security/origin";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const rejected = originRejection(request);
  if (rejected) return rejected;

  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const gate = await perUserGate(guard.session.user.id, 60, 60, "post-unpublish");
  if (gate) return gate;

  const { id } = await params;
  const db = getDb();
  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) return apiError(404, "not_found", "Post not found.");
  if (existing.status === "DRAFT") {
    return apiError(409, "already_draft", "This post is already a draft.");
  }

  const unpublished = await db.post.update({
    where: { id },
    data: { status: "DRAFT", updatedBy: guard.session.user.id },
    select: { id: true, slug: true, status: true },
  });

  revalidatePostTags(existing.slug);

  console.info(JSON.stringify({ event: "post_unpublished", userId: guard.session.user.id, postId: id }));

  return NextResponse.json(unpublished);
}
