import { describe, expect, it } from "vitest";
import { originRejection } from "../../lib/security/origin";

function request(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/x", { method: "POST", headers });
}

describe("originRejection", () => {
  it("passes when Origin matches Host", () => {
    const result = originRejection(request({ origin: "http://localhost", host: "localhost" }));
    expect(result).toBeNull();
  });

  it("passes with x-forwarded-host precedence (Vercel proxy)", () => {
    const result = originRejection(
      request({
        origin: "https://lawonbloomfertilitycentre.com",
        host: "web.internal",
        "x-forwarded-host": "lawonbloomfertilitycentre.com",
      }),
    );
    expect(result).toBeNull();
  });

  it("rejects a missing Origin header", async () => {
    const result = originRejection(request({ host: "localhost" }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
    expect((await result!.json()).error.code).toBe("forbidden_origin");
  });

  it("rejects an empty Origin header", async () => {
    const result = originRejection(request({ origin: "", host: "localhost" }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it("rejects a cross-origin request", async () => {
    const result = originRejection(request({ origin: "https://evil.example", host: "localhost" }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it("rejects a malformed Origin URL", async () => {
    const result = originRejection(request({ origin: "not a url", host: "localhost" }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it("rejects when no host header is present", async () => {
    const result = originRejection(request({ origin: "http://localhost" }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });
});
