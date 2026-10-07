import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

let client: PrismaClient | undefined;

export function getDb(): PrismaClient {
  if (!client) {
    const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL/DIRECT_URL is not set");
    }
    if (!process.env.DATABASE_URL) {
      console.warn("[db] DATABASE_URL missing — falling back to DIRECT_URL");
    }
    const adapter = new PrismaNeon({ connectionString });
    client = new PrismaClient({ adapter });
  }
  return client;
}
