import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { createClient } from "@/lib/supabase/server";
import { trackEvent } from "@/lib/analytics/track";
import { HairlineDivider } from "@/components/hairline-divider";
import { ProductGallery } from "./product-gallery";
import { PdpPurchasePanel } from "./pdp-purchase-panel";
import { ProductReviews } from "./product-reviews";

interface PdpPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PdpPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} | ADEOLA Global Ltd`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: PdpPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await trackEvent(supabase, user?.id, { eventType: "product_view", productId: product.id });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          <h1 className="font-display text-display-m text-deep-plum">{product.name}</h1>
          <div className="mt-6">
            <PdpPurchasePanel product={product} />
          </div>
        </div>
      </div>

      {product.description && (
        <div className="mt-12 max-w-2xl">
          <h2 className="font-display text-display-m text-deep-plum">Description</h2>
          <HairlineDivider className="mt-3 max-w-32" />
          <p className="mt-4 text-body-l text-charcoal">{product.description}</p>
        </div>
      )}

      <div className="mt-12 max-w-2xl border-t border-border pt-8">
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
}
