import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { HairlineDivider } from "@/components/hairline-divider";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <section className="relative overflow-hidden bg-soft-lilac">
      <div className="absolute inset-0">
        <Image
          src="/images/products/rosemary-hair-growth-oil.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-36">
        <p className="text-label font-semibold tracking-wide text-gold uppercase">
          Quality Care. Made For You.
        </p>
        <h1 className="mt-3 font-display text-display-xl text-deep-plum">
          Nature. Beauty. <em className="italic">Creativity.</em>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-body-l text-charcoal">
          Premium hair and skincare, handmade crafts, unique gifts and more. Everything you need
          to look good, feel good and live beautifully.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
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
              "border-plum bg-white/70 text-plum uppercase text-label tracking-wide hover:bg-white",
            )}
          >
            Explore Categories
          </Link>
        </div>
        <HairlineDivider className="mx-auto mt-8 max-w-40" />
      </div>
    </section>
  );
}
