import Link from "next/link";
import { Gift, Leaf, MessageCircle } from "lucide-react";
import { HairlineDivider } from "@/components/hairline-divider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig, whatsappHref } from "@/lib/site-config";
import { NAV_LINKS } from "./nav-links";

const PROMO_ITEMS = [
  {
    icon: Gift,
    title: "Looking for the perfect gift?",
    body: "Thoughtfully curated gift boxes for every occasion.",
  },
  {
    icon: Leaf,
    title: "Sustainable & Ethical",
    body: "We care for people and the planet.",
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-deep-plum text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
        {PROMO_ITEMS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon className="size-6 shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="text-body-m font-medium">{title}</p>
              <p className="text-body-s text-white/70">{body}</p>
            </div>
          </div>
        ))}
        <div className="flex items-start gap-3">
          <MessageCircle className="size-6 shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
          <div className="flex-1">
            <p className="text-body-m font-medium">Need help?</p>
            <p className="text-body-s text-white/70">Chat with us on WhatsApp</p>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-3 border-white bg-transparent text-white uppercase text-label tracking-wide hover:bg-white hover:text-deep-plum",
              )}
            >
              Chat now
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div>
            <p className="font-display text-display-m text-white">{siteConfig.name}</p>
            <p className="mt-2 text-body-s text-white/70">{siteConfig.tagline}</p>
          </div>

          <nav aria-label="Footer navigation">
            <p className="text-label font-semibold tracking-wide text-white uppercase">Shop</p>
            <ul className="mt-3 space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-body-s text-white/70 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <p className="text-label font-semibold tracking-wide text-white uppercase">Company</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/privacy" className="text-body-s text-white/70 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-body-s text-white/70 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="text-body-s text-white/70 hover:text-white">
                  Delivery Information
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <HairlineDivider className="mb-4" />
        <p className="text-center text-body-s text-white/60">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
