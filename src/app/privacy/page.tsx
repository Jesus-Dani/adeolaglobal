import { HairlineDivider } from "@/components/hairline-divider";

export const metadata = { title: "Privacy Policy | ADEOLA Global Ltd" };

// Placeholder — full Privacy Policy copy is drafted in Phase 6, aligned
// with the NDPR (TRD.md s13). This stub exists now only so the signup ToS
// checkbox and footer link have somewhere real to go.
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-display-l text-deep-plum">Privacy Policy</h1>
      <HairlineDivider className="mt-4 max-w-40" />
      <p className="mt-6 text-body-l text-charcoal">
        This page is a placeholder. ADEOLA Global Ltd&apos;s full Privacy Policy will be published
        here before launch.
      </p>
    </div>
  );
}
