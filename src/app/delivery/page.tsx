import { HairlineDivider } from "@/components/hairline-divider";

export const metadata = { title: "Delivery Information | ADEOLA Global Ltd" };

// Placeholder — full Delivery Information copy is drafted in Phase 6
// (TRD.md s13). Delivery cost itself is discussed with the customer
// post-order, not calculated at checkout (TRD.md s5).
export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-display-l text-deep-plum">Delivery Information</h1>
      <HairlineDivider className="mt-4 max-w-40" />
      <p className="mt-6 text-body-l text-charcoal">
        This page is a placeholder. Delivery details are currently arranged directly with each
        customer after checkout — full delivery information will be published here before launch.
      </p>
    </div>
  );
}
