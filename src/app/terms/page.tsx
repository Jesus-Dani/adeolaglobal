import { HairlineDivider } from "@/components/hairline-divider";

export const metadata = { title: "Terms of Service | ADEOLA Global Ltd" };

// Placeholder — full Terms of Service copy is drafted in Phase 6, aligned
// with the NDPR (TRD.md s13). This stub exists now only so the signup ToS
// checkbox and footer link have somewhere real to go.
export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-display-l text-deep-plum">Terms of Service</h1>
      <HairlineDivider className="mt-4 max-w-40" />
      <p className="mt-6 text-body-l text-charcoal">
        This page is a placeholder. ADEOLA Global Ltd&apos;s full Terms of Service will be published
        here before launch.
      </p>
    </div>
  );
}
