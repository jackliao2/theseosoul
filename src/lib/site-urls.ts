import { getIndexableAuditDomains } from "@/lib/audit/store";
import { SITE_URL } from "@/lib/audit/types";

/** Static paths that belong in the public sitemap (leading slash). */
export const SITEMAP_STATIC_PATHS = [
  "",
  "/about",
  "/contact",
  "/tools",
  "/tools/adsense-readiness-checker",
  "/tools/domain-history",
  "/tools/geo-content-checker",
  "/tools/robots-txt-checker",
  "/tools/meta-tag-checker",
  "/tools/canonical-checker",
  "/tools/keyword-density-checker",
  "/tools/open-graph-checker",
  "/tools/noindex-checker",
  "/tools/redirect-checker",
  "/privacy",
  "/terms",
] as const;

export function getIndexableSiteUrls(baseUrl: string = SITE_URL): string[] {
  const origin = baseUrl.replace(/\/$/, "");
  const staticUrls = SITEMAP_STATIC_PATHS.map((path) =>
    path ? `${origin}${path}` : origin
  );
  const auditUrls = getIndexableAuditDomains().map(
    (domain) => `${origin}/audit/${domain}`
  );
  return [...staticUrls, ...auditUrls];
}
