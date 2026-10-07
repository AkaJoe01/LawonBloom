import { slugMax } from "@/lib/validation/common";
import type { TiptapDoc } from "@/lib/validation/post";

const WORDS_PER_MINUTE = 220;

export function derivePlainText(doc: TiptapDoc): string {
  const parts: string[] = [];
  const walk = (nodes: unknown[]): void => {
    for (const node of nodes) {
      if (typeof node !== "object" || node === null) continue;
      const n = node as { type?: string; text?: string; content?: unknown[] };
      if (n.type === "text" && n.text) {
        parts.push(n.text);
      } else if (n.content) {
        walk(n.content);
        parts.push(" ");
      }
    }
  };
  walk(doc.content);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function computeReadingTime(plainText: string): number {
  const words = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, slugMax)
    .replace(/-+$/g, "");
  return slug.length >= 2 ? slug : "post";
}

export async function suggestUniqueSlug(
  base: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  if (!(await isTaken(base))) return base;
  for (let n = 2; n <= 100; n += 1) {
    const suffix = `-${n}`;
    const candidate = `${base.slice(0, slugMax - suffix.length).replace(/-+$/g, "")}${suffix}`;
    if (!(await isTaken(candidate))) return candidate;
  }
  throw new Error(`could not find a unique slug for ${base}`);
}
