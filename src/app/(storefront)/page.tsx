import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HairlineDivider } from "@/components/hairline-divider";
import { ProductCard } from "@/components/product-card";
import { getCategoriesWithActiveProducts, getProducts } from "@/lib/products";

export default async function Home() {
  const [categories, products] = await Promise.all([
    getCategoriesWithActiveProducts(),
    getProducts({ sort: "featured" }),
  ]);
  const featuredProducts = products.slice(0, 8);

  return (
    <>
      <section className="relative overflow-hidden bg-soft-lilac lg:min-h-[calc(100vh_-_100px)]">
        <div className="relative h-[60vh] lg:absolute lg:inset-0 lg:h-auto">
          <Image
            src="/images/hero-banner.jpg"
            alt="A woman smiling outdoors next to ADEOLA Global's Rosemary Hair Growth Oil bottles"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="relative flex flex-col justify-center px-4 py-10 sm:px-6 lg:min-h-[calc(100vh_-_100px)] lg:items-start lg:justify-start lg:px-16 lg:py-0 lg:pt-28">
          <div
            className="max-w-sm"
            style={{
              filter:
                "drop-shadow(0 1px 3px rgba(255,255,255,0.95)) drop-shadow(0 2px 16px rgba(255,255,255,0.9))",
            }}
          >
            <h1 className="font-display text-display-xl text-deep-plum">
              Nature. Beauty. <em className="italic">Creativity.</em>
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="text-label font-semibold uppercase tracking-wide text-plum underline-offset-4 hover:underline"
              >
                Shop Now
              </Link>
              <span className="h-4 w-px bg-charcoal/30" aria-hidden="true" />
              <Link
                href="/categories"
                className="text-label font-semibold uppercase tracking-wide text-deep-plum underline-offset-4 hover:underline"
              >
                Explore Categories
              </Link>
            </div>
            <HairlineDivider className="mt-8 max-w-40" />
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="bg-deep-plum px-4 py-16 sm:px-6 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-label uppercase tracking-wide text-gold">Explore Our</p>
                <h2 className="mt-2 font-display text-display-l text-white">Categories</h2>
              </div>
              <Link
                href="/categories"
                className="hidden shrink-0 items-center gap-1.5 text-label font-semibold uppercase tracking-wide text-gold hover:underline sm:flex"
              >
                View all <ArrowRight className="size-4" strokeWidth={1.5} />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-white/5"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-plum/95 via-deep-plum/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <span className="font-display text-display-m text-white">{category.name}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-body-s font-medium text-gold opacity-0 transition-opacity group-hover:opacity-100">
                      Shop now <ArrowRight className="size-3.5" strokeWidth={1.5} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="px-4 py-16 sm:px-6 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-display-l text-deep-plum">Must Haves</h2>
              </div>
              <Link
                href="/shop"
                className="hidden shrink-0 items-center gap-1.5 text-label font-semibold uppercase tracking-wide text-plum hover:underline sm:flex"
              >
                View all <ArrowRight className="size-4" strokeWidth={1.5} />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} headingLevel="h3" />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
