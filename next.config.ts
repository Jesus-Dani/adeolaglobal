import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  silent: true,
  // No org/project/authToken yet — source map upload stays disabled
  // until a real Sentry project exists (docs/PRD.md s6). Error capture
  // itself doesn't need this; it only affects readable stack traces.
  telemetry: false,
});
