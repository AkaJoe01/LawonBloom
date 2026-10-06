import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logEvent, newRid, ridOf } from "../../lib/observability/log";

function lastJson(spy: ReturnType<typeof vi.spyOn>): unknown {
  const calls = spy.mock.calls;
  const line = calls[calls.length - 1]?.[0];
  return typeof line === "string" ? JSON.parse(line) : undefined;
}

describe("logEvent", () => {
  let info: ReturnType<typeof vi.spyOn>;
  let warn: ReturnType<typeof vi.spyOn>;
  let error: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    info = vi.spyOn(console, "info").mockImplementation(() => {});
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    error = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits one JSON line with lvl, evt, rid, ts", () => {
    logEvent("publish", { userId: "u1", postId: "p1" });
    const parsed = lastJson(info) as Record<string, unknown>;
    expect(parsed.lvl).toBe("info");
    expect(parsed.evt).toBe("publish");
    expect(parsed.rid).toEqual(expect.any(String));
    expect(parsed.rid).toHaveLength(16);
    expect(parsed.ts).toEqual(expect.any(String));
    expect(parsed.userId).toBe("u1");
    expect(parsed.postId).toBe("p1");
    expect(info).toHaveBeenCalledTimes(1);
  });

  it("uses the caller-supplied rid when present", () => {
    logEvent("login_success", { rid: "rid-abc", userId: "u1" });
    const parsed = lastJson(info) as Record<string, unknown>;
    expect(parsed.rid).toBe("rid-abc");
    expect(parsed.userId).toBe("u1");
  });

  it("routes levels to console.warn/error", () => {
    logEvent("lockout", {}, "warn");
    logEvent("mail_failed", {}, "error");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);
    expect((lastJson(warn) as Record<string, unknown>).lvl).toBe("warn");
    expect((lastJson(error) as Record<string, unknown>).lvl).toBe("error");
  });

  it("redacts sensitive keys and email-shaped strings", () => {
    logEvent("enquiry_partial", {
      id: "e1",
      email: "ada@example.com",
      message: "my secret worry",
      note: "contact ada@example.com please",
      nested: { phone: "+234800", ok: "keep-me" },
    });
    const parsed = lastJson(info) as Record<string, unknown>;
    expect(parsed.email).toBe("[redacted]");
    expect(parsed.message).toBe("[redacted]");
    expect(parsed.note).toBe("contact [redacted] please");
    expect(parsed.nested).toEqual({ phone: "[redacted]", ok: "keep-me" });
    expect(parsed.id).toBe("e1");
  });

  it("does not let callers overwrite reserved keys", () => {
    logEvent("evt", { lvl: "fake", evt: "fake", rid: "", ts: "fake" });
    const parsed = lastJson(info) as Record<string, unknown>;
    expect(parsed.lvl).toBe("info");
    expect(parsed.evt).toBe("evt");
    expect(parsed.rid).toHaveLength(16);
    expect(parsed.ts).not.toBe("fake");
  });
});

describe("ridOf", () => {
  it("prefers x-request-id over x-vercel-id", () => {
    const headers = new Headers({ "x-request-id": "a", "x-vercel-id": "b" });
    expect(ridOf(headers)).toBe("a");
  });

  it("falls back to x-vercel-id", () => {
    expect(ridOf(new Headers({ "x-vercel-id": "b" }))).toBe("b");
  });

  it("reads headers from a Request", () => {
    const request = new Request("https://example.com", { headers: { "x-vercel-id": "v1" } });
    expect(ridOf(request)).toBe("v1");
  });

  it("returns null when neither header is present or source is bare", () => {
    expect(ridOf(new Headers())).toBeNull();
    expect(ridOf({})).toBeNull();
  });
});

describe("newRid", () => {
  it("generates 16-char ids that differ", () => {
    const a = newRid();
    const b = newRid();
    expect(a).toHaveLength(16);
    expect(a).not.toBe(b);
  });
});
