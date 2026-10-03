import type { PrismaClient } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { computeReadingTime, derivePlainText } from "@/lib/posts/derive";
import type { TiptapDoc } from "@/lib/validation/post";

export interface RefRefs {
  categoryId?: string | null;
  coverImageId?: string | null;
}

export async function refFieldErrors(db: PrismaClient, refs: RefRefs): Promise<Record<string, string> | null> {
  const errors: Record<string, string> = {};
  if (refs.categoryId) {
    const category = await db.category.findUnique({ where: { id: refs.categoryId } });
    if (!category) errors.categoryId = "Unknown category.";
  }
  if (refs.coverImageId) {
    const media = await db.media.findUnique({ where: { id: refs.coverImageId } });
    if (!media) errors.coverImageId = "Unknown media asset.";
  }
  return Object.keys(errors).length > 0 ? errors : null;
}

export function docStats(doc: TiptapDoc): { plainText: string; readingTime: number } {
  const plainText = derivePlainText(doc);
  return { plainText, readingTime: computeReadingTime(plainText) };
}

export function revalidatePostTags(slug: string): void {
  revalidateTag(`post:${slug}`, { expire: 0 });
  revalidateTag("blog", { expire: 0 });
}
