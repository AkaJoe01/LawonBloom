import { NextResponse } from "next/server";

export function apiError(
  status: number,
  code: string,
  message: string,
  extra?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json({ error: { code, message, ...extra } }, { status });
}
