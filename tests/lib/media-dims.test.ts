import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  metadata: undefined as unknown as () => Promise<unknown>,
}));

vi.mock("sharp", () => ({
  default: () => ({ metadata: () => state.metadata() }),
}));

vi.mock("file-type", () => ({
  fileTypeFromBuffer: async () => ({ mime: "image/png", ext: "png" }),
}));

import { validateUpload } from "@/lib/media/pipeline";

describe("validateUpload with a sharp that reports unusable metadata", () => {
  beforeEach(() => {
    state.metadata = async () => ({ format: "png" });
  });

  it("rejects missing dimensions with 422", async () => {
    const result = await validateUpload(Buffer.from("png-ish"));
    expect(result).toMatchObject({ status: 422, code: "invalid_dimensions" });
  });

  it("rejects a sharp metadata failure with 415", async () => {
    state.metadata = async () => {
      throw new Error("bogus");
    };
    const result = await validateUpload(Buffer.from("png-ish"));
    expect(result).toMatchObject({ status: 415 });
  });
});
