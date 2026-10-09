import { config as loadEnv } from "dotenv";
import { getDb } from "../lib/db";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const SLUG = "m6-audit-fixture";

async function main() {
  const db = getDb();

  const category =
    (await db.category.findFirst({ where: { slug: "ivf" } })) ??
    (await db.category.findFirst()) ??
    (await db.category.create({ data: { name: "IVF", slug: "ivf" } }));

  const user = await db.user.findFirst({ where: { isActive: true } });
  if (!user) throw new Error("no active user in DB - run npm run db:seed first");

  const content = {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Understanding IVF success rates" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "IVF success rates depend on age, embryo quality, and uterine health. This fixture article exists so automated accessibility and performance audits can exercise a realistic post page with headings, lists, callouts, and a video embed.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "What affects outcomes" }],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "Maternal age and ovarian reserve" }] },
            ],
          },
          {
            type: "listItem",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "Embryo grading and transfer protocol" }] },
            ],
          },
          {
            type: "listItem",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "Lifestyle factors and clinic protocol adherence" }] },
            ],
          },
        ],
      },
      {
        type: "callout",
        attrs: { variant: "medical" },
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Individual outcomes vary. Your clinician will review protocol options during consultation.",
              },
            ],
          },
        ],
      },
      {
        type: "embed",
        attrs: {
          provider: "youtube",
          url: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
        },
      },
    ],
  };

  const plainText =
    "Understanding IVF success rates depend on age embryo quality and uterine health. " +
    "This fixture article exists so automated accessibility and performance audits can exercise " +
    "a realistic post page with headings lists callouts and a video embed. Maternal age and " +
    "ovarian reserve, embryo grading and transfer protocol, lifestyle factors and clinic protocol " +
    "adherence. Individual outcomes vary. Your clinician will review protocol options during consultation. " +
    "Understanding IVF success rates depend on age embryo quality and uterine health.";

  const post = await db.post.upsert({
    where: { slug: SLUG },
    update: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      content: content as never,
      plainText,
      updatedAt: new Date(),
      noindex: true,
    },
    create: {
      slug: SLUG,
      title: "Understanding IVF Success Rates: A Clear Guide",
      excerpt:
        "How age, embryo quality, and protocol choices shape IVF outcomes — an audit fixture article.",
      content: content as never,
      plainText,
      readingTime: 5,
      categoryId: category.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      disclaimer:
        "This article is for education only and does not replace personalised medical advice.",
      reviewerName: "Dr. Amina Lawal",
      reviewerCredential: "Consultant Reproductive Endocrinologist",
      reviewedAt: new Date(),
      faqs: [
        {
          question: "What is a good IVF success rate for my age?",
          answer:
            "Success rates decline with age; your clinic can share age-banded figures for your protocol.",
        },
        {
          question: "How many embryo transfers will I need?",
          answer:
            "This depends on embryo quality and response to transfer preparation; your clinician will advise.",
        },
      ],
      metaTitle: "IVF Success Rates Explained | Lawon Bloom Journal",
      metaDescription:
        "Clear, clinically reviewed guidance on how age, embryo quality, and protocol choices shape IVF success rates.",
      noindex: true,
      createdBy: user.id,
      publishedBy: user.id,
    },
  });

  console.log(`/blog/${post.slug}`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
