import * as Sentry from "@sentry/nextjs";
import type { Instrumentation } from "next";
import { scrubBreadcrumb, scrubEvent } from "@/lib/observability/sentry-scrub";

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.SENTRY_DSN) return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: 0.1,
    beforeSend: (event) => scrubEvent(event as unknown as Record<string, unknown>) as never,
    beforeBreadcrumb: (breadcrumb) =>
      scrubBreadcrumb(breadcrumb as unknown as Record<string, unknown>) as never,
  });
}

export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.SENTRY_DSN) return;
  Sentry.captureRequestError(error, request, context);
};
