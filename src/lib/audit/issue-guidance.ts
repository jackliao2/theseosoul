/** Why it matters + how to fix — Seobility-style guidance keyed by check id. */
export const ISSUE_GUIDANCE: Record<
  string,
  { why: string; fix: string }
> = {
  "meta-title": {
    why: "Titles are the primary SERP headline and a strong relevance signal for Google and AI citations.",
    fix: "Write a unique title ~50–60 characters that includes the primary topic near the start.",
  },
  "meta-description": {
    why: "Descriptions influence click-through and give crawlers a concise page summary.",
    fix: "Add a compelling 120–160 character summary with a clear value proposition.",
  },
  canonical: {
    why: "Canonicals prevent duplicate-content confusion across URL variants.",
    fix: "Set one absolute preferred URL in <link rel=\"canonical\"> matching the live page.",
  },
  h1: {
    why: "A single clear H1 anchors on-page topic for users and machines.",
    fix: "Use exactly one H1 that matches the page intent and overlaps with the title.",
  },
  h2: {
    why: "H2s outline sections so crawlers can extract answers and FAQs.",
    fix: "Add descriptive H2s for each major section; prefer question-style where natural.",
  },
  h3: {
    why: "H3s support deeper structure under H2s without skipping levels.",
    fix: "Nest H3s under relevant H2s; avoid jumping heading levels.",
  },
  "images-alt": {
    why: "Alt text aids accessibility and image understanding in search/AI.",
    fix: "Describe each meaningful image in alt; skip purely decorative images.",
  },
  "open-graph": {
    why: "OG tags control how links appear when shared — and reinforce page identity.",
    fix: "Set og:title, og:description, and og:image (1200×630) for the page.",
  },
  "robots-txt": {
    why: "robots.txt governs crawl access for search and AI bots.",
    fix: "Publish a valid robots.txt; avoid Disallow: / unless intentional; allow important bots.",
  },
  "robots-meta": {
    why: "Meta robots and X-Robots-Tag can block indexing even when the page looks fine.",
    fix: "Remove noindex/none unless the page should stay out of Google; check both HTML meta and response headers.",
  },
  viewport: {
    why: "Viewport is required for mobile-friendly rendering — a ranking baseline.",
    fix: "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">.",
  },
  https: {
    why: "HTTPS is a trust and ranking baseline; mixed HTTP breaks modern browsers.",
    fix: "Serve the site over HTTPS with a valid certificate and redirect HTTP → HTTPS.",
  },
  sitemap: {
    why: "Sitemaps help discovery of URLs for crawlers and AI fetchers.",
    fix: "Publish /sitemap.xml and reference it from robots.txt when possible.",
  },
  structured: {
    why: "Schema helps search/AI understand entities, FAQs, and articles.",
    fix: "Add relevant JSON-LD (Organization, WebSite, Article, FAQPage, etc.).",
  },
  "content-length": {
    why: "Thin pages rarely earn rankings or AI citations.",
    fix: "Expand useful body copy (often 300+ words for informational pages).",
  },
  "security-headers": {
    why: "Security headers protect users and signal a maintained site.",
    fix: "Add HSTS, X-Content-Type-Options, and ideally CSP / X-Frame-Options.",
  },
  "llms-txt": {
    why: "llms.txt gives AI tools a curated site summary for GEO.",
    fix: "Add /llms.txt describing your product, key pages, and contact.",
  },
  "ads-txt": {
    why: "ads.txt authorizes digital sellers if you run ads.",
    fix: "Publish /ads.txt if you monetize with display ads; otherwise optional.",
  },
  "humans-txt": {
    why: "Optional credits file — low SEO impact, nice for transparency.",
    fix: "Add /humans.txt with team/credits if you want; optional.",
  },
  "faq-schema": {
    why: "FAQ schema can power rich results and AI Q&A extraction.",
    fix: "Mark up real Q&A with FAQPage JSON-LD (only if visible on the page).",
  },
  "mixed-content": {
    why: "HTTP assets on HTTPS pages break trust and can block resources.",
    fix: "Upgrade all scripts, images, and iframes to https:// URLs.",
  },
  ssl: {
    why: "Expired/weak TLS stops browsers and crawlers from fetching safely.",
    fix: "Renew the certificate before expiry; prefer a trusted public CA.",
  },
  "security-txt": {
    why: "Helps researchers report vulnerabilities responsibly.",
    fix: "Add /.well-known/security.txt with a Contact: field.",
  },
  "dns-spf": {
    why: "SPF/DMARC protect email spoofing when MX records exist.",
    fix: "Add a v=spf1 TXT record and consider DMARC at _dmarc.",
  },
  "text-html-ratio": {
    why: "Extremely script-heavy pages look thin to crawlers.",
    fix: "Ship meaningful HTML text; avoid empty shells that rely only on JS.",
  },
  "title-h1": {
    why: "Title and H1 should reinforce the same topic for relevance.",
    fix: "Align key terms between <title> and the main H1.",
  },
  "redirect-chain": {
    why: "Long redirect chains waste crawl budget and slow users.",
    fix: "Point links to the final URL; keep redirects to 1 hop when possible.",
  },
};

export function guidanceFor(id: string): { why: string; fix: string } {
  return (
    ISSUE_GUIDANCE[id] ?? {
      why: "This signal affects how search engines or AI systems interpret the page.",
      fix: "Review the finding and align the page with common SEO best practices.",
    }
  );
}

const STATUS_ORDER: Record<string, number> = {
  fail: 0,
  warn: 1,
  info: 2,
  pass: 3,
};

export function sortChecksBySeverity<T extends { status: string }>(
  checks: T[]
): T[] {
  return [...checks].sort(
    (a, b) =>
      (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
  );
}
