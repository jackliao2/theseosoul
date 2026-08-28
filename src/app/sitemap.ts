import type { MetadataRoute } from "next";
import { getIndexableAuditDomains } from "@/lib/audit/store";
import { SITE_URL } from "@/lib/audit/types";
import { getAllPosts } from "@/lib/blog";
import { SITEMAP_STATIC_PATHS } from "@/lib/site-urls";
import { getIndexableDomainHistoryDomains } from "@/lib/tools/domain-history-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const curated = getIndexableAuditDomains();
  const historyDomains = getIndexableDomainHistoryDomains();

  const staticEntries: MetadataRoute.Sitemap = SITEMAP_STATIC_PATHS.map(
    (path) => ({
      url: path ? `${SITE_URL}${path}` : SITE_URL,
    })
  );

  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
  }));

  const auditEntries: MetadataRoute.Sitemap = curated.map((domain) => ({
    url: `${SITE_URL}/audit/${domain}`,
  }));

  const historyEntries: MetadataRoute.Sitemap = historyDomains.map((domain) => ({
    url: `${SITE_URL}/tools/domain-history/${domain}`,
  }));

  return [...staticEntries, ...blogEntries, ...auditEntries, ...historyEntries];
}
