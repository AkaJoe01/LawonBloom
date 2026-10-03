import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { limitMock } = vi.hoisted(() => ({
  limitMock: vi.fn(),
}));

vi.mock("@upstash/ratelimit", () => {
  class Ratelimit {
    limit = limitMock;
    static slidingWindow() {
      return "window";
    }
  }
  return { Ratelimit };
});

import { checkRateLimit } from "../../lib/rate-limit";

function clearUpstashEnv() {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
}

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearUpstashEnv();
  });

  afterEach(() => {
    clearUpstashEnv();
  });

  it("fails open when Upstash env is missing", async () => {
    const result = await checkRateLimit(
      { key: "k", limit: 3, windowSeconds: 600, prefix: "p" },
      "open",
    );
    expect(result).toEqual({ ok: true, degraded: true });
    expect(limitMock).not.toHaveBeenCalled();
  });

  it("fails closed when Upstash env is missing", async () => {
    const result = await checkRateLimit(
      { key: "k", limit: 3, windowSeconds: 600, prefix: "p" },
      "closed",
    );
    expect(result).toEqual({ ok: false, degraded: true });
    expect(limitMock).not.toHaveBeenCalled();
  });

  it("returns success from the limiter", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    limitMock.mockResolvedValue({ success: true, remaining: 2 });

    const result = await checkRateLimit(
      { key: "k", limit: 3, windowSeconds: 600, prefix: "p" },
      "open",
    );
    expect(result).toEqual({ ok: true, remaining: 2 });
    expect(limitMock).toHaveBeenCalledWith("k");
  });

  it("returns failure when the budget is exhausted", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    limitMock.mockResolvedValue({ success: false, remaining: 0 });

    const result = await checkRateLimit(
      { key: "k", limit: 3, windowSeconds: 600, prefix: "p" },
      "open",
    );
    expect(result).toEqual({ ok: false, remaining: 0 });
  });

  it("fails open on limiter errors when fail-open is requested", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    limitMock.mockRejectedValue(new Error("upstash 500"));

    const result = await checkRateLimit(
      { key: "k", limit: 3, windowSeconds: 600, prefix: "p" },
      "open",
    );
    expect(result).toEqual({ ok: true, degraded: true });
  });

  it("fails closed on limiter errors when fail-closed is requested", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    limitMock.mockRejectedValue(new Error("upstash 500"));

    const result = await checkRateLimit(
      { key: "k", limit: 10, windowSeconds: 300, prefix: "p" },
      "closed",
    );
    expect(result).toEqual({ ok: false, degraded: true });
  });
});
