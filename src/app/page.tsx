import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { HairlineDivider } from "@/components/hairline-divider";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <section className="bg-soft-lilac">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
        <div className="text-center lg:text-left">
          <p className="text-label font-semibold tracking-wide text-gold uppercase">
            Quality Care. Made For You.
          </p>
          <h1 className="mt-3 font-display text-display-xl text-deep-plum">
            Nature. Beauty. <em className="italic">Creativity.</em>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-body-l text-charcoal lg:mx-0">
            Premium hair and skincare, handmade crafts, unique gifts and more —
            everything you need to look good, feel good and live beautifully.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/shop"
              className={cn(buttonVariants({ size: "lg" }), "uppercase text-label tracking-wide")}
            >
              Shop Now
            </Link>
            <Link
              href="/categories"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-plum text-plum uppercase text-label tracking-wide hover:bg-plum/5",
              )}
            >
              Explore Categories
            </Link>
          </div>
          <HairlineDivider className="mx-auto mt-8 max-w-40 lg:mx-0" />
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-xl shadow-lg">
          <Image
            src="/images/products/rosemary-hair-growth-oil.jpg"
            alt="ADEOLA Global Rosemary Hair Growth Oil, styled with fresh botanicals"
            fill
            priority
            sizes="(min-width: 1024px) 448px, 90vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
