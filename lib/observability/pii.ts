const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;

export const REDACTED = "[redacted]";

const SENSITIVE_KEYS = new Set([
  "authorization",
  "cookie",
  "setcookie",
  "password",
  "passwordhash",
  "token",
  "secret",
  "email",
  "name",
  "message",
  "phone",
  "otp",
  "totp",
  "backupcode",
  "codehash",
  "apikey",
  "xapikey",
]);

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[-_\s]/g, "");
}

export function redactString(value: string): string {
  return value.replace(EMAIL_RE, REDACTED);
}

export function redactDeep(value: unknown, depth = 6): unknown {
  if (depth <= 0) return REDACTED;
  if (typeof value === "string") return redactString(value);
  if (Array.isArray(value)) return value.map((entry) => redactDeep(entry, depth - 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      out[key] = SENSITIVE_KEYS.has(normalizeKey(key)) ? REDACTED : redactDeep(entry, depth - 1);
    }
    return out;
  }
  return value;
}
