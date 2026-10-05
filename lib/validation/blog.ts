import { z } from "zod";
import { optionalPhone, slugMax } from "./common";

export const CONSENT_VERSION = "v1";
export const ENQUIRY_MIN_FILL_MS = 2000;

export const blogPageQuery = z.object({
  page: z.coerce.number().int().min(1).max(500).default(1),
});

export const searchQuery = z.object({
  q: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters")
    .max(100, "Search is limited to 100 characters"),
  page: z.coerce.number().int().min(1).max(100).default(1),
});

export const enquiryInput = z
  .object({
    name: z.string().trim().min(2, "Enter your name").max(120),
    email: z.string().trim().email("Enter a valid email address").max(254),
    phone: optionalPhone(),
    message: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(3000),
    postSlug: z.string().trim().max(slugMax).nullish(),
    consent: z.boolean().refine((value) => value === true, "Consent is required"),
    website: z.string().max(0, "Invalid submission"),
    startedAt: z.coerce
      .number()
      .int()
      .positive("Invalid submission")
      .refine(
        (value) => {
          const now = Date.now();
          return now - value >= ENQUIRY_MIN_FILL_MS && value <= now + 60_000;
        },
        "Form submitted too quickly",
      ),
  })
  .transform((value) => ({ ...value, consentAt: new Date(), consentVersion: CONSENT_VERSION }));

export type BlogPageQuery = z.infer<typeof blogPageQuery>;
export type SearchQuery = z.infer<typeof searchQuery>;
export type EnquiryInput = z.infer<typeof enquiryInput>;
