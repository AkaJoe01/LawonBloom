import { z } from "zod";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_EDGE = 6000;
export const MIN_COVER_WIDTH = 1200;
export const MAX_PNG_KEEP_BYTES = 1024 * 1024;
export const MEDIA_PAGE_SIZE = 24;

export const ALLOWED_UPLOAD_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedUploadMime = (typeof ALLOWED_UPLOAD_MIME)[number];

export function isAllowedUploadMime(mime: string | null | undefined): mime is AllowedUploadMime {
  return ALLOWED_UPLOAD_MIME.includes(mime as AllowedUploadMime);
}

export const mediaMeta = z.object({
  altText: z.string().trim().max(200).nullish(),
  isDecorative: z.boolean().default(false),
});

export const mediaListQuery = z.object({
  page: z.coerce.number().int().min(1).max(500).default(1),
});

export type MediaMetaInput = z.infer<typeof mediaMeta>;
export type MediaListQuery = z.infer<typeof mediaListQuery>;
