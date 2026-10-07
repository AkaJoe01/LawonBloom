export interface MailTemplateMap {
  consultation_notification: {
    doctor: string;
    date: string;
    time: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    notes?: string;
  };
  account_lockout_alert: {
    email: string;
    lockoutCount: number;
    lockedUntilIso: string;
  };
  deploy_failure_alert: {
    environment: string;
    commit: string;
    reason: string;
  };
  blog_enquiry: {
    name: string;
    email: string;
    phone?: string;
    message: string;
    postSlug?: string;
  };
}

export type TemplateName = keyof MailTemplateMap;

export interface RenderedMail {
  subject: string;
  html: string;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function layout(title: string, body: string): string {
  return [
    "<!doctype html><html><body style=\"font-family:Georgia,serif;color:#1d1b20;line-height:1.6\">",
    `<h1 style="color:#8a4853;font-size:20px">${escapeHtml(title)}</h1>`,
    body,
    '<p style="color:#49454f;font-size:13px">Lawonbloom Fertility Centre — Where Hope Blossoms into Life.</p>',
    "</body></html>",
  ].join("");
}

function row(label: string, value: string): string {
  return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

export function renderTemplate<T extends TemplateName>(
  template: T,
  data: MailTemplateMap[T],
): RenderedMail {
  if (template === "consultation_notification") {
    const d = data as MailTemplateMap["consultation_notification"];
    return {
      subject: `New Consultation Booking - ${d.firstName} ${d.lastName}`,
      html: layout(
        "New Consultation Booking",
        [
          row("Name", `${d.firstName} ${d.lastName}`),
          row("Email", d.email),
          row("Phone", d.phone ?? "Not provided"),
          "<hr/>",
          row("Specialist", d.doctor),
          row("Date", d.date),
          row("Time", d.time),
          "<hr/>",
          row("Notes", d.notes ?? "None"),
        ].join(""),
      ),
    };
  }

  if (template === "account_lockout_alert") {
    const d = data as MailTemplateMap["account_lockout_alert"];
    return {
      subject: `Account lockout alert - ${d.email}`,
      html: layout(
        "Account Lockout Alert",
        [
          row("Account", d.email),
          row("Lockout count", String(d.lockoutCount)),
          row("Locked until", d.lockedUntilIso),
          "<p>Repeated failed sign-in attempts triggered a 10-minute lock. If this was not you, review the account immediately.</p>",
        ].join(""),
      ),
    };
  }

  if (template === "deploy_failure_alert") {
    const d = data as MailTemplateMap["deploy_failure_alert"];
    return {
      subject: `Deploy failure - ${d.environment}`,
      html: layout(
        "Deploy Failure",
        [
          row("Environment", d.environment),
          row("Commit", d.commit),
          row("Reason", d.reason),
        ].join(""),
      ),
    };
  }

  if (template === "blog_enquiry") {
    const d = data as MailTemplateMap["blog_enquiry"];
    return {
      subject: `New blog enquiry - ${d.name}`,
      html: layout(
        "New Blog Enquiry",
        [
          row("Name", d.name),
          row("Email", d.email),
          row("Phone", d.phone ?? "Not provided"),
          row("Post", d.postSlug ?? "Blog index"),
          "<hr/>",
          row("Message", d.message),
        ].join(""),
      ),
    };
  }

  const unknown: never = template;
  throw new Error(`Unknown mail template: ${String(unknown)}`);
}
