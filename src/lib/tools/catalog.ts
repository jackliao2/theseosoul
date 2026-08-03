/** Shared catalog for /tools hub + header dropdown. */

export type ToolCatalogItem = {
  href: string;
  title: string;
  /** Short label in nav dropdown */
  nav: string;
  /** One-line scan text for the hub / related tiles */
  short: string;
  group: "featured" | "growth" | "checkers" | "content";
  /** Compact mono badge on tool tiles (e.g. DH, MT). */
  mark: string;
};

export const TOOL_CATALOG: ToolCatalogItem[] = [
  {
    href: "/#home-audit-url",
    title: "Technical SEO Audit",
    nav: "Full audit",
    short: "Meta · Structure · Technical · GEO in one report",
    group: "featured",
    mark: "SEO",
  },
  {
    href: "/tools/domain-history",
    title: "Domain History Checker",
    nav: "Domain History Checker",
    short: "Wayback chapters + WHOIS second-hand check",
    group: "growth",
    mark: "DH",
  },
  {
    href: "/tools/adsense-readiness-checker",
    title: "AdSense Readiness Checker",
    nav: "AdSense readiness",
    short: "Trust pages, content sample & approval prep",
    group: "growth",
    mark: "AD",
  },
  {
    href: "/tools/seo-ladder",
    title: "SEO Site Ladder",
    nav: "SEO ladder",
    short: "10 capability stages — not a dollar chart",
    group: "growth",
    mark: "10",
  },
  {
    href: "/tools/sitemap-checker",
    title: "Sitemap Checker",
    nav: "Sitemap",
    short: "Nested indexes, sample URL checks, robots Sitemap:",
    group: "checkers",
    mark: "SM",
  },
  {
    href: "/tools/security-headers-checker",
    title: "Security Headers Checker",
    nav: "Security headers",
    short: "Grade HSTS/CSP/XCTO values, not just presence",
    group: "checkers",
    mark: "SH",
  },
  {
    href: "/tools/ssl-checker",
    title: "SSL Days Checker",
    nav: "SSL days",
    short: "Certificate expiry & HTTPS final URL",
    group: "checkers",
    mark: "SSL",
  },
  {
    href: "/tools/robots-txt-checker",
    title: "Robots.txt Checker",
    nav: "Robots.txt",
    short: "Path + UA tester, Sitemaps, AI bot blocks",
    group: "checkers",
    mark: "RB",
  },
  {
    href: "/tools/meta-tag-checker",
    title: "Meta Tag Checker",
    nav: "Meta tags",
    short: "Title, description, H1, lang, viewport & SERP",
    group: "checkers",
    mark: "MT",
  },
  {
    href: "/tools/canonical-checker",
    title: "Canonical Tag Checker",
    nav: "Canonical",
    short: "Self-ref vs cross-host preferred URL",
    group: "checkers",
    mark: "CN",
  },
  {
    href: "/tools/keyword-density-checker",
    title: "Keyword Density Checker",
    nav: "Density",
    short: "1–3 word phrases from URL or paste",
    group: "checkers",
    mark: "KD",
  },
  {
    href: "/tools/open-graph-checker",
    title: "Open Graph Checker",
    nav: "Open Graph",
    short: "OG + Twitter share preview",
    group: "checkers",
    mark: "OG",
  },
  {
    href: "/tools/noindex-checker",
    title: "Noindex Checker",
    nav: "Noindex",
    short: "Meta robots & X-Robots-Tag",
    group: "checkers",
    mark: "NI",
  },
  {
    href: "/tools/redirect-checker",
    title: "Redirect Checker",
    nav: "Redirects",
    short: "Hop chain & status codes",
    group: "checkers",
    mark: "RD",
  },
  {
    href: "/tools/geo-content-checker",
    title: "GEO Content Checker",
    nav: "GEO content",
    short: "Citation-readiness for drafts",
    group: "content",
    mark: "GEO",
  },
];

export function getToolByHref(href: string): ToolCatalogItem | undefined {
  return TOOL_CATALOG.find((t) => t.href === href);
}
