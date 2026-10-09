import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  PrismaClient: vi.fn(),
  PrismaNeon: vi.fn(),
  PrismaPg: vi.fn(),
}));

vi.mock("@prisma/client", () => ({ PrismaClient: mocks.PrismaClient }));
vi.mock("@prisma/adapter-neon", () => ({ PrismaNeon: mocks.PrismaNeon }));
vi.mock("@prisma/adapter-pg", () => ({ PrismaPg: mocks.PrismaPg }));

const ORIGINAL_ENV = { ...process.env };

async function loadGetDb() {
  vi.resetModules();
  const { getDb } = await import("@/lib/db");
  return getDb;
}

async function loadDbModule() {
  vi.resetModules();
  return import("@/lib/db");
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.clearAllMocks();
});

describe("getDb", () => {
  it("uses DATABASE_URL when set", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@pooler.neon.tech/neondb";
    process.env.DIRECT_URL = "postgresql://user:pass@direct.neon.tech/neondb";
    const getDb = await loadGetDb();
    getDb();
    expect(mocks.PrismaNeon).toHaveBeenCalledWith({
      connectionString: "postgresql://user:pass@pooler.neon.tech/neondb",
    });
    expect(mocks.PrismaClient).toHaveBeenCalled();
  });

  it("falls back to DIRECT_URL when DATABASE_URL is unset", async () => {
    delete process.env.DATABASE_URL;
    process.env.DIRECT_URL = "postgresql://user:pass@direct.neon.tech/neondb";
    const getDb = await loadGetDb();
    getDb();
    expect(mocks.PrismaNeon).toHaveBeenCalledWith({
      connectionString: "postgresql://user:pass@direct.neon.tech/neondb",
    });
  });

  it("throws when both URLs are missing", async () => {
    delete process.env.DATABASE_URL;
    delete process.env.DIRECT_URL;
    const getDb = await loadGetDb();
    expect(() => getDb()).toThrow("DATABASE_URL/DIRECT_URL is not set");
    expect(mocks.PrismaNeon).not.toHaveBeenCalled();
  });

  it("caches the client across calls", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@pooler.neon.tech/neondb";
    const getDb = await loadGetDb();
    const first = getDb();
    const second = getDb();
    expect(first).toBe(second);
    expect(mocks.PrismaClient).toHaveBeenCalledTimes(1);
  });

  it("uses the TCP pg adapter for non-Neon URLs", async () => {
    process.env.DATABASE_URL = "postgresql://ci:ci@localhost:5432/ci";
    const getDb = await loadGetDb();
    getDb();
    expect(mocks.PrismaPg).toHaveBeenCalledWith({
      connectionString: "postgresql://ci:ci@localhost:5432/ci",
    });
    expect(mocks.PrismaNeon).not.toHaveBeenCalled();
    expect(mocks.PrismaClient).toHaveBeenCalledWith({ adapter: mocks.PrismaPg.mock.results[0].value });
  });
});

describe("isNeonConnectionString", () => {
  it("detects Neon hostnames", async () => {
    const { isNeonConnectionString } = await loadDbModule();
    expect(isNeonConnectionString("postgresql://user:pass@ep-cool-forest-123.us-east-2.neon.tech/neondb")).toBe(true);
    expect(isNeonConnectionString("postgresql://user:pass@pooler.neon.tech/neondb?sslmode=require")).toBe(true);
  });

  it("rejects non-Neon hostnames", async () => {
    const { isNeonConnectionString } = await loadDbModule();
    expect(isNeonConnectionString("postgresql://ci:ci@localhost:5432/ci")).toBe(false);
    expect(isNeonConnectionString("postgresql://user:pass@db.example.com:5432/app")).toBe(false);
  });

  it("falls back to substring matching for unparseable URLs", async () => {
    const { isNeonConnectionString } = await loadDbModule();
    expect(isNeonConnectionString("not a url .neon.tech")).toBe(true);
    expect(isNeonConnectionString("not a url")).toBe(false);
  });
});

describe("createAdapter", () => {
  it("returns PrismaNeon for Neon URLs", async () => {
    const { createAdapter } = await loadDbModule();
    const adapter = createAdapter("postgresql://user:pass@ep-cool-forest-123.neon.tech/neondb");
    expect(mocks.PrismaNeon).toHaveBeenCalledWith({
      connectionString: "postgresql://user:pass@ep-cool-forest-123.neon.tech/neondb",
    });
    expect(mocks.PrismaPg).not.toHaveBeenCalled();
    expect(adapter).toBe(mocks.PrismaNeon.mock.results[0].value);
  });

  it("returns PrismaPg for non-Neon URLs", async () => {
    const { createAdapter } = await loadDbModule();
    const adapter = createAdapter("postgresql://ci:ci@localhost:5432/ci");
    expect(mocks.PrismaPg).toHaveBeenCalledWith({
      connectionString: "postgresql://ci:ci@localhost:5432/ci",
    });
    expect(mocks.PrismaNeon).not.toHaveBeenCalled();
    expect(adapter).toBe(mocks.PrismaPg.mock.results[0].value);
  });
});
