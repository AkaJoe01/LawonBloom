import { redactDeep } from "./pii";

export type LogLevel = "info" | "warn" | "error";
export type LogFields = Record<string, unknown>;

const RESERVED_KEYS = new Set(["lvl", "evt", "rid", "ts"]);

export function newRid(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export function ridOf(source: { headers?: Headers } | Headers | Request): string | null {
  const headers = source instanceof Headers ? source : (source as { headers?: Headers }).headers;
  if (!headers || typeof headers.get !== "function") return null;
  return headers.get("x-request-id") ?? headers.get("x-vercel-id") ?? null;
}

export function logEvent(evt: string, fields: LogFields = {}, lvl: LogLevel = "info"): void {
  const sanitized: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (RESERVED_KEYS.has(key)) continue;
    sanitized[key] = (redactDeep({ [key]: value }) as LogFields)[key];
  }
  const rid = typeof fields.rid === "string" && fields.rid.length > 0 ? fields.rid : newRid();
  const line = JSON.stringify({ lvl, evt, rid, ts: new Date().toISOString(), ...sanitized });
  if (lvl === "error") {
    console.error(line);
  } else if (lvl === "warn") {
    console.warn(line);
  } else {
    console.info(line);
  }
}
