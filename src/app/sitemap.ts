import type { MetadataRoute } from "next";
import { getIndexableAuditDomains } from "@/lib/audit/store";
import { SITE_URL } from "@/lib/audit/types";
import { getAllPosts } from "@/lib/blog";
import { SITEMAP_STATIC_PATHS } from "@/lib/site-urls";

const priorities: Record<string, number> = {
  "": 1,
  "/tools": 0.75,
  "/tools/adsense-readiness-checker": 0.75,
  "/tools/domain-history": 0.75,
  "/tools/seo-ladder": 0.72,
  "/tools/meta-tag-checker": 0.72,
  "/tools/keyword-density-checker": 0.72,
  "/tools/geo-content-checker": 0.7,
  "/tools/sitemap-checker": 0.72,
  "/tools/security-headers-checker": 0.7,
  "/tools/ssl-checker": 0.7,
  "/tools/robots-txt-checker": 0.7,
  "/tools/canonical-checker": 0.7,
  "/tools/open-graph-checker": 0.7,
  "/tools/noindex-checker": 0.7,
  "/tools/redirect-checker": 0.65,
  "/blog": 0.75,
  "/about": 0.6,
  "/contact": 0.5,
  "/privacy": 0.3,
  "/terms": 0.3,
};

const frequencies: Record<string, MetadataRoute.Sitemap[number]["changeFrequency"]> =
  {
    "": "weekly",
    "/tools": "weekly",
    "/blog": "weekly",
    "/about": "monthly",
    "/contact": "monthly",
    "/privacy": "yearly",
    "/terms": "yearly",
  };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const curated = getIndexableAuditDomains();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = SITEMAP_STATIC_PATHS.map(
    (path) => ({
      url: path ? `${SITE_URL}${path}` : SITE_URL,
      lastModified: now,
      changeFrequency: frequencies[path] ?? "monthly",
      priority: priorities[path] ?? 0.7,
    })
  );

  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: "monthly" as const,
    priority: 0.68,
  }));

  const auditEntries: MetadataRoute.Sitemap = curated.map((domain) => ({
    url: `${SITE_URL}/audit/${domain}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.55,
  }));

  return [...staticEntries, ...blogEntries, ...auditEntries];
}
