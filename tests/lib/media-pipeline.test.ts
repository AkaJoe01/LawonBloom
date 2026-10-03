import { describe, expect, it, vi } from "vitest";
import sharp from "sharp";
import {
  checkUploadSize,
  processUpload,
  sniffImageMime,
  validateUpload,
} from "@/lib/media/pipeline";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_EDGE, isAllowedUploadMime } from "@/lib/validation/media";

const forcedMime = vi.hoisted(() => ({ value: undefined as string | undefined }));

vi.mock("file-type", async (importOriginal) => {
  const actual = await importOriginal<typeof import("file-type")>();
  return {
    ...actual,
    fileTypeFromBuffer: async (buffer: Buffer) => {
      if (forcedMime.value !== undefined) {
        return forcedMime.value ? ({ mime: forcedMime.value, ext: "bin" } as const) : undefined;
      }
      return actual.fileTypeFromBuffer(buffer);
    },
  };
});

async function pngBytes(width = 8, height = 6): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: { r: 200, g: 30, b: 60 } } })
    .png()
    .toBuffer();
}

async function jpegBytes(width = 8, height = 6): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: { r: 10, g: 120, b: 200 } } })
    .jpeg()
    .toBuffer();
}

async function webpBytes(width = 8, height = 6): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: { r: 5, g: 5, b: 5 } } })
    .webp()
    .toBuffer();
}

describe("checkUploadSize", () => {
  it("accepts exactly 4 MB and rejects anything larger", () => {
    expect(checkUploadSize(MAX_UPLOAD_BYTES)).toBeNull();
    const failure = checkUploadSize(MAX_UPLOAD_BYTES + 1);
    expect(failure).toMatchObject({ status: 413, code: "too_large" });
  });
});

describe("isAllowedUploadMime", () => {
  it("accepts jpeg, png and webp only", () => {
    expect(isAllowedUploadMime("image/jpeg")).toBe(true);
    expect(isAllowedUploadMime("image/png")).toBe(true);
    expect(isAllowedUploadMime("image/webp")).toBe(true);
    expect(isAllowedUploadMime("image/gif")).toBe(false);
    expect(isAllowedUploadMime("image/svg+xml")).toBe(false);
    expect(isAllowedUploadMime(null)).toBe(false);
    expect(isAllowedUploadMime(undefined)).toBe(false);
  });
});

describe("sniffImageMime", () => {
  it("detects the three accepted formats from real bytes", async () => {
    expect(await sniffImageMime(await pngBytes())).toBe("image/png");
    expect(await sniffImageMime(await jpegBytes())).toBe("image/jpeg");
    expect(await sniffImageMime(await webpBytes())).toBe("image/webp");
  });

  it("returns null for non-image bytes", async () => {
    expect(await sniffImageMime(Buffer.from("#!/bin/sh\necho hi\n"))).toBeNull();
  });

  it("detects a gif even though it is not accepted", async () => {
    const gif = Buffer.concat([Buffer.from("GIF89a"), Buffer.alloc(20)]);
    expect(await sniffImageMime(gif)).toBe("image/gif");
  });
});

describe("validateUpload", () => {
  it("accepts valid png, jpeg and webp images", async () => {
    for (const bytes of [await pngBytes(8, 6), await jpegBytes(8, 6), await webpBytes(8, 6)]) {
      const result = await validateUpload(bytes);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.width).toBe(8);
        expect(result.height).toBe(6);
      }
    }
  });

  it("rejects a gif with 415", async () => {
    const gif = Buffer.concat([Buffer.from("GIF89a"), Buffer.alloc(20)]);
    const result = await validateUpload(gif);
    expect(result).toMatchObject({ status: 415, code: "unsupported_type" });
  });

  it("rejects arbitrary bytes with 415", async () => {
    const result = await validateUpload(Buffer.from("not an image at all"));
    expect(result).toMatchObject({ status: 415 });
  });

  it("rejects a truncated image that sniffs fine but cannot be parsed (415)", async () => {
    const truncated = (await webpBytes()).subarray(0, 16);
    expect(await sniffImageMime(truncated)).toBe("image/webp");
    const result = await validateUpload(truncated);
    expect(result).toMatchObject({ status: 415 });
  });

  it("rejects content whose sniffed type disagrees with sharp (spoof, 415)", async () => {
    forcedMime.value = "image/jpeg";
    try {
      const result = await validateUpload(await pngBytes());
      expect(result).toMatchObject({ status: 415, code: "spoofed_type" });
    } finally {
      forcedMime.value = undefined;
    }
  });

  it(`rejects images longer than ${MAX_UPLOAD_EDGE}px with 422`, async () => {
    const result = await validateUpload(await pngBytes(MAX_UPLOAD_EDGE + 1, 4));
    expect(result).toMatchObject({ status: 422, code: "dimensions_too_large" });
  });
});

describe("processUpload", () => {
  it("keeps small pngs as png and preserves dimensions", async () => {
    const processed = await processUpload(await pngBytes(8, 6));
    expect(processed.mimeType).toBe("image/png");
    expect(processed.width).toBe(8);
    expect(processed.height).toBe(6);
    expect(processed.bytes).toBe(processed.data.length);
  });

  it("converts jpeg input to webp", async () => {
    const processed = await processUpload(await jpegBytes(8, 6));
    expect(processed.mimeType).toBe("image/webp");
    expect(processed.width).toBe(8);
    expect(processed.height).toBe(6);
  });

  it("converts oversized pngs (over 1 MB) to webp", async () => {
    const width = 1024;
    const height = 1024;
    const noise = Buffer.alloc(width * height * 3);
    for (let i = 0; i < noise.length; i += 3) {
      noise[i] = (i * 31) % 251;
      noise[i + 1] = (i * 17) % 239;
      noise[i + 2] = (i * 7) % 233;
    }
    const bigPng = await sharp(noise, { raw: { width, height, channels: 3 } }).png().toBuffer();
    expect(bigPng.length).toBeGreaterThan(1024 * 1024);
    const processed = await processUpload(bigPng);
    expect(processed.mimeType).toBe("image/webp");
    expect(processed.width).toBe(width);
    expect(processed.height).toBe(height);
  });

  it("auto-rotates via EXIF and strips metadata", async () => {
    const rotated = await sharp({ create: { width: 4, height: 2, channels: 3, background: { r: 1, g: 2, b: 3 } } })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const processed = await processUpload(rotated);
    expect(processed.width).toBe(2);
    expect(processed.height).toBe(4);
    const meta = await sharp(processed.data).metadata();
    expect(meta.exif).toBeUndefined();
  });

  it("throws on garbage input so the route can answer 500", async () => {
    await expect(processUpload(Buffer.from("garbage not an image"))).rejects.toThrow();
  });
});
