import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/delivery", label: "Delivery Information" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-deep-plum text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-6 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left lg:px-8">
        <p className="text-body-s text-white/70">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>

        <nav aria-label="Company" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          {COMPANY_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-body-s text-white/70 hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
