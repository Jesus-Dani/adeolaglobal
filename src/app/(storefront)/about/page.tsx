import { HairlineDivider } from "@/components/hairline-divider";

export const metadata = { title: "About Us | ADEOLA Global Ltd" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-display-l text-deep-plum">About ADEOLA Global Ltd</h1>
      <HairlineDivider className="mt-4 max-w-40" />

      <div className="mt-6 flex flex-col gap-4 text-body-l text-charcoal">
        <p>
          ADEOLA Global Ltd is a Nigerian multi-category business bringing together hair and
          skincare, crochet and handmade products, home-care essentials, and thoughtful gifting —
          all in one place.
        </p>
        <p>
          Every product is chosen and, in many cases, handmade with the same standard in mind:
          quality you can trust and craftsmanship you can feel. It&apos;s the reason customers keep
          coming back.
        </p>
        <p>
          ADEOLA Global is run by a single dedicated owner-operator, which means every order is
          seen and cared for personally — from the moment it&apos;s placed to the moment it arrives.
        </p>
      </div>
    </div>
  );
}
