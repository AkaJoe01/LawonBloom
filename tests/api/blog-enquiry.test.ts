import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  enquiryCreate: vi.fn(),
  sendMail: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: mocks.checkRateLimit }));
vi.mock("@/lib/db", () => ({ getDb: () => ({ enquiry: { create: mocks.enquiryCreate } }) }));
vi.mock("@/lib/mail", () => ({ sendMail: mocks.sendMail }));

import { POST } from "../../app/api/blog-enquiry/route";

function request(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/blog-enquiry", {
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

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    name: "Ada Obi",
    email: "ada@example.com",
    phone: "+2348001112222",
    message: "I would like to know more about IVF success rates.",
    postSlug: "understanding-ivf",
    consent: true,
    website: "",
    startedAt: Date.now() - 5000,
    ...overrides,
  };
}

describe("POST /api/blog-enquiry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkRateLimit.mockResolvedValue({ ok: true });
    mocks.enquiryCreate.mockResolvedValue({ id: "enq_1" });
    mocks.sendMail.mockResolvedValue({ sent: true, id: "mail_1" });
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects a cross-origin request before touching the limiter", async () => {
    const requestNoOrigin = new Request("http://localhost/api/blog-enquiry", {
      method: "POST",
      headers: { host: "localhost", "content-type": "application/json" },
      body: JSON.stringify(validBody()),
    });
    const response = await POST(requestNoOrigin);
    expect(response.status).toBe(403);
    expect(mocks.checkRateLimit).not.toHaveBeenCalled();
  });

  it("returns 429 when the IP limit is exhausted", async () => {
    mocks.checkRateLimit.mockResolvedValueOnce({ ok: false });
    const response = await POST(request(validBody()));
    expect(response.status).toBe(429);
    expect(mocks.enquiryCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await POST(request("{not json"));
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("invalid_json");
  });

  it("returns 400 with field errors when consent is missing", async () => {
    const response = await POST(request(validBody({ consent: false })));
    expect(response.status).toBe(400);
    expect((await response.json()).error.fieldErrors.consent).toBeTruthy();
    expect(mocks.enquiryCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when the honeypot is filled", async () => {
    const response = await POST(request(validBody({ website: "spam.example.com" })));
    expect(response.status).toBe(400);
    expect((await response.json()).error.fieldErrors.website).toBeTruthy();
    expect(mocks.enquiryCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when the form is submitted faster than 2 seconds", async () => {
    const response = await POST(request(validBody({ startedAt: Date.now() })));
    expect(response.status).toBe(400);
    expect((await response.json()).error.fieldErrors.startedAt).toBeTruthy();
    expect(mocks.enquiryCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid email", async () => {
    const response = await POST(request(validBody({ email: "not-an-email" })));
    expect(response.status).toBe(400);
    expect((await response.json()).error.fieldErrors.email).toBeTruthy();
  });

  it("returns 429 when the per-email limit is exhausted", async () => {
    mocks.checkRateLimit
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false });
    const response = await POST(request(validBody()));
    expect(response.status).toBe(429);
    expect(mocks.enquiryCreate).not.toHaveBeenCalled();
  });

  it("returns an honest 500 when the enquiry cannot be stored", async () => {
    mocks.enquiryCreate.mockRejectedValue(new Error("db down"));
    const response = await POST(request(validBody()));
    expect(response.status).toBe(500);
    expect((await response.json()).error.code).toBe("server_error");
    expect(vi.mocked(console.error)).toHaveBeenCalled();
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it("stores the enquiry with server-derived consent and returns notified:true when mail sends", async () => {
    const response = await POST(request(validBody()));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ received: true, notified: true });

    const data = mocks.enquiryCreate.mock.calls[0][0].data;
    expect(data).toMatchObject({
      name: "Ada Obi",
      email: "ada@example.com",
      postSlug: "understanding-ivf",
      consentVersion: "v2",
    });
    expect(data.consentAt).toBeInstanceOf(Date);
    expect(mocks.sendMail).toHaveBeenCalledWith(
      "blog_enquiry",
      {
        name: "Ada Obi",
        email: "ada@example.com",
        phone: "+2348001112222",
        message: "I would like to know more about IVF success rates.",
        postSlug: "understanding-ivf",
      },
      { rid: undefined },
    );
  });

  it("returns notified:false (degraded mode) when mail is disabled", async () => {
    mocks.sendMail.mockResolvedValue({ sent: false, skipped: true });
    const response = await POST(request(validBody()));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ received: true, notified: false });
    expect(vi.mocked(console.info)).toHaveBeenCalledWith(expect.stringContaining('"evt":"enquiry_created"'));
  });

  it("returns mailFailed when the store succeeds but the notification fails", async () => {
    mocks.sendMail.mockResolvedValue({ sent: false, error: "resend down" });
    const response = await POST(request(validBody()));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ received: true, notified: false, mailFailed: true });
    expect(vi.mocked(console.info)).toHaveBeenCalledWith(expect.stringContaining('"evt":"enquiry_partial"'));
  });

  it("never logs enquiry PII", async () => {
    mocks.sendMail.mockResolvedValue({ sent: false, skipped: true });
    await POST(request(validBody()));
    const logged = vi.mocked(console.info).mock.calls.map((call) => String(call[0])).join("\n");
    expect(logged).toContain("enquiry_created");
    expect(logged).not.toContain("ada@example.com");
    expect(logged).not.toContain("IVF success rates");
    expect(logged).not.toContain("Ada Obi");
  });

  it("checks the IP limit before parsing and the email limit after", async () => {
    await POST(request(validBody()));
    expect(mocks.checkRateLimit).toHaveBeenCalledTimes(2);
    expect(mocks.checkRateLimit.mock.calls[0][0]).toMatchObject({
      key: "blog-enquiry:203.0.113.7",
      limit: 3,
      windowSeconds: 600,
      prefix: "public",
    });
    expect(mocks.checkRateLimit.mock.calls[1][0]).toMatchObject({
      key: "blog-enquiry:ada@example.com",
      limit: 5,
      windowSeconds: 86400,
    });
    expect(mocks.checkRateLimit.mock.calls[0][1]).toBe("open");
  });
});
