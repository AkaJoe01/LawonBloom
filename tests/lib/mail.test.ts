import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

import { sendMail } from "../../lib/mail";

const MAIL_ENV_KEYS = ["MAIL_ENABLED", "MAIL_FROM", "MAIL_TO", "RESEND_API_KEY"] as const;

function clearMailEnv() {
  for (const key of MAIL_ENV_KEYS) delete process.env[key];
}

describe("sendMail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMailEnv();
  });

  afterEach(() => {
    clearMailEnv();
  });

  it("skips silently when mail is disabled (default)", async () => {
    const result = await sendMail("deploy_failure_alert", {
      environment: "preview",
      commit: "abc",
      reason: "test",
    });
    expect(result).toEqual({ sent: false, skipped: true });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns an error when mail is enabled but env is incomplete", async () => {
    process.env.MAIL_ENABLED = "true";
    const result = await sendMail("deploy_failure_alert", {
      environment: "preview",
      commit: "abc",
      reason: "test",
    });
    expect(result.sent).toBe(false);
    if (!result.sent) {
      expect(result.error).toContain("MAIL_FROM");
      expect(result.error).toContain("RESEND_API_KEY");
    }
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("sends via Resend to the MAIL_TO allowlist", async () => {
    process.env.MAIL_ENABLED = "true";
    process.env.MAIL_FROM = "clinic@lawonbloom.test";
    process.env.MAIL_TO = "a@clinic.test, b@clinic.test";
    process.env.RESEND_API_KEY = "re_test_key";
    sendMock.mockResolvedValue({ data: { id: "mail_123" }, error: null });

    const result = await sendMail("account_lockout_alert", {
      email: "admin@clinic.test",
      lockoutCount: 3,
      lockedUntilIso: "2026-10-01T12:00:00.000Z",
    });

    expect(result).toEqual({ sent: true, id: "mail_123" });
    expect(sendMock).toHaveBeenCalledTimes(1);
    const payload = sendMock.mock.calls[0][0];
    expect(payload.from).toBe("clinic@lawonbloom.test");
    expect(payload.to).toEqual(["a@clinic.test", "b@clinic.test"]);
    expect(payload.subject).toContain("Account lockout alert");
    expect(payload.html).toContain("admin@clinic.test");
  });

  it("returns sent=false when Resend reports an error", async () => {
    process.env.MAIL_ENABLED = "true";
    process.env.MAIL_FROM = "clinic@lawonbloom.test";
    process.env.MAIL_TO = "a@clinic.test";
    process.env.RESEND_API_KEY = "re_test_key";
    sendMock.mockResolvedValue({ data: null, error: { message: "rate limited" } });

    const result = await sendMail("deploy_failure_alert", {
      environment: "production",
      commit: "def",
      reason: "boom",
    });
    expect(result).toEqual({ sent: false, error: "rate limited" });
  });

  it("returns sent=false when the send call throws", async () => {
    process.env.MAIL_ENABLED = "true";
    process.env.MAIL_FROM = "clinic@lawonbloom.test";
    process.env.MAIL_TO = "a@clinic.test";
    process.env.RESEND_API_KEY = "re_test_key";
    sendMock.mockRejectedValue(new Error("network down"));

    const result = await sendMail("deploy_failure_alert", {
      environment: "production",
      commit: "def",
      reason: "boom",
    });
    expect(result).toEqual({ sent: false, error: "network down" });
  });

  it("maps non-Error rejections to a generic message", async () => {
    process.env.MAIL_ENABLED = "true";
    process.env.MAIL_FROM = "clinic@lawonbloom.test";
    process.env.MAIL_TO = "a@clinic.test";
    process.env.RESEND_API_KEY = "re_test_key";
    sendMock.mockRejectedValue("boom");

    const result = await sendMail("deploy_failure_alert", {
      environment: "production",
      commit: "def",
      reason: "boom",
    });
    expect(result).toEqual({ sent: false, error: "Unknown mail error" });
  });
});
