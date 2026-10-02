import { z } from "zod";

const required = z.string().min(1);
const mailToList = z
  .string()
  .min(1)
  .transform((value) =>
    value
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0),
  )
  .pipe(z.array(z.email()).min(1));

export const serverEnvSchema = z.object({
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.url(),
  RESEND_API_KEY: required,
  MAIL_FROM: z.email(),
  MAIL_TO: mailToList,
  MAIL_ENABLED: z.enum(["true", "false"]).transform((value) => value === "true"),
  BLOB_READ_WRITE_TOKEN: required,
  UPSTASH_REDIS_REST_URL: z.url(),
  UPSTASH_REDIS_REST_TOKEN: required,
  TOTP_ENCRYPTION_KEY: z.string().min(32),
  SENTRY_DSN: z.url().optional(),
  SEED_ADMIN_EMAIL: z.email(),
  SEED_ADMIN_PASSWORD: z.string().min(14),
});

export const seedEnvSchema = z.object({
  SEED_ADMIN_EMAIL: z.email(),
  SEED_ADMIN_PASSWORD: z.string().min(14),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseEnv(input: NodeJS.ProcessEnv): ServerEnv {
  return serverEnvSchema.parse(input);
}

let cached: ServerEnv | undefined;

export function getEnv(): ServerEnv {
  if (!cached) {
    cached = parseEnv(process.env);
  }
  return cached;
}
