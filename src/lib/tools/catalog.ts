/** Shared catalog for /tools hub + header dropdown. */

export type ToolCatalogItem = {
  href: string;
  title: string;
  /** One-line scan text for the hub grid */
  short: string;
  group: "featured" | "checkers" | "content";
};

export const TOOL_CATALOG: ToolCatalogItem[] = [
  {
    href: "/#home-audit-url",
    title: "Technical SEO Audit",
    short: "Full Meta · Structure · Technical · GEO report",
    group: "featured",
  },
  {
    href: "/tools/robots-txt-checker",
    title: "Robots.txt Checker",
    short: "Crawl rules, Sitemaps, AI bot blocks",
    group: "checkers",
  },
  {
    href: "/tools/meta-tag-checker",
    title: "Meta Tag Checker",
    short: "Title, description & SERP preview",
    group: "checkers",
  },
  {
    href: "/tools/canonical-checker",
    title: "Canonical Tag Checker",
    short: "Self-ref vs cross-host canonical",
    group: "checkers",
  },
  {
    href: "/tools/keyword-density-checker",
    title: "Keyword Density Checker",
    short: "1–3 word phrases from URL or paste",
    group: "checkers",
  },
  {
    href: "/tools/open-graph-checker",
    title: "Open Graph Checker",
    short: "OG + Twitter Cards share preview",
    group: "checkers",
  },
  {
    href: "/tools/noindex-checker",
    title: "Noindex Checker",
    short: "Meta robots & X-Robots-Tag",
    group: "checkers",
  },
  {
    href: "/tools/redirect-checker",
    title: "Redirect Checker",
    short: "Full hop chain & status codes",
    group: "checkers",
  },
  {
    href: "/tools/geo-content-checker",
    title: "GEO Content Checker",
    short: "Citation-readiness for drafts",
    group: "content",
  },
];
