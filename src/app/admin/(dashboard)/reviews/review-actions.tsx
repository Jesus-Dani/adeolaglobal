"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewStatus } from "@/lib/supabase/types";

export function ReviewActions({ reviewId, currentStatus }: { reviewId: string; currentStatus: ReviewStatus }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(status: ReviewStatus) {
    setSaving(true);
    setError(null);
    const response = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const body = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(body.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Approve"
        disabled={saving || currentStatus === "approved"}
        onClick={() => setStatus("approved")}
        className={cn(
          "hover:text-deep-plum disabled:cursor-not-allowed disabled:opacity-30",
          currentStatus === "approved" ? "text-emerald-600" : "text-muted-foreground",
        )}
      >
        <Check className="size-4" strokeWidth={1.5} />
      </button>
      <button
        type="button"
        aria-label="Reject"
        disabled={saving || currentStatus === "rejected"}
        onClick={() => setStatus("rejected")}
        className={cn(
          "hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30",
          currentStatus === "rejected" ? "text-destructive" : "text-muted-foreground",
        )}
      >
        <X className="size-4" strokeWidth={1.5} />
      </button>
      {error && <span className="text-body-s text-destructive">{error}</span>}
    </div>
  );
}
