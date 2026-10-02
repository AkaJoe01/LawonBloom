import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";
import { originRejection } from "@/lib/security/origin";
import { consultationSchema } from "@/lib/validation/consultation";

function fieldErrorsOf(error: { issues: { path: PropertyKey[]; message: string }[] }): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: Request) {
  const rejected = originRejection(request);
  if (rejected) return rejected;

  const ip = clientIp(request);
  const rate = await checkRateLimit(
    { key: `consultation:${ip}`, limit: 3, windowSeconds: 600, prefix: "public" },
    "open",
  );
  if (!rate.ok) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Too many requests. Please try again later." } },
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

  const parsed = consultationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "validation",
          message: "Invalid consultation request.",
          fieldErrors: fieldErrorsOf(parsed.error),
        },
      },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const result = await sendMail("consultation_notification", {
    doctor: input.doctor,
    date: input.date,
    time: input.time,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    notes: input.notes,
  });

  if (result.sent) {
    return NextResponse.json({ notified: true });
  }
  if (result.skipped) {
    return NextResponse.json({ notified: false });
  }
  return NextResponse.json(
    {
      error: {
        code: "mail_failed",
        message: "We could not send your request right now. Please try again or contact us directly.",
      },
    },
    { status: 500 },
  );
}
