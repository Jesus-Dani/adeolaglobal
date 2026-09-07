import { cn } from "@/lib/utils";
import { REVIEW_STATUS_LABELS } from "@/lib/admin/review-status";
import type { ReviewStatus } from "@/lib/supabase/types";

const STATUS_STYLES: Record<ReviewStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-destructive/10 text-destructive",
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-body-s font-medium",
        STATUS_STYLES[status],
      )}
    >
      {REVIEW_STATUS_LABELS[status]}
    </span>
  );
}
