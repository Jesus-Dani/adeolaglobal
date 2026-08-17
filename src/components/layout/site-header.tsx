import Image from "next/image";
import Link from "next/link";
import { Search, User, Heart } from "lucide-react";
import { AnnouncementBar } from "./announcement-bar";
import { MobileNav } from "./mobile-nav";
import { CartDrawer } from "./cart-drawer";
import { HairlineDivider } from "@/components/hairline-divider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <AnnouncementBar />
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          <MobileNav />
        </div>

        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/brand/logo-mark.png" alt="" width={36} height={36} priority />
          <span className="hidden font-display text-display-m leading-none text-deep-plum sm:inline">
            ADEOLA
            <span className="block text-[0.6em] font-normal tracking-[0.15em] text-charcoal">
              GLOBAL LTD
            </span>
          </span>
        </Link>

        <nav className="hidden lg:ml-4 lg:flex lg:items-center lg:gap-6">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex flex-col items-center gap-1 text-body-m text-charcoal transition-colors hover:text-plum"
            >
              {link.label}
              {i === 0 ? (
                <HairlineDivider className="w-6" />
              ) : (
                <span className="h-px w-6 bg-transparent" />
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div className="relative hidden sm:block">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.5}
            />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-40 pl-9 lg:w-64"
              aria-label="Search products"
            />
          </div>
          <Button variant="ghost" size="icon" aria-label="Search" className="sm:hidden">
            <Search strokeWidth={1.5} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Account">
            <User strokeWidth={1.5} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Wishlist">
            <Heart strokeWidth={1.5} />
          </Button>
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}
