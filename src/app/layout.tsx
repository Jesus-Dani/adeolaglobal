import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AuthSync } from "@/components/auth/auth-sync";
import { SerwistProvider } from "@serwist/next/react";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "ADEOLA Global Ltd | Nature. Beauty. Creativity.",
  description:
    "Premium hair and skincare, handmade crafts, unique gifts and more from ADEOLA Global Ltd.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SerwistProvider swUrl="/sw.js">
          <AuthSync />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </SerwistProvider>
      </body>
    </html>
  );
}
