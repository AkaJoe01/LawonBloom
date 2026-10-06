import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { buildCspHeader, proxy } from "../proxy";

function req(path: string, cookie?: string): NextRequest {
  const headers = new Headers();
  if (cookie) headers.set("cookie", cookie);
  return new NextRequest(new URL(path, "http://localhost:3123"), { headers });
}

describe("buildCspHeader", () => {
  it("emits every plan directive with the nonce", () => {
    const csp = buildCspHeader("abc123");
    for (const directive of [
      "default-src 'self'",
      "script-src 'self' 'nonce-abc123' 'strict-dynamic'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
      "connect-src 'self' https://*.upstash.io https://*.ingest.sentry.io",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ]) {
      expect(csp).toContain(directive);
    }
    expect(csp).not.toContain("unsafe-eval");
  });
});

describe("proxy", () => {
  it("sets matching nonce on request and response with full CSP", () => {
    const response = proxy(req("/blog"));
    const csp = response.headers.get("Content-Security-Policy");
    const nonce = response.headers.get("x-middleware-request-x-nonce") ?? "";
    expect(nonce).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(csp).toContain(`'nonce-${nonce}'`);
    expect(csp).toContain("strict-dynamic");
  });

  it("redirects cookie-less /admin pages to login", () => {
    const response = proxy(req("/admin/posts"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/admin/login");
  });

  it("passes /admin through when a session cookie is present", () => {
    const response = proxy(req("/admin/posts", "authjs.session-token=tok"));
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Security-Policy")).toContain("script-src");
  });

  it("passes /admin/posts with the secure cookie variant", () => {
    const response = proxy(req("/admin", "__Secure-authjs.session-token=tok"));
    expect(response.status).toBe(200);
  });

  it("never gates the public login and 2FA pages", () => {
    expect(proxy(req("/admin/login")).status).toBe(200);
    expect(proxy(req("/admin/onboarding/2fa")).status).toBe(200);
  });

  it("never gates non-admin paths", () => {
    expect(proxy(req("/")).status).toBe(200);
    expect(proxy(req("/blog")).status).toBe(200);
  });
});
