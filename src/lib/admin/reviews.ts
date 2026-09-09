import { createAdminClient } from "@/lib/supabase/server";
import type { ReviewStatus } from "@/lib/supabase/types";
import { REVIEW_STATUSES } from "@/lib/admin/review-status";

export { REVIEW_STATUSES };

export interface AdminReviewRow {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  body: string | null;
  status: ReviewStatus;
  createdAt: string;
}

export async function listReviews(filters: { status?: ReviewStatus }): Promise<AdminReviewRow[]> {
  const admin = createAdminClient();

  let query = admin
    .from("reviews")
    .select("id, product_id, user_id, rating, body, status, created_at")
    .order("created_at", { ascending: false });
  if (filters.status) query = query.eq("status", filters.status);

  const { data: reviews, error } = await query;
  if (error) throw error;
  if (!reviews || reviews.length === 0) return [];

  const productIds = [...new Set(reviews.map((r) => r.product_id))];
  const { data: products, error: productsError } = await admin
    .from("products")
    .select("id, name")
    .in("id", productIds);
  if (productsError) throw productsError;
  const productNameById = new Map((products ?? []).map((p) => [p.id, p.name]));

  const userIds = [...new Set(reviews.map((r) => r.user_id))];
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, name")
    .in("id", userIds);
  if (profilesError) throw profilesError;
  const customerNameById = new Map((profiles ?? []).map((p) => [p.id, p.name]));

  return reviews.map((r) => ({
    id: r.id,
    productId: r.product_id,
    productName: productNameById.get(r.product_id) ?? "-",
    customerName: customerNameById.get(r.user_id) ?? "-",
    rating: r.rating,
    body: r.body,
    status: r.status,
    createdAt: r.created_at,
  }));
}
