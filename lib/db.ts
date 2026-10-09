import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

let client: PrismaClient | undefined;

function shouldUseNeonAdapter(connectionString: string): boolean {
  try {
    const { hostname } = new URL(connectionString);
    return hostname.endsWith(".neon.tech");
  } catch {
    return false;
  }
}

export function createDbClient(connectionString: string): PrismaClient {
  if (shouldUseNeonAdapter(connectionString)) {
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
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
    client = createDbClient(connectionString);
  }
  return client;
}
