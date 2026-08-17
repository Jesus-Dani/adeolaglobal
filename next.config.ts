import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Serwist needs the Webpack build graph to inject the precache manifest —
  // package.json's build script runs `next build --webpack` for this reason.
  // Disabled in dev: HMR would fight the SW's caching.
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(
  withSentryConfig(nextConfig, {
    silent: true,
    // No org/project/authToken yet — source map upload stays disabled
    // until a real Sentry project exists (docs/PRD.md s6). Error capture
    // itself doesn't need this; it only affects readable stack traces.
    telemetry: false,
  }),
);
