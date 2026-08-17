import * as Sentry from "@sentry/nextjs";

// Empty DSN (see .env.example) keeps this a safe no-op until a real
// Sentry project exists — see docs/PRD.md s6.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
