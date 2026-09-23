import type { MetadataRoute } from "next";

/**
 * PWA web app manifest (issue #67).
 * Next serves this at /manifest.webmanifest with content-type
 * application/manifest+json and auto-links it in the document head.
 *
 * Icons reference the file-convention icon route (src/app/icon.tsx),
 * which renders a 512x512 PNG at /icon — no binary assets required.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Delima Realtors",
    short_name: "Delima",
    description:
      "Luxury homes across Nairobi — AI-powered search, interactive map discovery and market intelligence from Delima Realtors.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3ea",
    theme_color: "#c9a227",
    icons: [
      {
        src: "/icon",
        type: "image/png",
        sizes: "512x512",
        purpose: "any",
      },
      {
        src: "/icon",
        type: "image/png",
        sizes: "512x512",
        purpose: "maskable",
      },
    ],
  };
}
