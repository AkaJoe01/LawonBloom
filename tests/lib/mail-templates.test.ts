import { describe, expect, it } from "vitest";
import { escapeHtml, renderTemplate } from "../../lib/mail/templates";

describe("mail templates", () => {
  it("renders consultation_notification with booking details", () => {
    const rendered = renderTemplate("consultation_notification", {
      doctor: "Dr. Saanu",
      date: "2026-10-05",
      time: "10:00",
      firstName: "Ada",
      lastName: "Obi",
      email: "ada@example.com",
      phone: "+2348000000000",
      notes: "First visit",
    });
    expect(rendered.subject).toBe("New Consultation Booking - Ada Obi");
    expect(rendered.html).toContain("Dr. Saanu");
    expect(rendered.html).toContain("ada@example.com");
    expect(rendered.html).toContain("First visit");
  });

  it("renders consultation_notification with safe defaults for optional fields", () => {
    const rendered = renderTemplate("consultation_notification", {
      doctor: "Dr. Saanu",
      date: "2026-10-05",
      time: "10:00",
      firstName: "Ada",
      lastName: "Obi",
      email: "ada@example.com",
    });
    expect(rendered.html).toContain("Not provided");
    expect(rendered.html).toContain("None");
  });

  it("renders account_lockout_alert with lockout details", () => {
    const rendered = renderTemplate("account_lockout_alert", {
      email: "admin@clinic.test",
      lockoutCount: 3,
      lockedUntilIso: "2026-10-01T12:00:00.000Z",
    });
    expect(rendered.subject).toBe("Account lockout alert - admin@clinic.test");
    expect(rendered.html).toContain("Account Lockout Alert");
    expect(rendered.html).toContain("2026-10-01T12:00:00.000Z");
    expect(rendered.html).toContain("Lockout count");
  });

  it("renders deploy_failure_alert with environment details", () => {
    const rendered = renderTemplate("deploy_failure_alert", {
      environment: "preview",
      commit: "abc1234",
      reason: "migration failed",
    });
    expect(rendered.subject).toBe("Deploy failure - preview");
    expect(rendered.html).toContain("abc1234");
    expect(rendered.html).toContain("migration failed");
  });

  it("escapes user-controlled values in the HTML body", () => {
    const rendered = renderTemplate("consultation_notification", {
      doctor: "Dr. Saanu",
      date: "2026-10-05",
      time: "10:00",
      firstName: '<script>alert("x")</script>',
      lastName: "Obi",
      email: "ada@example.com",
      notes: "<img src=x onerror=alert(1)>",
    });
    expect(rendered.html).not.toContain("<script>");
    expect(rendered.html).not.toContain("<img");
    expect(rendered.html).toContain("&lt;script&gt;");
    expect(rendered.html).toContain("&lt;img");
  });

  it("escapeHtml covers the full entity set", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });

  it("throws on an unknown template", () => {
    expect(() =>
      renderTemplate("nope" as "consultation_notification", {} as never),
    ).toThrow(/Unknown mail template/);
  });
});
