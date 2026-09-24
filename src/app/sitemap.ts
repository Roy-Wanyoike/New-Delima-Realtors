import type { MetadataRoute } from "next";

/**
 * Sitemap (issue #67).
 * NOTE: the Delima Realtors app is a single-route SPA — every view
 * (properties, map, insights, agents, finance, CRM…) is rendered inside "/"
 * via client-side view switching. There are therefore no other indexable
 * paths, so the sitemap contains only the canonical home URL.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://delimarealtors.co.ke/",
      lastModified: new Date(),
    },
  ];
}
