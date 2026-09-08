import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { SerwistProvider } from "@serwist/next/react";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600"],
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
    images: [{ url: "/images/hero-banner.jpg", width: 1200, height: 630 }],
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
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
        />
      </head>
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
