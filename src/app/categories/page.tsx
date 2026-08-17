import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Droplet, Home, ShoppingBag, Palette, Gift, Gem, Smartphone, Sparkles } from "lucide-react";
import { getCategories } from "@/lib/products";
import { HairlineDivider } from "@/components/hairline-divider";

// No category photography exists yet — icons (matching the thin-outline
// system, UI-Design-Brief.md s6) stand in for photos rather than generating
// 8 more placeholder images.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "hair-care": Sparkles,
  skincare: Droplet,
  "home-care": Home,
  "crochet-accessories": ShoppingBag,
  "handmade-crafts": Palette,
  "gift-boxes": Gift,
  "resin-products": Gem,
  "digital-products": Smartphone,
};

export const metadata = { title: "Categories | ADEOLA Global Ltd" };

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-display-l text-deep-plum">Shop by Category</h1>
      <HairlineDivider className="mt-4 max-w-40" />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => {
          const Icon = CATEGORY_ICONS[category.slug] ?? Sparkles;
          return (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-soft-lilac p-6 text-center transition-shadow hover:shadow-md"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-white text-plum transition-transform group-hover:scale-105">
                <Icon strokeWidth={1.5} className="size-7" />
              </span>
              <span className="text-body-m text-charcoal">{category.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
