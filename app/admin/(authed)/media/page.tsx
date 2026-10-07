import type { Metadata } from "next";
import { auth } from "@/auth";
import MediaLibrary, { type MediaDetail, type MediaItem } from "@/components/admin/media-library";
import { getDb } from "@/lib/db";
import { mediaPublicItem, mediaUsage } from "@/lib/media/usage";
import { MEDIA_PAGE_SIZE, mediaListQuery } from "@/lib/validation/media";

export const metadata: Metadata = { title: "Media" };

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pageParam = typeof sp.page === "string" ? sp.page : undefined;
  const detailParam = typeof sp.detail === "string" ? sp.detail : undefined;
  const parsed = mediaListQuery.safeParse({ page: pageParam });
  const page = parsed.success ? parsed.data.page : 1;

  const db = getDb();
  const [rows, total, session] = await Promise.all([
    db.media.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * MEDIA_PAGE_SIZE,
      take: MEDIA_PAGE_SIZE,
    }),
    db.media.count(),
    auth(),
  ]);

  let detail: MediaDetail | null = null;
  if (detailParam) {
    const media = await db.media.findUnique({ where: { id: detailParam } });
    if (media) {
      const item: MediaItem = { ...mediaPublicItem(media), createdAt: media.createdAt.toISOString() };
      detail = { media: item, usage: await mediaUsage(db, media.id) };
    }
  }

  return (
    <MediaLibrary
      items={rows.map((media) => ({ ...mediaPublicItem(media), createdAt: media.createdAt.toISOString() }))}
      total={total}
      page={page}
      pageSize={MEDIA_PAGE_SIZE}
      detail={detail}
      canDelete={session?.user.role === "ADMIN" && session.user.totpEnabled === true}
    />
  );
}
