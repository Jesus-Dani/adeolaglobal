import Image from "next/image";
import Link from "next/link";
import { HairlineDivider } from "@/components/hairline-divider";

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
          className="object-cover"
        />
      </div>

      <div
        className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-36"
        style={{ filter: "drop-shadow(0 1px 3px rgba(255,255,255,0.95)) drop-shadow(0 2px 16px rgba(255,255,255,0.85))" }}
      >
        <h1 className="font-display text-display-xl text-deep-plum">
          Nature. Beauty. <em className="italic">Creativity.</em>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-body-l text-charcoal">
          Premium hair and skincare, handmade crafts, unique gifts and more. Everything you need
          to look good, feel good and live beautifully.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
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
        <HairlineDivider className="mx-auto mt-8 max-w-40" />
      </div>
    </section>
  );
}
