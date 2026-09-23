import type { Metadata, Viewport } from "next";
import { Geist_Mono, Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SwRegister } from "@/components/delima/sw-register";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
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
 * Static, fully-literal JSON-LD (issue #67). Defined as a module-level const
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
    default: "Delima Realtors — Luxury Homes in Nairobi",
    template: "%s · Delima Realtors",
  },
  description:
    "Luxury homes across Nairobi — AI-powered property search, interactive map discovery and market intelligence from Delima Realtors. Karen, Muthaiga, Runda, Kilimani and beyond.",
  keywords: [
    "Delima Realtors",
    "Nairobi real estate",
    "luxury homes Kenya",
    "Karen houses for sale",
    "Westlands apartments",
    "property Kenya",
    "real estate platform",
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
        alt: "Delima Realtors — Find Your Signature Address",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Delima Realtors — Luxury Homes in Nairobi",
    description:
      "AI-powered property search, interactive map discovery and market intelligence for Nairobi's finest homes.",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    title: "Delima",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#c9a227" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1810" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${manrope.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
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
      </body>
    </html>
  );
}
