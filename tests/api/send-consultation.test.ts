import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { checkRateLimit, sendMail } = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  sendMail: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit,
}));

vi.mock("@/lib/mail", () => ({
  sendMail,
}));

import { POST } from "../../app/api/send-consultation/route";

function requestWith(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/send-consultation", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
      host: "localhost",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const validBody = {
  doctor: "Dr. Saanu",
  date: "2026-10-05",
  time: "10:00",
  firstName: "Ada",
  lastName: "Obi",
  email: "ada@example.com",
  phone: "+2348000000000",
  notes: "First visit",
};

describe("POST /api/send-consultation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkRateLimit.mockResolvedValue({ ok: true });
    sendMail.mockResolvedValue({ sent: true, id: "mail_1" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects requests without an Origin header", async () => {
    const response = await POST(requestWith(validBody, { origin: "" }));
    expect(response.status).toBe(403);
    const payload = await response.json();
    expect(payload.error.code).toBe("forbidden_origin");
    expect(sendMail).not.toHaveBeenCalled();
    expect(checkRateLimit).not.toHaveBeenCalled();
  });

  it("rejects requests whose Origin does not match Host", async () => {
    const response = await POST(requestWith(validBody, { origin: "https://evil.example" }));
    expect(response.status).toBe(403);
    const payload = await response.json();
    expect(payload.error.code).toBe("forbidden_origin");
  });

  it("returns 429 when the rate gate blocks the request", async () => {
    checkRateLimit.mockResolvedValue({ ok: false });
    const response = await POST(requestWith(validBody));
    expect(response.status).toBe(429);
    const payload = await response.json();
    expect(payload.error.code).toBe("rate_limited");
    expect(sendMail).not.toHaveBeenCalled();
    expect(checkRateLimit).toHaveBeenCalledWith(
      { key: "consultation:unknown", limit: 3, windowSeconds: 600, prefix: "public" },
      "open",
    );
  });

  it("returns 400 on malformed JSON", async () => {
    const response = await POST(requestWith("{not json"));
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error.code).toBe("invalid_json");
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("returns 400 with fieldErrors when required fields are missing", async () => {
    const response = await POST(requestWith({ ...validBody, firstName: "", email: "" }));
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error.code).toBe("validation");
    expect(payload.error.fieldErrors.firstName).toBeTruthy();
    expect(payload.error.fieldErrors.email).toBeTruthy();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("notifies the clinic and returns notified=true", async () => {
    const response = await POST(requestWith(validBody));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({ notified: true });
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith("consultation_notification", {
      doctor: "Dr. Saanu",
      date: "2026-10-05",
      time: "10:00",
      firstName: "Ada",
      lastName: "Obi",
      email: "ada@example.com",
      phone: "+2348000000000",
      notes: "First visit",
    });
  });

  it("returns notified=false when mail is disabled (skipped)", async () => {
    sendMail.mockResolvedValue({ sent: false, skipped: true });
    const response = await POST(requestWith(validBody));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({ notified: false });
  });

  it("returns 500 mail_failed when sending fails", async () => {
    sendMail.mockResolvedValue({ sent: false, error: "resend down" });
    const response = await POST(requestWith(validBody));
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.error.code).toBe("mail_failed");
  });
});
