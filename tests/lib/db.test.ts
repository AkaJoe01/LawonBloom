import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  PrismaClient: vi.fn(),
  PrismaNeon: vi.fn(),
}));

vi.mock("@prisma/client", () => ({ PrismaClient: mocks.PrismaClient }));
vi.mock("@prisma/adapter-neon", () => ({ PrismaNeon: mocks.PrismaNeon }));

const ORIGINAL_ENV = { ...process.env };

async function loadGetDb() {
  vi.resetModules();
  const { getDb } = await import("@/lib/db");
  return getDb;
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.clearAllMocks();
});

describe("getDb", () => {
  it("uses Neon adapter when DATABASE_URL points to Neon", async () => {
    process.env.DATABASE_URL = "postgresql://pooler.neon.tech/neondb";
    process.env.DIRECT_URL = "postgresql://direct.neon.tech/neondb";
    const getDb = await loadGetDb();
    getDb();
    expect(mocks.PrismaNeon).toHaveBeenCalledWith({
      connectionString: "postgresql://pooler.neon.tech/neondb",
    });
    expect(mocks.PrismaClient).toHaveBeenCalled();
  });

  it("falls back to DIRECT_URL when DATABASE_URL is unset", async () => {
    delete process.env.DATABASE_URL;
    process.env.DIRECT_URL = "postgresql://direct.neon.tech/neondb";
    const getDb = await loadGetDb();
    getDb();
    expect(mocks.PrismaNeon).toHaveBeenCalledWith({
      connectionString: "postgresql://direct.neon.tech/neondb",
    });
  });

  it("uses native Prisma client for non-Neon URLs", async () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/ci";
    const getDb = await loadGetDb();
    getDb();
    expect(mocks.PrismaNeon).not.toHaveBeenCalled();
    expect(mocks.PrismaClient).toHaveBeenCalledWith();
  });

  it("throws when both URLs are missing", async () => {
    delete process.env.DATABASE_URL;
    delete process.env.DIRECT_URL;
    const getDb = await loadGetDb();
    expect(() => getDb()).toThrow("DATABASE_URL/DIRECT_URL is not set");
    expect(mocks.PrismaNeon).not.toHaveBeenCalled();
  });

  it("caches the client across calls", async () => {
    process.env.DATABASE_URL = "postgresql://pooler.neon.tech/neondb";
    const getDb = await loadGetDb();
    const first = getDb();
    const second = getDb();
    expect(first).toBe(second);
    expect(mocks.PrismaClient).toHaveBeenCalledTimes(1);
  });
});
