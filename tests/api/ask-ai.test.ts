import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { generateContent } = vi.hoisted(() => ({
  generateContent: vi.fn(),
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent };
    }
  },
}));

import { POST } from "../../app/api/ask-ai/route";

function requestWith(body: unknown): Request {
  return new Request("http://localhost/api/ask-ai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ask-ai", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    vi.restoreAllMocks();
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
