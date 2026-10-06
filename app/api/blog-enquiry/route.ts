import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { logEvent, ridOf } from "@/lib/observability/log";
import { checkRateLimit } from "@/lib/rate-limit";
import { originRejection } from "@/lib/security/origin";
import { enquiryInput } from "@/lib/validation/blog";
import { zodFieldErrors } from "@/lib/validation/common";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: Request) {
  const rejected = originRejection(request);
  if (rejected) return rejected;
  const rid = ridOf(request) ?? undefined;

  const ip = clientIp(request);
  const ipRate = await checkRateLimit(
    { key: `blog-enquiry:${ip}`, limit: 3, windowSeconds: 600, prefix: "public" },
    "open",
  );
  if (!ipRate.ok) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Too many enquiries from this network. Please try again later." } },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_json", message: "Request body must be valid JSON." } },
      { status: 400 },
    );
  }

  const parsed = enquiryInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "validation",
          message: "Please correct the highlighted fields.",
          fieldErrors: zodFieldErrors(parsed.error),
        },
      },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const emailRate = await checkRateLimit(
    { key: `blog-enquiry:${input.email.toLowerCase()}`, limit: 5, windowSeconds: 86400, prefix: "public" },
    "open",
  );
  if (!emailRate.ok) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Too many enquiries from this email. Please try again tomorrow." } },
      { status: 429 },
    );
  }

  let createdId: string;
  try {
    const created = await getDb().enquiry.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        message: input.message,
        postSlug: input.postSlug ?? null,
        consentAt: input.consentAt,
        consentVersion: input.consentVersion,
      },
      select: { id: true },
    });
    createdId = created.id;
  } catch (error) {
    logEvent(
      "enquiry_store_failed",
      { rid, reason: error instanceof Error ? error.message : "unknown" },
      "error",
    );
    return NextResponse.json(
      { error: { code: "server_error", message: "We could not receive your enquiry right now. Please try again." } },
      { status: 500 },
    );
  }

  const mail = await sendMail(
    "blog_enquiry",
    {
      name: input.name,
      email: input.email,
      phone: input.phone ?? undefined,
      message: input.message,
      postSlug: input.postSlug ?? undefined,
    },
    { rid },
  );

  const notified = mail.sent;
  const mailFailed = !mail.sent && !mail.skipped;

  if (mailFailed) {
    logEvent("enquiry_partial", { rid, id: createdId });
  } else {
    logEvent("enquiry_created", { rid, id: createdId, notified });
  }

  return NextResponse.json(
    mailFailed ? { received: true, notified: false, mailFailed: true } : { received: true, notified },
    { status: 201 },
  );
}
