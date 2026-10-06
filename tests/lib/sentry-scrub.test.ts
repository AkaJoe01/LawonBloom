import { describe, expect, it } from "vitest";
import { scrubBreadcrumb, scrubEvent } from "../../lib/observability/sentry-scrub";

describe("scrubEvent", () => {
  it("redacts user PII but keeps ids", () => {
    const out = scrubEvent({
      user: { id: "u1", email: "admin@clinic.test", name: "Jane Doe" },
      message: "failed for ada@example.com",
    });
    expect(out.user).toEqual({ id: "u1", email: "[redacted]", name: "[redacted]" });
    expect(out.message).toBe("failed for [redacted]");
  });

  it("strips headers, cookies, and query strings from the request", () => {
    const out = scrubEvent({
      request: {
        url: "https://lawonbloomfertilitycentre.com/admin?email=ada%40example.com",
        headers: { authorization: "Bearer secret", "content-type": "application/json", cookie: "session=abc" },
        cookies: { "authjs.session-token": "abc" },
        query_string: "email=ada@example.com",
      },
    });
    const request = out.request as Record<string, unknown>;
    expect(String(request.url)).not.toContain("?");
    expect(request.headers).toEqual({
      authorization: "[redacted]",
      "content-type": "application/json",
      cookie: "[redacted]",
    });
    expect(request.cookies).toBe("[redacted]");
    expect(request.query_string).toBe("[redacted]");
  });

  it("scrubs breadcrumbs in place", () => {
    const out = scrubEvent({
      breadcrumbs: [
        { category: "http", message: "GET /api/admin/users", data: { url: "https://x.test/a?token=abc" } },
        { category: "console", message: "user ada@example.com clicked" },
      ],
      extra: { payload: { phone: "+234800", ok: true } },
      tags: { attempt: "1" },
      contexts: { trace: { operation: "publish" } },
    });
    expect(out.breadcrumbs).toEqual([
      { category: "http", message: "GET /api/admin/users", data: { url: "https://x.test/a" } },
      { category: "console", message: "user [redacted] clicked" },
    ]);
    expect(out.extra).toEqual({ payload: { phone: "[redacted]", ok: true } });
    expect(out.tags).toEqual({ attempt: "1" });
    expect(out.contexts).toEqual({ trace: { operation: "publish" } });
  });

  it("keeps unknown fields untouched", () => {
    const out = scrubEvent({ event_id: "abc", level: "error", transaction: "/blog/[slug]" });
    expect(out).toEqual({ event_id: "abc", level: "error", transaction: "/blog/[slug]" });
  });
});

describe("scrubBreadcrumb", () => {
  it("redacts data urls and message emails", () => {
    const out = scrubBreadcrumb({
      category: "navigation",
      message: "went to ada@example.com",
      data: { from: "/faq?email=ada@example.com", to: "/blog" },
    });
    expect(out.message).toBe("went to [redacted]");
    expect(out.data).toEqual({ from: "/faq?email=[redacted]", to: "/blog" });
  });
});
