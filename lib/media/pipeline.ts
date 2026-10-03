import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import {
  MAX_PNG_KEEP_BYTES,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_EDGE,
  isAllowedUploadMime,
} from "@/lib/validation/media";

export type RejectionStatus = 413 | 415 | 422;

export type ValidationFailure = {
  ok: false;
  status: RejectionStatus;
  code: string;
  message: string;
};

export type ValidationSuccess = {
  ok: true;
  width: number;
  height: number;
  format: string;
};

export type ValidationResult = ValidationSuccess | ValidationFailure;

export type ProcessedUpload = {
  data: Buffer;
  mimeType: "image/webp" | "image/png";
  width: number;
  height: number;
  bytes: number;
};

function reject(status: RejectionStatus, code: string, message: string): ValidationFailure {
  return { ok: false, status, code, message };
}

export function checkUploadSize(bytes: number): ValidationFailure | null {
  if (bytes > MAX_UPLOAD_BYTES) {
    return reject(413, "too_large", "File exceeds the 4 MB upload limit.");
  }
  return null;
}

export async function sniffImageMime(buffer: Buffer): Promise<string | null> {
  try {
    const detected = await fileTypeFromBuffer(buffer);
    return detected?.mime ?? null;
  } catch {
    return null;
  }
}

export async function validateUpload(buffer: Buffer): Promise<ValidationResult> {
  const sniffed = await sniffImageMime(buffer);
  if (!isAllowedUploadMime(sniffed)) {
    return reject(415, "unsupported_type", "Only JPEG, PNG, and WebP images are accepted.");
  }

  let format: string | undefined;
  let width: number | undefined;
  let height: number | undefined;
  try {
    const meta = await sharp(buffer).metadata();
    format = meta.format;
    width = meta.width;
    height = meta.height;
  } catch {
    return reject(415, "unsupported_type", "The file could not be read as an image.");
  }

  if (sniffed !== `image/${format}`) {
    return reject(415, "spoofed_type", "File content does not match its declared type.");
  }
  if (!width || !height) {
    return reject(422, "invalid_dimensions", "Could not determine image dimensions.");
  }
  if (Math.max(width, height) > MAX_UPLOAD_EDGE) {
    return reject(
      422,
      "dimensions_too_large",
      `Images must be at most ${MAX_UPLOAD_EDGE}px on their longest edge.`,
    );
  }
  return { ok: true, width, height, format };
}

export async function processUpload(buffer: Buffer): Promise<ProcessedUpload> {
  const inputFormat = (await sharp(buffer).metadata()).format;
  const oriented = () => sharp(buffer).rotate();
  const toWebp = async () => oriented().webp({ quality: 82, effort: 4 }).toBuffer();

  let data: Buffer;
  let mimeType: "image/webp" | "image/png";

  if (inputFormat === "png") {
    const png = await oriented().png({ compressionLevel: 9 }).toBuffer();
    if (png.length <= MAX_PNG_KEEP_BYTES) {
      data = png;
      mimeType = "image/png";
    } else {
      data = await toWebp();
      mimeType = "image/webp";
    }
  } else {
    data = await toWebp();
    mimeType = "image/webp";
  }

  const meta = await sharp(data).metadata();
  if (!meta.width || !meta.height) {
    throw new Error("processed image lost its dimensions");
  }

  return { data, mimeType, width: meta.width, height: meta.height, bytes: data.length };
}
