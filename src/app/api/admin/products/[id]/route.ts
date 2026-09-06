import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/server";
import { syncProductVariants, type ProductInput } from "@/lib/admin/products";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body: ProductInput = await request.json();

  const admin = createAdminClient();

  const { error: productError } = await admin
    .from("products")
    .update({
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      category_id: body.categoryId,
      base_price: body.basePrice,
      cost_price: body.costPrice ?? null,
      status: body.status,
      is_bestseller: body.isBestseller ?? false,
      is_new: body.isNew ?? false,
      images: body.images,
    })
    .eq("id", id);

  if (productError) return NextResponse.json({ error: productError.message }, { status: 500 });

  const { error: variantsError } = await syncProductVariants(admin, id, body.variants ?? []);
  if (variantsError) return NextResponse.json({ error: variantsError }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const admin = createAdminClient();

  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
