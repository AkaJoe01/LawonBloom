import { describe, expect, it } from "vitest";
import { blogPageQuery, enquiryInput, searchQuery } from "@/lib/validation/blog";

function validEnquiry(overrides: Record<string, unknown> = {}) {
  return {
    name: "Ada Obi",
    email: "ada@example.com",
    phone: "+234 800 111 2222",
    message: "I would like to understand IUI timing better.",
    postSlug: "iui-timing",
    consent: true,
    website: "",
    startedAt: Date.now() - 3000,
    ...overrides,
  };
}

describe("enquiryInput", () => {
  it("accepts a valid enquiry and stamps consent server-side", () => {
    const parsed = enquiryInput.safeParse(validEnquiry());
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.consentVersion).toBe("v2");
    expect(parsed.data.consentAt).toBeInstanceOf(Date);
    expect(parsed.data.phone).toBe("+234 800 111 2222");
  });

  it("accepts an enquiry without optional fields", () => {
    const { phone, postSlug, ...required } = validEnquiry();
    void phone;
    void postSlug;
    expect(enquiryInput.safeParse(required).success).toBe(true);
  });

  it("requires consent", () => {
    const parsed = enquiryInput.safeParse(validEnquiry({ consent: false }));
    expect(parsed.success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    const parsed = enquiryInput.safeParse(validEnquiry({ website: "spam" }));
    expect(parsed.success).toBe(false);
  });

  it("rejects submissions faster than the min-fill window", () => {
    const parsed = enquiryInput.safeParse(validEnquiry({ startedAt: Date.now() }));
    expect(parsed.success).toBe(false);
  });

  it("rejects a future start timestamp", () => {
    const parsed = enquiryInput.safeParse(validEnquiry({ startedAt: Date.now() + 120_000 }));
    expect(parsed.success).toBe(false);
  });

  it("rejects a short message", () => {
    const parsed = enquiryInput.safeParse(validEnquiry({ message: "hi" }));
    expect(parsed.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const parsed = enquiryInput.safeParse(validEnquiry({ email: "nope" }));
    expect(parsed.success).toBe(false);
  });

  it("rejects an invalid phone format", () => {
    const parsed = enquiryInput.safeParse(validEnquiry({ phone: "not-a-phone" }));
    expect(parsed.success).toBe(false);
  });

  it("requires the honeypot key to be present as an empty string", () => {
    const { website, ...withoutHoneypot } = validEnquiry();
    void website;
    expect(enquiryInput.safeParse(withoutHoneypot).success).toBe(false);
  });
});

describe("searchQuery", () => {
  it("accepts a query of 2+ characters with a default page", () => {
    expect(searchQuery.parse({ q: "ivf" })).toEqual({ q: "ivf", page: 1 });
  });

  it("rejects an empty or 1-character query", () => {
    expect(searchQuery.safeParse({ q: "" }).success).toBe(false);
    expect(searchQuery.safeParse({ q: "a" }).success).toBe(false);
  });

  it("rejects an out-of-range page", () => {
    expect(searchQuery.safeParse({ q: "ivf", page: "999" }).success).toBe(false);
    expect(searchQuery.safeParse({ q: "ivf", page: "banana" }).success).toBe(false);
  });
});

describe("blogPageQuery", () => {
  it("defaults to page 1", () => {
    expect(blogPageQuery.parse({})).toEqual({ page: 1 });
  });

  it("coerces a numeric page", () => {
    expect(blogPageQuery.parse({ page: "3" })).toEqual({ page: 3 });
  });

  it("rejects page 0 and huge pages", () => {
    expect(blogPageQuery.safeParse({ page: "0" }).success).toBe(false);
    expect(blogPageQuery.safeParse({ page: "501" }).success).toBe(false);
  });
});
