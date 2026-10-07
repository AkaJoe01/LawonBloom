import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitConfig {
  key: string;
  limit: number;
  windowSeconds: number;
  prefix: string;
}

export interface RateLimitOutcome {
  ok: boolean;
  degraded?: boolean;
  remaining?: number;
}

let redis: Redis | undefined;
let warned = false;

function getRedis(): Redis | undefined {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (!warned && process.env.NODE_ENV !== "test") {
      warned = true;
      console.warn("rate-limit: UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not set");
    }
    return undefined;
  }
  if (!redis) {
    redis = new Redis({ url, token });
  }
  return redis;
}

export async function checkRateLimit(config: RateLimitConfig, failMode: "open" | "closed"): Promise<RateLimitOutcome> {
  const activeRedis = getRedis();
  if (!activeRedis) {
    return failMode === "open"
      ? { ok: true, degraded: true }
      : { ok: false, degraded: true };
  }

  const limiter = new Ratelimit({
    redis: activeRedis,
    limiter: Ratelimit.slidingWindow(config.limit, `${config.windowSeconds}s`),
    prefix: config.prefix,
  });

  try {
    const result = await limiter.limit(config.key);
    return { ok: result.success, remaining: result.remaining };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (process.env.NODE_ENV !== "test") {
      console.warn(`rate-limit failed (${failMode === "open" ? "failing open" : "failing closed"}): ${message}`);
    }
    return failMode === "open" ? { ok: true, degraded: true } : { ok: false, degraded: true };
  }
}
