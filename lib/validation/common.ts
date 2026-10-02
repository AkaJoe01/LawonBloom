import { z } from "zod";

export const slugMax = 80;
export const reservedSlugs = [
  "admin",
  "api",
  "new",
  "search",
  "category",
  "rss.xml",
  "health",
  "blog",
] as const;

const reservedSlugSet = new Set<string>(reservedSlugs);

export function isReservedSlug(slug: string): boolean {
  return reservedSlugSet.has(slug);
}

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(slugMax)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .refine((slug) => !isReservedSlug(slug), {
    message: "slug is reserved",
  });

export const emailSchema = z.string().trim().email().max(254);

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{7,20}$/);

export function optionalText(max: number) {
  return z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined ? undefined : value,
    z.string().trim().max(max).optional(),
  );
}

export function optionalPhone() {
  return z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined ? undefined : value,
    phoneSchema.optional(),
  );
}
