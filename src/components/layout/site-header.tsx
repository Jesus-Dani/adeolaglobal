import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { AnnouncementBar } from "./announcement-bar";
import { MobileNav } from "./mobile-nav";
import { CartDrawer } from "./cart-drawer";
import { HeaderSearch, HeaderSearchTrigger } from "./header-search";
import { WishlistButton } from "./wishlist-button";
import { HairlineDivider } from "@/components/hairline-divider";
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
          <Image src="/brand/logo-mark.png" alt="" width={36} height={36} priority className="size-9" />
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
          <HeaderSearch className="hidden sm:block" />
          <HeaderSearchTrigger />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Account"
            nativeButton={false}
            render={<Link href="/account" />}
          >
            <User strokeWidth={1.5} />
          </Button>
          <WishlistButton />
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}
