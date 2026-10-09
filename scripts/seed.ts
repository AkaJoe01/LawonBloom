import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { CATEGORIES } from "../lib/categories";
import { isNeonConnectionString } from "../lib/db";
import { hashPassword } from "../lib/auth/password";
import { logEvent } from "../lib/observability/log";
import { emailSchema } from "../lib/validation/common";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

function fail(message: string): never {
  console.error(`seed: ${message}`);
  process.exit(1);
}

async function main(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email) fail("SEED_ADMIN_EMAIL is not set");
  if (!password) fail("SEED_ADMIN_PASSWORD is not set");
  if (password.length < 14) fail("SEED_ADMIN_PASSWORD must be at least 14 characters");
  if (!emailSchema.safeParse(email).success) fail("SEED_ADMIN_EMAIL is not a valid email");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) fail("DATABASE_URL is not set");

  const db = isNeonConnectionString(connectionString)
    ? new PrismaClient({ adapter: new PrismaNeon({ connectionString }) })
    : new PrismaClient();

  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      logEvent("seed_admin_exists");
    } else {
      const passwordHash = await hashPassword(password);
      const created = await db.user.create({
        data: { email, passwordHash, role: "ADMIN" },
        select: { id: true },
      });
      logEvent("seed_admin_created", { adminId: created.id });
    }

    for (const [index, category] of CATEGORIES.entries()) {
      await db.category.upsert({
        where: { slug: category.slug },
        update: { name: category.name, description: category.description, sortOrder: index },
        create: {
          slug: category.slug,
          name: category.name,
          description: category.description,
          sortOrder: index,
        },
      });
    }
    logEvent("seed_categories_upserted", { count: CATEGORIES.length });
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(`seed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
