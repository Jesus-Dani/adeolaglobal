import Image from "next/image";
import Link from "next/link";
import { HairlineDivider } from "@/components/hairline-divider";

export default function Home() {
  return (
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
  );
}
