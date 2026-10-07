import { createElement, type ReactNode } from "react";
import { ImageResponse } from "next/og";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_BACKGROUND = "#8a4853";

export interface OgImageInput {
  title: string;
  category?: string | null;
  logo?: { data: ArrayBuffer | Buffer; type?: string } | null;
  footer?: string;
}

function clamp(text: string, maxChars: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= maxChars) return flat;
  return `${flat.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function toArrayBuffer(data: ArrayBuffer | Buffer): ArrayBuffer {
  if (data instanceof ArrayBuffer) return data;
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

export function buildOgImage(input: OgImageInput): Response {
  const title = clamp(input.title, 96);
  const category = input.category ? input.category.toUpperCase() : null;
  const footer = input.footer ?? "Lawon Bloom Fertility Centre";

  const children: ReactNode[] = [];

  if (input.logo) {
    children.push(
      createElement("img", {
        key: "logo",
        src: toArrayBuffer(input.logo.data) as unknown as string,
        width: 72,
        height: 72,
        style: { borderRadius: 36 },
      }),
    );
  }
  if (category) {
    children.push(
      createElement(
        "div",
        {
          key: "chip",
          style: {
            backgroundColor: "rgba(255, 255, 255, 0.16)",
            borderRadius: 999,
            color: "#fdeef0",
            fontSize: 22,
            letterSpacing: 3,
            padding: "10px 24px",
          },
        },
        category,
      ),
    );
  }

  const layout = createElement(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: OG_BACKGROUND,
        backgroundImage:
          "radial-gradient(circle at 85% 15%, rgba(255,255,255,0.14), transparent 45%)",
        color: "#ffffff",
        padding: "64px 72px",
      },
    },
    createElement(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 24 } },
      ...children,
    ),
    createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          fontSize: 60,
          lineHeight: 1.15,
          fontWeight: 400,
          maxWidth: 1040,
          textWrap: "balance",
        },
      },
      title,
    ),
    createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 26,
          letterSpacing: 1,
          color: "rgba(255, 255, 255, 0.85)",
        },
      },
      footer,
      createElement("div", { style: { fontSize: 22, letterSpacing: 4 } }, "JOURNAL"),
    ),
  );

  return new ImageResponse(layout, { width: OG_WIDTH, height: OG_HEIGHT });
}
