import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { SerwistProvider } from "@serwist/next/react";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

// Quincy CF (the font actually requested) is a paid font with no free
// distribution — Fraunces is the closest free stand-in: a similarly warm,
// characterful serif. Used across every text role (display and body/UI),
// not just headings, per direct request.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const SITE_DESCRIPTION =
  "Premium hair and skincare, handmade crafts, unique gifts and more from ADEOLA Global Ltd.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "ADEOLA Global Ltd | Nature. Beauty. Creativity.",
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: "ADEOLA Global Ltd",
    type: "website",
    title: "ADEOLA Global Ltd | Nature. Beauty. Creativity.",
    description: SITE_DESCRIPTION,
    images: [{ url: "/images/hero-banner.jpg", width: 1040, height: 514 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ADEOLA Global Ltd | Nature. Beauty. Creativity.",
    description: SITE_DESCRIPTION,
    images: ["/images/hero-banner.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-plum focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <SerwistProvider swUrl="/sw.js">{children}</SerwistProvider>
      </body>
    </html>
  );
}
