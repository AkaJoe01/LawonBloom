import type { Metadata } from "next";
import PostEditor from "@/components/admin/post-editor";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage() {
  const categories = await getDb().category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return <PostEditor categories={categories} initial={null} />;
}
