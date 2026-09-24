import type { NextConfig } from "next";

/**
 * Platform-wide security headers (issue #67).
 * HSTS is only meaningful once the site is served over HTTPS in production,
 * so it is gated on NODE_ENV to keep local dev headers clean.
 */
const securityHeaders = (): { key: string; value: string }[] => {
  const headers = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(self)",
    },
  ];

  if (process.env.NODE_ENV === "production") {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
};

const nextConfig: NextConfig = {
  // Standalone output is for self-hosting (sandbox/containers). Vercel builds
  // and packages Next.js itself, so it must use the default output there.
  output: process.env.VERCEL ? undefined : "standalone",
  reactStrictMode: false,
  images: {
    remotePatterns: [
      // Unsplash imagery: home hero (home-view.tsx) + seeded listing/neighborhood photos
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(),
      },
    ];
  },
};

export default nextConfig;
