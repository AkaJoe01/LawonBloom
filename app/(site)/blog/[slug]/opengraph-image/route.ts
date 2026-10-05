import { getPostBySlug } from "@/lib/blog/queries";
import { buildOgImage } from "@/lib/og";
import { APEX } from "@/lib/seo";

export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  let logo: { data: ArrayBuffer; type?: string } | null = null;
  try {
    const origin = process.env.AUTH_URL ?? APEX;
    const response = await fetch(new URL("/logo/logo.png", origin));
    if (response.ok) {
      logo = { data: await response.arrayBuffer(), type: "image/png" };
    }
  } catch {
    logo = null;
  }

  return buildOgImage({
    title: post.title,
    category: post.category.name,
    logo,
  });
}
