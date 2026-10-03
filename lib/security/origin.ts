import { NextResponse } from "next/server";

export function originRejection(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) {
    return NextResponse.json({ error: { code: "forbidden_origin", message: "Origin check failed." } }, { status: 403 });
  }
  if (!origin) {
    return NextResponse.json({ error: { code: "forbidden_origin", message: "Origin check failed." } }, { status: 403 });
  }
  try {
    if (new URL(origin).host !== host) {
      return NextResponse.json({ error: { code: "forbidden_origin", message: "Origin check failed." } }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: { code: "forbidden_origin", message: "Origin check failed." } }, { status: 403 });
  }
  return null;
}
