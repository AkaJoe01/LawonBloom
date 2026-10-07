import { put } from "@vercel/blob";
import { logEvent } from "@/lib/observability/log";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { perUserGate, requireStaff } from "@/lib/auth/guards";
import { getDb } from "@/lib/db";
import { checkUploadSize, processUpload, validateUpload } from "@/lib/media/pipeline";
import { mediaPublicItem } from "@/lib/media/usage";
import { originRejection } from "@/lib/security/origin";
import { zodFieldErrors } from "@/lib/validation/common";
import { MAX_UPLOAD_BYTES, MEDIA_PAGE_SIZE, mediaListQuery } from "@/lib/validation/media";

export const runtime = "nodejs";
export const maxDuration = 30;

const MULTIPART_OVERHEAD = 16 * 1024;

export async function GET(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const parsed = mediaListQuery.safeParse({ page: url.searchParams.get("page") ?? undefined });
  if (!parsed.success) {
    return apiError(400, "validation", "Invalid query parameters.", { fieldErrors: zodFieldErrors(parsed.error) });
  }
  const { page } = parsed.data;

  const db = getDb();
  const [items, total] = await db.$transaction([
    db.media.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * MEDIA_PAGE_SIZE,
      take: MEDIA_PAGE_SIZE,
    }),
    db.media.count(),
  ]);

  return NextResponse.json({ items: items.map(mediaPublicItem), total, page, pageSize: MEDIA_PAGE_SIZE });
}

export async function POST(request: Request) {
  const rejected = originRejection(request);
  if (rejected) return rejected;

  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const gate = await perUserGate(guard.session.user.id, 30, 3600, "media-upload");
  if (gate) return gate;

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_UPLOAD_BYTES + MULTIPART_OVERHEAD) {
    return apiError(413, "too_large", "File exceeds the 4 MB upload limit.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return apiError(400, "invalid_form", "Expected multipart/form-data with one file.");
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return apiError(400, "file_required", "Attach an image file to upload.");
  }

  const tooLarge = checkUploadSize(file.size);
  if (tooLarge) {
    return apiError(tooLarge.status, tooLarge.code, tooLarge.message);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const validation = await validateUpload(buffer);
  if (!validation.ok) {
    return apiError(validation.status, validation.code, validation.message);
  }

  let processed;
  try {
    processed = await processUpload(buffer);
  } catch (error) {
    logEvent("media_process_failed", { err: error instanceof Error ? error.message : "unknown" }, "error");
    return apiError(500, "processing_failed", "Image processing failed. Try a different file.");
  }

  const extension = processed.mimeType === "image/png" ? "png" : "webp";
  let blob;
  try {
    blob = await put(`media/${crypto.randomUUID()}.${extension}`, processed.data, {
      access: "public",
      addRandomSuffix: true,
      cacheControlMaxAge: 31536000,
      contentType: processed.mimeType,
    });
  } catch (error) {
    logEvent("media_blob_failed", { err: error instanceof Error ? error.message : "unknown" }, "error");
    return apiError(500, "storage_failed", "Could not store the image. Try again.");
  }

  const db = getDb();
  const media = await db.media.create({
    data: {
      url: blob.url,
      pathname: blob.pathname,
      bytes: processed.bytes,
      width: processed.width,
      height: processed.height,
      mimeType: processed.mimeType,
      uploadedBy: guard.session.user.id,
    },
  });

  return NextResponse.json(
    { id: media.id, url: media.url, w: media.width, h: media.height, bytes: media.bytes, mime: media.mimeType },
    { status: 201 },
  );
}
