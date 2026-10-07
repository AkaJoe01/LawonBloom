import { Resend } from "resend";
import { z } from "zod";
import { logEvent } from "@/lib/observability/log";
import { renderTemplate, type MailTemplateMap, type TemplateName } from "./templates";

const mailEnvSchema = z
  .object({
    MAIL_ENABLED: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    MAIL_FROM: z.string().optional(),
    MAIL_TO: z.string().optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.MAIL_ENABLED) return;
    if (!value.MAIL_FROM) {
      ctx.addIssue({ code: "custom", path: ["MAIL_FROM"], message: "MAIL_FROM is required when mail is enabled" });
    }
    if (!value.MAIL_TO) {
      ctx.addIssue({ code: "custom", path: ["MAIL_TO"], message: "MAIL_TO is required when mail is enabled" });
    }
    if (!value.RESEND_API_KEY) {
      ctx.addIssue({
        code: "custom",
        path: ["RESEND_API_KEY"],
        message: "RESEND_API_KEY is required when mail is enabled",
      });
    }
  });

export type MailResult =
  | { sent: true; id?: string }
  | { sent: false; skipped?: true; error?: string };

export async function sendMail<T extends TemplateName>(
  template: T,
  data: MailTemplateMap[T],
  opts?: { rid?: string },
): Promise<MailResult> {
  const rendered = renderTemplate(template, data);
  const rid = opts?.rid;

  const parsed = mailEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const error = `mail env invalid: ${parsed.error.issues.map((issue) => issue.message).join("; ")}`;
    logEvent("mail_failed", { template, rid, err: error }, "error");
    return { sent: false, error };
  }
  const env = parsed.data;

  if (!env.MAIL_ENABLED) {
    return { sent: false, skipped: true };
  }

  const recipients = (env.MAIL_TO ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  const from = env.MAIL_FROM ?? "";
  const resend = new Resend(env.RESEND_API_KEY);

  try {
    const { data: result, error } = await resend.emails.send({
      from,
      to: recipients,
      subject: rendered.subject,
      html: rendered.html,
    });
    if (error) {
      logEvent("mail_failed", { template, rid, err: error.message }, "error");
      return { sent: false, error: error.message };
    }
    return { sent: true, id: result?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown mail error";
    logEvent("mail_failed", { template, rid, err: message }, "error");
    return { sent: false, error: message };
  }
}
