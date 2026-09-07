import type { ReviewStatus } from "@/lib/supabase/types";

export const REVIEW_STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};
