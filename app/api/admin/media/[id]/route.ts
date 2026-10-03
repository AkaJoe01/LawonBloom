import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { adminMutationGate, requireAdmin, requireStaff } from "@/lib/auth/guards";
import { getDb } from "@/lib/db";
import { mediaPublicItem, mediaUsage } from "@/lib/media/usage";
import { originRejection } from "@/lib/security/origin";
import { zodFieldErrors } from "@/lib/validation/common";
import { mediaMeta } from "@/lib/validation/media";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const rejected = originRejection(request);
  if (rejected) return rejected;

  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const gate = await adminMutationGate(guard.session.user.id);
  if (gate) return gate;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return apiError(400, "invalid_json", "Invalid JSON body.");
  }
  const parsed = mediaMeta.safeParse(raw);
  if (!parsed.success) {
    return apiError(400, "validation", "Invalid media metadata.", { fieldErrors: zodFieldErrors(parsed.error) });
  }

  const { id } = await params;
  const db = getDb();
  const existing = await db.media.findUnique({ where: { id } });
  if (!existing) return apiError(404, "not_found", "Media not found.");

  const media = await db.media.update({
    where: { id },
    data: {
      isDecorative: parsed.data.isDecorative,
      altText: parsed.data.isDecorative ? null : (parsed.data.altText ?? null),
    },
  });

  return NextResponse.json(mediaPublicItem(media));
}

export async function DELETE(request: Request, { params }: Params) {
  const rejected = originRejection(request);
  if (rejected) return rejected;

  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const gate = await adminMutationGate(guard.session.user.id);
  if (gate) return gate;

  const { id } = await params;
  const db = getDb();
  const existing = await db.media.findUnique({ where: { id } });
  if (!existing) return apiError(404, "not_found", "Media not found.");

  const usage = await mediaUsage(db, id);
  if (usage.usedBy > 0) {
    return apiError(409, "in_use", `This image is used in ${usage.usedBy} post(s).`, {
      usedBy: usage.usedBy,
      titles: usage.titles,
    });
  }

  try {
    await del(existing.pathname);
  } catch (error) {
    console.error(
      JSON.stringify({ event: "media_blob_delete_failed", err: error instanceof Error ? error.message : "unknown" }),
    );
    return apiError(500, "storage_failed", "Could not remove the stored image. Try again.");
  }

  await db.media.delete({ where: { id } });

  console.info(JSON.stringify({ event: "media_delete", userId: guard.session.user.id, mediaId: id }));

  return NextResponse.json({ usedBy: 0 });
}
