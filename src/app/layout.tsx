import type { Metadata, Viewport } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SwRegister } from "@/components/delima/sw-register";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://delimarealtors.co.ke";

/**
 * Static, fully-literal JSON-LD. Defined as a module-level const
 * with zero user-generated content, so JSON.stringify is XSS-safe by design.
 */
const realEstateAgentJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Delima Realtors",
  url: SITE_URL,
  telephone: "+254727523752",
  areaServed: "Nairobi",
  address: {
    "@type": "PostalAddress",
    addressCountry: "KE",
    addressLocality: "Nairobi",
    addressRegion: "Nairobi",
  },
  sameAs: [],
  priceRange: "KES 9,800,000 - KES 265,000,000",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Delima Realtors — Find a Home You'll Love in Nairobi",
    template: "%s · Delima Realtors",
  },
  description:
    "Discover verified, title-checked homes across Nairobi. Buy, rent and invest with Delima Realtors — AI-powered search, market insights and end-to-end support from Karen to Kilimani.",
  keywords: [
    "Delima Realtors",
    "Nairobi real estate",
    "houses for sale Nairobi",
    "apartments for rent Kilimani",
    "Karen houses for sale",
    "property Kenya",
    "verified listings Kenya",
  ],
  authors: [{ name: "Delima Realtors" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "Delima Realtors",
    url: "/",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Delima Realtors — Find a Home You'll Love in Nairobi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Delima Realtors — Find a Home You'll Love in Nairobi",
    description:
      "Verified, title-checked homes across Nairobi with AI-powered search and honest market guidance.",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    title: "Delima",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#fafaf7" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          // Static module-level const — no user-generated content, no XSS surface.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(realEstateAgentJsonLd),
          }}
        />
        {children}
        <Toaster />
        <SwRegister />
        {/* Observability (issue #48) — zero-config on Vercel; no-ops locally. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
