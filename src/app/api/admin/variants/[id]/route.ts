import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body: { stockCount?: number; lowStockThreshold?: number } = await request.json();

  if (body.stockCount !== undefined && (!Number.isInteger(body.stockCount) || body.stockCount < 0)) {
    return NextResponse.json({ error: "stockCount must be a non-negative integer" }, { status: 400 });
  }
  if (
    body.lowStockThreshold !== undefined &&
    (!Number.isInteger(body.lowStockThreshold) || body.lowStockThreshold < 0)
  ) {
    return NextResponse.json({ error: "lowStockThreshold must be a non-negative integer" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_variants")
    .update({
      ...(body.stockCount !== undefined ? { stock_count: body.stockCount } : {}),
      ...(body.lowStockThreshold !== undefined ? { low_stock_threshold: body.lowStockThreshold } : {}),
    })
    .eq("id", id)
    .select("id, stock_count, low_stock_threshold")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ variant: data });
}
