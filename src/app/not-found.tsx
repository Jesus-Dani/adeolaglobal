import { Compass } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Page Not Found | ADEOLA Global Ltd" };

// Lives at the app root (not inside (storefront)) because Next.js renders
// the root not-found.tsx for any URL that matches no route at all — a
// route-group-scoped one only fires for an explicit notFound() call within
// that segment. Header/footer are composed by hand here for that reason.
export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <EmptyState
          icon={Compass}
          title="We couldn't find that page."
          body="It may have moved, or the link might be out of date."
          action={{ label: "Back to shop", href: "/shop" }}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
