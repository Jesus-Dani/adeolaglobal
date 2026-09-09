import Image from "next/image";
import Link from "next/link";
import { AuthSync } from "@/components/auth/auth-sync";

// Deliberately no SiteHeader/SiteFooter here — login/signup are a focused,
// standalone flow, not a regular storefront page.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-soft-lilac">
      <AuthSync />
      <main id="main-content" className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <Link href="/" aria-label="ADEOLA Global Ltd Home" className="mb-6">
          <Image src="/brand/logo-mark.png" alt="" width={40} height={40} className="size-10" />
        </Link>
        {children}
      </main>
    </div>
  );
}
