import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
      <section className="relative h-[70vh] overflow-hidden bg-soft-lilac lg:h-[calc(100vh_-_100px)]">
        <h1 className="sr-only">ADEOLA Global Ltd: Nature. Beauty. Creativity.</h1>
        <Image
          src="/images/hero-banner.jpg"
          alt="A woman smiling outdoors next to ADEOLA Global's Rosemary Hair Growth Oil bottles"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
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
