import type { MetadataRoute } from "next";

/**
 * robots.txt (issue #67) — the site is fully public; crawl everything.
 * Served at /robots.txt by the metadata file convention.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://delimarealtors.co.ke/sitemap.xml",
  };
}
