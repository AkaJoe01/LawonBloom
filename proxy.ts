import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAMES = ["authjs.session-token", "__Secure-authjs.session-token"];

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/onboarding/2fa"]);

export function buildCspHeader(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
    "connect-src 'self' https://*.upstash.io https://*.ingest.sentry.io",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  return directives.join("; ");
}

function needsAdminGate(pathname: string): boolean {
  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) return false;
  if (PUBLIC_ADMIN_PATHS.has(pathname)) return false;
  return true;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (needsAdminGate(pathname)) {
    const hasSession = SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));
    if (!hasSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCspHeader(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
