import { describe, expect, it } from "vitest";
import { confirmedFaqs, faqs } from "@/app/(site)/faq/faqs";
import { faqJsonLd } from "@/lib/seo";

describe("site FAQ data (M8b single source)", () => {
  it("ships exactly six unique entries with complete fields and boolean flags", () => {
    expect(faqs).toHaveLength(6);
    const questions = faqs.map((entry) => entry.question);
    expect(new Set(questions).size).toBe(faqs.length);
    for (const entry of faqs) {
      expect(typeof entry.confirmed).toBe("boolean");
      expect(entry.category.trim().length).toBeGreaterThan(0);
      expect(entry.question.trim().length).toBeGreaterThan(10);
      expect(entry.answer.trim().length).toBeGreaterThan(40);
    }
  });

  it("confirmedFaqs returns only confirmed entries (H1 gating)", () => {
    expect(confirmedFaqs().every((entry) => entry.confirmed)).toBe(true);
    for (const entry of confirmedFaqs()) {
      expect(faqs).toContainEqual(entry);
    }
  });

  it("drives FAQPage schema: absent pre-H1, exact count post-H1", () => {
    const count = confirmedFaqs().length;
    const schema = faqJsonLd(
      confirmedFaqs().map(({ question, answer }) => ({ question, answer })),
    );
    if (count === 0) {
      expect(schema).toBeNull();
    } else {
      expect(schema).not.toBeNull();
      expect(schema!["@type"]).toBe("FAQPage");
      expect((schema!.mainEntity as unknown[])).toHaveLength(count);
    }
  });
});
