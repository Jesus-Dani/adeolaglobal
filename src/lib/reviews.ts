import { createAdminClient } from "@/lib/supabase/server";

/**
 * Verified-purchase check: does this user have a delivered order containing
 * any variant of this product? Uses the service-role client purely for a
 * simpler, single-shot read (no RLS edge cases to reason about) — this is
 * only used for UX (deciding whether to show the form, and to reject early
 * with a clear message); the actual security boundary is the reviews table's
 * RLS insert policy, which re-derives the same condition independently.
 *
 * Two simple queries chained in application code rather than a multi-level
 * embed, matching the established pattern in src/lib/admin/analytics.ts —
 * multi-level embeds are fragile with this project's hand-written Database
 * types even with Relationships declared.
 */
export async function isEligibleToReview(userId: string, productId: string): Promise<boolean> {
  const admin = createAdminClient();

  const { data: orders, error: ordersError } = await admin
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "delivered");
  if (ordersError) throw ordersError;
  if (!orders || orders.length === 0) return false;

  const orderIds = orders.map((o) => o.id);
  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select("variant_id")
    .in("order_id", orderIds);
  if (itemsError) throw itemsError;
  if (!items || items.length === 0) return false;

  const variantIds = [...new Set(items.map((i) => i.variant_id))];
  const { data: variants, error: variantsError } = await admin
    .from("product_variants")
    .select("id")
    .in("id", variantIds)
    .eq("product_id", productId)
    .limit(1);
  if (variantsError) throw variantsError;

  return (variants ?? []).length > 0;
}

export async function hasReviewed(userId: string, productId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

export interface ReviewWithAuthorName {
  id: string;
  rating: number;
  body: string | null;
  createdAt: string;
  authorName: string;
}

export interface ApprovedReviews {
  reviews: ReviewWithAuthorName[];
  averageRating: number;
  count: number;
}

/**
 * Approved reviews are publicly readable content, but reviewer profiles are
 * not (RLS on `profiles` only lets a user read their own row) — so author
 * display names are resolved server-side via the service-role client and
 * only the name (or a generic fallback) is exposed, never anything else
 * from the profile.
 */
export async function getApprovedReviews(productId: string): Promise<ApprovedReviews> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("reviews")
    .select("id, user_id, rating, body, created_at")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows = data ?? [];
  if (rows.length === 0) return { reviews: [], averageRating: 0, count: 0 };

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, name")
    .in("id", userIds);
  if (profilesError) throw profilesError;
  const nameByUserId = new Map((profiles ?? []).map((p) => [p.id, p.name]));

  const reviews: ReviewWithAuthorName[] = rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    body: r.body,
    createdAt: r.created_at,
    authorName: nameByUserId.get(r.user_id) ?? "Verified buyer",
  }));

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return { reviews, averageRating, count: reviews.length };
}
