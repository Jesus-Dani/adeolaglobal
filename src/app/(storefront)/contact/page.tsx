import { MessageCircle } from "lucide-react";
import { HairlineDivider } from "@/components/hairline-divider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { whatsappHref } from "@/lib/site-config";

export const metadata = { title: "Contact Us | ADEOLA Global Ltd" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-display-l text-deep-plum">Contact Us</h1>
      <HairlineDivider className="mt-4 max-w-40" />

      <p className="mt-6 text-body-l text-charcoal">
        Have a question about an order, a product, or anything else? The fastest way to reach us
        is WhatsApp. We read and reply there directly.
      </p>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-soft-lilac p-4">
        <MessageCircle className="size-6 shrink-0 text-plum" strokeWidth={1.5} aria-hidden="true" />
        <div className="flex-1">
          <p className="text-body-m font-medium text-charcoal">Chat with us on WhatsApp</p>
          <p className="text-body-s text-muted-foreground">
            We typically reply within a few hours during business hours.
          </p>
        </div>
      </div>

      <a
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants(), "mt-4 uppercase text-label tracking-wide")}
      >
        Chat now
      </a>
    </div>
  );
}
