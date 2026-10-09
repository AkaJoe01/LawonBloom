import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

let client: PrismaClient | undefined;

export function isNeonConnectionString(connectionString: string): boolean {
  try {
    return new URL(connectionString).hostname.endsWith(".neon.tech");
  } catch {
    return connectionString.includes(".neon.tech");
  }
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
    if (isNeonConnectionString(connectionString)) {
      const adapter = new PrismaNeon({ connectionString });
      client = new PrismaClient({ adapter });
    } else {
      client = new PrismaClient();
    }
  }
  return client;
}
