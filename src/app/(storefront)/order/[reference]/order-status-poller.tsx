"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 20; // ~50s — comfortably longer than webhook delivery usually takes.

/**
 * Payment confirmation happens via a Paystack webhook, not the checkout
 * redirect itself, so the order can still legitimately be "pending" for a
 * few seconds after landing here. Polls the lightweight status endpoint and
 * triggers a server refetch (router.refresh) the moment it resolves, rather
 * than making the customer manually reload.
 */
export function OrderStatusPoller({ reference }: { reference: string }) {
  const router = useRouter();
  const pollsRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      pollsRef.current += 1;
      if (pollsRef.current > MAX_POLLS) {
        clearInterval(interval);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${reference}/status`);
        if (!response.ok) return;
        const { status } = await response.json();
        if (status !== "pending") {
          clearInterval(interval);
          router.refresh();
        }
      } catch {
        // Transient network hiccup — just try again on the next tick.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [reference, router]);

  return null;
}
