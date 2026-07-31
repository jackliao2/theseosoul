/** Shared catalog for /tools hub + header dropdown. */

export type ToolCatalogItem = {
  href: string;
  title: string;
  /** Short label in nav dropdown */
  nav: string;
  /** One-line scan text for the hub / related tiles */
  short: string;
  group: "featured" | "growth" | "checkers" | "content";
};

export const TOOL_CATALOG: ToolCatalogItem[] = [
  {
    href: "/#home-audit-url",
    title: "Technical SEO Audit",
    nav: "Full audit",
    short: "Meta · Structure · Technical · GEO in one report",
    group: "featured",
  },
  {
    href: "/tools/domain-history",
    title: "Domain History Checker",
    nav: "Domain History",
    short: "Wayback chapters + WHOIS second-hand check",
    group: "growth",
  },
  {
    href: "/tools/adsense-readiness-checker",
    title: "AdSense Readiness Checker",
    nav: "AdSense readiness",
    short: "Trust pages, content sample & approval prep",
    group: "growth",
  },
  {
    href: "/tools/seo-ladder",
    title: "SEO Site Ladder",
    nav: "SEO ladder",
    short: "10 capability stages — not a dollar chart",
    group: "growth",
  },
  {
    href: "/tools/robots-txt-checker",
    title: "Robots.txt Checker",
    nav: "Robots.txt",
    short: "Crawl rules, Sitemaps, AI bot blocks",
    group: "checkers",
  },
  {
    href: "/tools/meta-tag-checker",
    title: "Meta Tag Checker",
    nav: "Meta tags",
    short: "Title, description & SERP preview",
    group: "checkers",
  },
  {
    href: "/tools/canonical-checker",
    title: "Canonical Tag Checker",
    nav: "Canonical",
    short: "Self-ref vs cross-host preferred URL",
    group: "checkers",
  },
  {
    href: "/tools/keyword-density-checker",
    title: "Keyword Density Checker",
    nav: "Density",
    short: "1–3 word phrases from URL or paste",
    group: "checkers",
  },
  {
    href: "/tools/open-graph-checker",
    title: "Open Graph Checker",
    nav: "Open Graph",
    short: "OG + Twitter share preview",
    group: "checkers",
  },
  {
    href: "/tools/noindex-checker",
    title: "Noindex Checker",
    nav: "Noindex",
    short: "Meta robots & X-Robots-Tag",
    group: "checkers",
  },
  {
    href: "/tools/redirect-checker",
    title: "Redirect Checker",
    nav: "Redirects",
    short: "Hop chain & status codes",
    group: "checkers",
  },
  {
    href: "/tools/geo-content-checker",
    title: "GEO Content Checker",
    nav: "GEO content",
    short: "Citation-readiness for drafts",
    group: "content",
  },
];

export function getToolByHref(href: string): ToolCatalogItem | undefined {
  return TOOL_CATALOG.find((t) => t.href === href);
}
