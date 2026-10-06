import * as Sentry from "@sentry/nextjs";
import { scrubBreadcrumb, scrubEvent } from "@/lib/observability/sentry-scrub";

try {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (dsn) {
    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
      tracesSampleRate: 0.1,
      beforeSend: (event) => scrubEvent(event as unknown as Record<string, unknown>) as never,
      beforeBreadcrumb: (breadcrumb) =>
        scrubBreadcrumb(breadcrumb as unknown as Record<string, unknown>) as never,
    });
  }
} catch {
  // monitoring must never break the app
}
