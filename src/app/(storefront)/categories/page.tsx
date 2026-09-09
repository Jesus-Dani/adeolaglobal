import Image from "next/image";
import Link from "next/link";
import { getCategoriesWithActiveProducts } from "@/lib/products";
import { HairlineDivider } from "@/components/hairline-divider";

export const metadata = { title: "Categories | ADEOLA Global Ltd" };

export default async function CategoriesPage() {
  const categories = await getCategoriesWithActiveProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-display-l text-deep-plum">Shop by Category</h1>
      <HairlineDivider className="mt-4 max-w-40" />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className="group relative aspect-square overflow-hidden rounded-xl bg-soft-lilac"
          >
            {category.previewImage && (
              <Image
                src={category.previewImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-deep-plum/80 via-deep-plum/10 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-4 font-display text-display-m text-white">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
