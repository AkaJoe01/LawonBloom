import { describe, expect, it } from "vitest";
import { parseEnv, seedEnvSchema, serverEnvSchema, getEnv } from "../lib/env";

const validEnv: NodeJS.ProcessEnv = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://user:pass@ep-1.neon.tech/neondb?sslmode=require",
  DIRECT_URL: "postgresql://user:pass@ep-1.neon.tech/neondb?sslmode=require",
  AUTH_SECRET: "a".repeat(48),
  AUTH_URL: "https://lawonbloomfertilitycentre.com",
  RESEND_API_KEY: "re_test_key",
  MAIL_FROM: "no-reply@lawonbloomfertilitycentre.com",
  MAIL_TO: "clinic@lawonbloomfertilitycentre.com",
  MAIL_ENABLED: "true",
  BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_token",
  UPSTASH_REDIS_REST_URL: "https://upstash.example.upstash.io",
  UPSTASH_REDIS_REST_TOKEN: "upstash_token",
  TOTP_ENCRYPTION_KEY: "b".repeat(48),
  SENTRY_DSN: "https://o123456.ingest.sentry.io/456",
  SEED_ADMIN_EMAIL: "admin@lawonbloomfertilitycentre.com",
  SEED_ADMIN_PASSWORD: "seed-password-long",
};

function issuesFor(input: NodeJS.ProcessEnv): { path: string }[] {
  const result = serverEnvSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    path: String(issue.path[0]),
  }));
}

describe("parseEnv", () => {
  it("parses a fully valid environment", () => {
    const env = parseEnv(validEnv);
    expect(env.AUTH_URL).toBe("https://lawonbloomfertilitycentre.com");
    expect(env.MAIL_ENABLED).toBe(true);
    expect(env.MAIL_TO).toEqual([
      "clinic@lawonbloomfertilitycentre.com",
    ]);
    expect(env.SENTRY_DSN).toContain("sentry.io");
  });

  it("accepts a missing optional SENTRY_DSN", () => {
    const input = { ...validEnv };
    delete input.SENTRY_DSN;
    expect(() => parseEnv(input)).not.toThrow();
  });

  const requiredKeys = [
    "DATABASE_URL",
    "DIRECT_URL",
    "AUTH_SECRET",
    "AUTH_URL",
    "RESEND_API_KEY",
    "MAIL_FROM",
    "MAIL_TO",
    "MAIL_ENABLED",
    "BLOB_READ_WRITE_TOKEN",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "TOTP_ENCRYPTION_KEY",
    "SEED_ADMIN_EMAIL",
    "SEED_ADMIN_PASSWORD",
  ] as const;

  for (const key of requiredKeys) {
    it(`rejects a missing ${key}`, () => {
      const input = { ...validEnv };
      delete input[key];
      const issues = issuesFor(input);
      expect(issues.some((issue) => issue.path === key)).toBe(true);
    });
  }

  it("rejects a short AUTH_SECRET", () => {
    const issues = issuesFor({ ...validEnv, AUTH_SECRET: "short" });
    expect(issues.some((issue) => issue.path === "AUTH_SECRET")).toBe(true);
  });

  it("rejects a short TOTP_ENCRYPTION_KEY", () => {
    const issues = issuesFor({ ...validEnv, TOTP_ENCRYPTION_KEY: "short" });
    expect(issues.some((issue) => issue.path === "TOTP_ENCRYPTION_KEY")).toBe(
      true,
    );
  });

  it("rejects a non-URL DATABASE_URL", () => {
    const issues = issuesFor({ ...validEnv, DATABASE_URL: "not-a-url" });
    expect(issues.some((issue) => issue.path === "DATABASE_URL")).toBe(true);
  });

  it("rejects a non-email MAIL_FROM", () => {
    const issues = issuesFor({ ...validEnv, MAIL_FROM: "not-an-email" });
    expect(issues.some((issue) => issue.path === "MAIL_FROM")).toBe(true);
  });

  it("rejects a MAIL_ENABLED value outside true/false", () => {
    const issues = issuesFor({ ...validEnv, MAIL_ENABLED: "yes" });
    expect(issues.some((issue) => issue.path === "MAIL_ENABLED")).toBe(true);
  });

  it("splits and trims a multi-recipient MAIL_TO allowlist", () => {
    const env = parseEnv({
      ...validEnv,
      MAIL_TO: "a@x.com, b@y.com ,c@z.com",
    });
    expect(env.MAIL_TO).toEqual(["a@x.com", "b@y.com", "c@z.com"]);
  });

  it("rejects an invalid recipient inside MAIL_TO", () => {
    const issues = issuesFor({ ...validEnv, MAIL_TO: "a@x.com, nope" });
    expect(issues.some((issue) => issue.path === "MAIL_TO")).toBe(true);
  });

  it("rejects a MAIL_ENABLED boolean at the wrong type shape", () => {
    const issues = issuesFor({
      ...validEnv,
      MAIL_ENABLED: undefined as unknown as string,
    });
    expect(issues.some((issue) => issue.path === "MAIL_ENABLED")).toBe(true);
  });

  it("rejects a short SEED_ADMIN_PASSWORD", () => {
    const issues = issuesFor({ ...validEnv, SEED_ADMIN_PASSWORD: "short" });
    expect(issues.some((issue) => issue.path === "SEED_ADMIN_PASSWORD")).toBe(
      true,
    );
  });
});

describe("seedEnvSchema", () => {
  it("accepts a valid seed pair", () => {
    const parsed = seedEnvSchema.parse({
      SEED_ADMIN_EMAIL: "admin@lawonbloomfertilitycentre.com",
      SEED_ADMIN_PASSWORD: "seed-password-long",
    });
    expect(parsed.SEED_ADMIN_EMAIL).toBe(
      "admin@lawonbloomfertilitycentre.com",
    );
  });

  it("rejects a missing seed pair", () => {
    const result = seedEnvSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("getEnv", () => {
  it("parses process.env once and returns the cached instance", () => {
    for (const [key, value] of Object.entries(validEnv)) {
      process.env[key] = value;
    }
    const first = getEnv();
    const second = getEnv();
    expect(second).toBe(first);
    expect(first.MAIL_ENABLED).toBe(true);
  });
});
