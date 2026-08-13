import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/audit/types";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // Allow OG image endpoint so social/search previews can fetch it;
      // keep other /api/ routes out of the crawl graph.
      allow: ["/", "/api/og-audit"],
      disallow: ["/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
