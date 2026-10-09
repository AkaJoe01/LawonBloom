import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";

let client: PrismaClient | undefined;

export function isNeonConnectionString(connectionString: string): boolean {
  try {
    return new URL(connectionString).hostname.endsWith(".neon.tech");
  } catch {
    return connectionString.includes(".neon.tech");
  }
}

export function createAdapter(connectionString: string): PrismaNeon | PrismaPg {
  if (isNeonConnectionString(connectionString)) {
    return new PrismaNeon({ connectionString });
  }
  return new PrismaPg({ connectionString });
}

export function getDb(): PrismaClient {
  if (!client) {
    const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL/DIRECT_URL is not set");
    }
    if (!process.env.DATABASE_URL) {
      console.warn("[db] DATABASE_URL missing — falling back to DIRECT_URL");
    }
    client = new PrismaClient({ adapter: createAdapter(connectionString) });
  }
  return client;
}
