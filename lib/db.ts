import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

let client: PrismaClient | undefined;

export function getDb(): PrismaClient {
  if (!client) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    const adapter = new PrismaNeon({ connectionString });
    client = new PrismaClient({ adapter });
  }
  return client;
}
