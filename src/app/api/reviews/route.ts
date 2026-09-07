import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isEligibleToReview, hasReviewed } from "@/lib/reviews";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to leave a review." }, { status: 401 });
  }

  const body: { productId?: string; rating?: number; body?: string | null } = await request.json();
  if (!body.productId || !body.rating || !Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
    return NextResponse.json({ error: "Please select a rating from 1 to 5." }, { status: 400 });
  }

  const [eligible, alreadyReviewed] = await Promise.all([
    isEligibleToReview(user.id, body.productId),
    hasReviewed(user.id, body.productId),
  ]);

  if (!eligible) {
    return NextResponse.json(
      { error: "You can only review products from a delivered order." },
      { status: 403 },
    );
  }
  if (alreadyReviewed) {
    return NextResponse.json({ error: "You've already reviewed this product." }, { status: 409 });
  }

  // Insert through the RLS-respecting client, not the service-role admin
  // client — the reviews table's insert policy independently re-derives
  // this same eligibility condition at the database level, which is the
  // real security boundary; the checks above exist only for a clear error
  // message before hitting it.
  const { error } = await supabase.from("reviews").insert({
    product_id: body.productId,
    user_id: user.id,
    rating: body.rating,
    body: body.body?.trim() || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
