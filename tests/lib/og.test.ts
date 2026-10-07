import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildOgImage, OG_BACKGROUND, OG_HEIGHT, OG_WIDTH } from "@/lib/og";

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];

async function render(input: Parameters<typeof buildOgImage>[0]): Promise<{
  status: number;
  contentType: string | null;
  bytes: Uint8Array;
}> {
  const response = buildOgImage(input);
  const bytes = new Uint8Array(await response.arrayBuffer());
  return {
    status: response.status,
    contentType: response.headers.get("content-type"),
    bytes,
  };
}

describe("buildOgImage", () => {
  it("renders a 1200x630 PNG with category chip and logo", async () => {
    const logoData = readFileSync(path.join(process.cwd(), "public", "logo", "logo.png"));
    const { status, contentType, bytes } = await render({
      title: "Understanding IVF success rates after 40",
      category: "IVF",
      logo: { data: logoData, type: "image/png" },
    });

    expect(status).toBe(200);
    expect(contentType).toBe("image/png");
    expect([...bytes.slice(0, 4)]).toEqual(PNG_MAGIC);
    expect(bytes.length).toBeGreaterThan(1000);
    expect(OG_WIDTH).toBe(1200);
    expect(OG_HEIGHT).toBe(630);
    expect(OG_BACKGROUND).toBe("#8a4853");
  });

  it("renders without logo or category and clamps an overlong title", async () => {
    const longTitle = `${"Fertility guidance for very long editorial titles ".repeat(4)}beyond limits`;
    expect(longTitle.length).toBeGreaterThan(96);
    const { status, bytes } = await render({
      title: longTitle,
      footer: "Custom footer",
    });
    expect(status).toBe(200);
    expect([...bytes.slice(0, 4)]).toEqual(PNG_MAGIC);
  });

  it("accepts an ArrayBuffer logo source", async () => {
    const logoData = readFileSync(path.join(process.cwd(), "public", "logo", "logo.png"));
    const { status } = await render({
      title: "Short title",
      category: null,
      logo: {
        data: logoData.buffer.slice(
          logoData.byteOffset,
          logoData.byteOffset + logoData.byteLength,
        ),
        type: "image/png",
      },
    });
    expect(status).toBe(200);
  });
});
