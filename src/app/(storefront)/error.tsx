"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

// Scoped to the (storefront) route group, so the shared layout (header/
// footer) stays mounted around it — unlike global-error.tsx, which only
// fires if the root layout itself throws and has to replace the whole
// <html>/<body>, so it can't reuse any shared chrome.
export default function StorefrontError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <AlertTriangle className="size-10 text-plum/40" strokeWidth={1.5} aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-body-l text-charcoal">Something went wrong.</p>
        <p className="text-body-m text-muted-foreground">
          Please try again, or come back in a moment.
        </p>
      </div>
      <Button onClick={reset} className="uppercase text-label tracking-wide">
        Try again
      </Button>
    </div>
  );
}
