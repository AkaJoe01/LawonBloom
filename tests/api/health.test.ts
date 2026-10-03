import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDb, queryRaw } = vi.hoisted(() => ({
  getDb: vi.fn(),
  queryRaw: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getDb: () => getDb(),
}));

import { GET } from "../../app/api/health/route";

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDb.mockReturnValue({ $queryRaw: queryRaw });
    queryRaw.mockResolvedValue([{ n: 3 }]);
  });

  it("returns 503 when the database is unreachable", async () => {
    getDb.mockImplementation(() => {
      throw new Error("DATABASE_URL is not set");
    });
    const response = await GET();
    expect(response.status).toBe(503);
    const payload = await response.json();
    expect(payload).toEqual({ ok: false, db: "down", migrations: 0 });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("returns 503 when the ping query fails", async () => {
    queryRaw.mockRejectedValueOnce(new Error("conn reset"));
    const response = await GET();
    expect(response.status).toBe(503);
    expect((await response.json()).db).toBe("down");
  });

  it("returns 200 with the applied migration count", async () => {
    queryRaw
      .mockResolvedValueOnce([1])
      .mockResolvedValueOnce([{ n: 3 }]);
    const response = await GET();
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({ ok: true, db: "up", migrations: 3 });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("returns 200 with migrations=0 when the count query fails", async () => {
    queryRaw
      .mockResolvedValueOnce([1])
      .mockRejectedValueOnce(new Error("_prisma_migrations missing"));
    const response = await GET();
    expect(response.status).toBe(200);
    expect((await response.json()).migrations).toBe(0);
  });

  it("handles a count query with no rows", async () => {
    queryRaw.mockResolvedValueOnce([1]).mockResolvedValueOnce([]);
    const response = await GET();
    expect((await response.json()).migrations).toBe(0);
  });
});
