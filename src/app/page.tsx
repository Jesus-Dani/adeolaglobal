import Image from "next/image";
import Link from "next/link";
import { HairlineDivider } from "@/components/hairline-divider";

export default function Home() {
  return (
    <section className="bg-white">
      <div className="grid lg:min-h-[calc(100vh_-_100px)] lg:grid-cols-2">
        <div className="relative order-1 h-[70vh] lg:h-auto lg:order-2">
          <Image
            src="/images/hero-lifestyle.jpg"
            alt="A woman smiling outdoors next to ADEOLA Global's Rosemary Hair Growth Oil bottles"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="order-2 flex flex-col justify-center bg-soft-lilac px-4 py-16 text-center sm:px-6 lg:order-1 lg:px-16 lg:py-0 lg:text-left">
          <h1 className="font-display text-display-xl text-deep-plum">
            Nature. Beauty. <em className="italic">Creativity.</em>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-body-l text-charcoal lg:mx-0">
            Premium hair and skincare, handmade crafts, unique gifts and more. Everything you need
            to look good, feel good and live beautifully.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
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
          <HairlineDivider className="mx-auto mt-8 max-w-40 lg:mx-0" />
        </div>
      </div>
    </section>
  );
}
