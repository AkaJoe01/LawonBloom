import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { verify, sendMail } = vi.hoisted(() => ({
  verify: vi.fn(),
  sendMail: vi.fn(),
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({ verify, sendMail })),
  },
}));

import { POST } from "../../app/api/send-consultation/route";

function requestWith(body: unknown): Request {
  return new Request("http://localhost/api/send-consultation", {
    method: "POST",
    headers: { "content-type": "application/json" },
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

function setSmtpEnv() {
  process.env.SMTP_HOST = "smtp.test";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_USER = "user@test";
  process.env.SMTP_PASS = "pass";
  process.env.SMTP_FROM = "clinic@test";
  process.env.SMTP_RECIPIENT = "inbox@test";
}

function clearSmtpEnv() {
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  delete process.env.SMTP_FROM;
  delete process.env.SMTP_RECIPIENT;
}

describe("POST /api/send-consultation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSmtpEnv();
    verify.mockResolvedValue(true);
    sendMail.mockResolvedValue({ accepted: [] });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    clearSmtpEnv();
    vi.restoreAllMocks();
  });

  it("returns 500 when SMTP credentials are missing", async () => {
    clearSmtpEnv();
    const response = await POST(requestWith(validBody));
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.error).toBe("SMTP credentials not configured");
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(
      requestWith({ ...validBody, firstName: "", email: "" }),
    );
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe("Missing required fields");
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("sends clinic and user mail and reports success", async () => {
    const response = await POST(requestWith(validBody));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({
      success: true,
      clinicNotified: true,
      userNotified: true,
    });
    expect(sendMail).toHaveBeenCalledTimes(2);
    const [clinic, user] = sendMail.mock.calls.map((call) => call[0]);
    expect(clinic.to).toBe("inbox@test");
    expect(user.to).toBe("ada@example.com");
  });

  it("reports success with clinicNotified=false when only the clinic send fails", async () => {
    sendMail
      .mockRejectedValueOnce(new Error("clinic down"))
      .mockResolvedValueOnce({ accepted: [] });
    const response = await POST(requestWith(validBody));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({
      success: true,
      clinicNotified: false,
      userNotified: true,
    });
  });

  it("returns 500 when both sends fail", async () => {
    sendMail.mockRejectedValue(new Error("smtp rejected"));
    const response = await POST(requestWith(validBody));
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.success).toBe(false);
    expect(payload.error).toContain("smtp rejected");
  });

  it("returns 500 when transport verification fails", async () => {
    verify.mockRejectedValue(new Error("verify failed"));
    const response = await POST(requestWith(validBody));
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.error).toBe("verify failed");
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("returns 500 on malformed JSON", async () => {
    const response = await POST(requestWith("{not json"));
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.success).toBe(false);
  });

  it("falls back to SMTP_USER when SMTP_RECIPIENT is unset", async () => {
    delete process.env.SMTP_RECIPIENT;
    const response = await POST(requestWith(validBody));
    expect(response.status).toBe(200);
    const clinic = sendMail.mock.calls[0][0];
    expect(clinic.to).toBe("user@test");
  });

  it("reports success with userNotified=false when only the user send fails", async () => {
    sendMail
      .mockResolvedValueOnce({ accepted: [] })
      .mockRejectedValueOnce(new Error("user mailbox full"));
    const response = await POST(requestWith(validBody));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({
      success: true,
      clinicNotified: true,
      userNotified: false,
    });
  });

  it("maps a non-Error rejection to a generic message", async () => {
    sendMail.mockRejectedValue("boom");
    const response = await POST(requestWith(validBody));
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.error).toBe("Clinic: boom | User: boom");
  });
});
