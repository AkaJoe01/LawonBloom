import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendMessage, startChat, getGenerativeModel, checkRateLimit } = vi.hoisted(() => ({
  sendMessage: vi.fn(),
  startChat: vi.fn(),
  getGenerativeModel: vi.fn(),
  checkRateLimit: vi.fn(),
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel(config: unknown) {
      getGenerativeModel(config);
      return { startChat };
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
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function historyFrom(entries: { role: string; text: string }[]) {
  return entries;
}

describe("POST /api/ask-ai", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
    checkRateLimit.mockResolvedValue({ ok: true });
    startChat.mockReturnValue({ sendMessage });
    sendMessage.mockResolvedValue({
      response: { text: () => "IVF is a fertility treatment." },
    });
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
    expect(startChat).not.toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("returns 429 when the IP rate limit is exhausted", async () => {
    checkRateLimit.mockResolvedValue({ ok: false });
    const response = await POST(requestWith({ question: "What is IVF?" }));
    expect(response.status).toBe(429);
    const payload = await response.json();
    expect(payload.success).toBe(false);
    expect(payload.error).toContain("Too many questions");
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("returns 400 when the body is not valid JSON", async () => {
    const response = await POST(requestWith("not-json{"));
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toContain("valid JSON");
    expect(startChat).not.toHaveBeenCalled();
  });

  it("returns 400 when the question is missing", async () => {
    const response = await POST(requestWith({}));
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe("Question is required");
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("returns 400 when the question is not a string", async () => {
    const response = await POST(requestWith({ question: 42 }));
    expect(response.status).toBe(400);
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("returns 500 when the AI key is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    const response = await POST(requestWith({ question: "What is IVF?" }));
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.error).toBe("AI not configured");
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("configures the model with the concierge persona and bounded output", async () => {
    await POST(requestWith({ question: "What is IVF?" }));
    expect(getGenerativeModel).toHaveBeenCalledTimes(1);
    const config = getGenerativeModel.mock.calls[0]?.[0] as {
      systemInstruction: string;
      generationConfig: { temperature: number; maxOutputTokens: number };
    };
    expect(config.systemInstruction).toContain("AI Concierge of Lawonbloom");
    expect(config.systemInstruction).toContain("HOW TO HANDLE EACH KIND OF MESSAGE");
    expect(config.systemInstruction).toContain("Never invent doctors");
    expect(config.generationConfig.temperature).toBeGreaterThan(0);
    expect(config.generationConfig.maxOutputTokens).toBeLessThanOrEqual(500);
  });

  it("passes an empty history when none is sent", async () => {
    await POST(requestWith({ question: "What is IVF?" }));
    expect(startChat).toHaveBeenCalledWith({ history: [] });
    expect(sendMessage).toHaveBeenCalledWith("What is IVF?");
  });

  it("maps history roles, keeps only the last 12 entries, and trims long texts", async () => {
    const longText = "x".repeat(1000);
    const entries = historyFrom(
      Array.from({ length: 14 }, (_, i) => ({
        role: i % 2 === 0 ? "user" : "ai",
        text: i === 12 ? longText : `turn ${i}`,
      })),
    );
    const response = await POST(requestWith({ question: "tell me more", history: entries }));
    expect(response.status).toBe(200);
    const { history } = startChat.mock.calls[0]?.[0] as {
      history: { role: string; parts: { text: string }[] }[];
    };
    expect(history).toHaveLength(12);
    expect(history[0]?.role).toBe("user");
    expect(history[0]?.parts[0]?.text).toBe("turn 2");
    expect(history[1]?.role).toBe("model");
    expect(history[10]?.role).toBe("user");
    expect(history[10]?.parts[0]?.text).toBe(longText.slice(0, 600));
    for (const entry of history) {
      expect(["user", "model"]).toContain(entry.role);
      expect(entry.parts[0]?.text.length).toBeLessThanOrEqual(600);
    }
  });

  it("drops malformed history entries and ignores non-array history", async () => {
    const response = await POST(
      requestWith({
        question: "hello",
        history: [
          { role: "bot", text: "sneaky" },
          { role: "user", text: 42 },
          { role: "user", text: "   " },
          null,
          "string-entry",
          { role: "user", text: "real question" },
          { role: "ai", text: "real answer" },
        ],
      }),
    );
    expect(response.status).toBe(200);
    const { history } = startChat.mock.calls[0]?.[0] as {
      history: { role: string; parts: { text: string }[] }[];
    };
    expect(history).toEqual([
      { role: "user", parts: [{ text: "real question" }] },
      { role: "model", parts: [{ text: "real answer" }] },
    ]);

    vi.mocked(startChat).mockClear();
    await POST(requestWith({ question: "hello", history: "not-an-array" }));
    expect(startChat).toHaveBeenCalledWith({ history: [] });
  });

  it("returns the model answer on success", async () => {
    const response = await POST(requestWith({ question: "What is IVF?" }));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({
      success: true,
      answer: "IVF is a fertility treatment.",
    });
    expect(sendMessage).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when the model call throws", async () => {
    sendMessage.mockRejectedValue(new Error("quota exceeded"));
    const response = await POST(requestWith({ question: "Hello?" }));
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.error).toBe("quota exceeded");
  });

  it("maps a non-Error rejection to a generic message", async () => {
    sendMessage.mockRejectedValue("boom");
    const response = await POST(requestWith({ question: "Hello?" }));
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.error).toBe("Unknown error");
  });
});
