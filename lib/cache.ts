export const BLOG_TAG = "blog";

export function postTag(slug: string): string {
  return `post:${slug}`;
}
