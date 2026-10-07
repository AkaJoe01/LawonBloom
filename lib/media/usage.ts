import type { PrismaClient } from "@prisma/client";

type MediaDb = Pick<PrismaClient, "post" | "$queryRaw">;

export type MediaUsage = {
  usedBy: number;
  titles: string[];
};

export async function mediaUsage(db: MediaDb, mediaId: string): Promise<MediaUsage> {
  const coverPosts = await db.post.findMany({
    where: { coverImageId: mediaId },
    select: { title: true },
  });
  const pattern = `%"${mediaId}"%`;
  const inlinePosts = await db.$queryRaw<{ title: string }[]>`SELECT title FROM "Post" WHERE content::text LIKE ${pattern}`;
  const titles = [...new Set([...coverPosts.map((post) => post.title), ...inlinePosts.map((post) => post.title)])];
  return { usedBy: titles.length, titles };
}

export type MediaRecord = {
  id: string;
  url: string;
  pathname: string;
  bytes: number;
  width: number;
  height: number;
  mimeType: string;
  altText: string | null;
  isDecorative: boolean;
  createdAt: Date;
};

export function mediaPublicItem(media: MediaRecord) {
  return {
    id: media.id,
    url: media.url,
    width: media.width,
    height: media.height,
    bytes: media.bytes,
    mimeType: media.mimeType,
    altText: media.altText,
    isDecorative: media.isDecorative,
    createdAt: media.createdAt,
  };
}
