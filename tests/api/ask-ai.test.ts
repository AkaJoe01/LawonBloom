import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { generateContent, checkRateLimit } = vi.hoisted(() => ({
  generateContent: vi.fn(),
  checkRateLimit: vi.fn(),
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent };
    }
  },
}));

vi.mock("@/lib/rate-limit", () => ({ checkRateLimit }));

import { POST } from "../../app/api/ask-ai/route";

function requestWith(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/ask-ai", {
    method: "POST",
    headers: {
      origin: "http://localhost",
      host: "localhost",
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.7",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ask-ai", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
    checkRateLimit.mockResolvedValue({ ok: true });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    vi.restoreAllMocks();
  });

  it("rejects a cross-origin request before touching the limiter", async () => {
    const response = await POST(requestWith({ question: "Hi" }, { origin: "https://evil.example" }));
    expect(response.status).toBe(403);
    const payload = await response.json();
    expect(payload.error.code).toBe("forbidden_origin");
    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("returns 429 when the IP rate limit is exhausted", async () => {
    checkRateLimit.mockResolvedValue({ ok: false });
    const response = await POST(requestWith({ question: "What is IVF?" }));
    expect(response.status).toBe(429);
    const payload = await response.json();
    expect(payload.success).toBe(false);
    expect(payload.error).toContain("Too many questions");
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("rate-limits per client IP under the ask-ai key", async () => {
    generateContent.mockResolvedValue({
      response: { text: () => "IVF is a fertility treatment." },
    });
    const response = await POST(requestWith({ question: "What is IVF?" }));
    expect(response.status).toBe(200);
    expect(checkRateLimit).toHaveBeenCalledWith(
      { key: "ask-ai:203.0.113.7", limit: 10, windowSeconds: 60, prefix: "public" },
      "open",
    );
  });

  it("returns 400 when the question is missing", async () => {
    const response = await POST(requestWith({}));
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe("Question is required");
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("returns 400 when the question is not a string", async () => {
    const response = await POST(requestWith({ question: 42 }));
    expect(response.status).toBe(400);
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("returns 500 when the AI key is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    const response = await POST(requestWith({ question: "What is IVF?" }));
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.error).toBe("AI not configured");
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("returns the model answer on success", async () => {
    generateContent.mockResolvedValue({
      response: { text: () => "IVF is a fertility treatment." },
    });
    const response = await POST(requestWith({ question: "What is IVF?" }));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({
      success: true,
      answer: "IVF is a fertility treatment.",
    });
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when the model call throws", async () => {
    generateContent.mockRejectedValue(new Error("quota exceeded"));
    const response = await POST(requestWith({ question: "Hello?" }));
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.error).toBe("quota exceeded");
  });

  it("maps a non-Error rejection to a generic message", async () => {
    generateContent.mockRejectedValue("boom");
    const response = await POST(requestWith({ question: "Hello?" }));
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.error).toBe("Unknown error");
  });
});
