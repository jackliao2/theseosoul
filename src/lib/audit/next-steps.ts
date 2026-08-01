import type { AuditIssue, AuditResult, AuditTabId } from "@/lib/audit/types";

const SEVERITY_ORDER: Record<AuditIssue["severity"], number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export type NextStepLink = {
  href: string;
  label: string;
};

export type AuditNextStep = {
  id: string;
  title: string;
  severity: AuditIssue["severity"];
  tab: AuditTabId;
  tool?: NextStepLink;
  guide?: NextStepLink;
};

const ISSUE_LINKS: Record<
  string,
  { tab: AuditTabId; tool?: NextStepLink; guide?: NextStepLink }
> = {
  "meta-title": {
    tab: "issues",
    tool: { href: "/tools/meta-tag-checker", label: "Meta Tag Checker" },
    guide: {
      href: "/blog/technical-seo-checklist-before-launch",
      label: "Launch checklist",
    },
  },
  "meta-description": {
    tab: "issues",
    tool: { href: "/tools/meta-tag-checker", label: "Meta Tag Checker" },
    guide: {
      href: "/blog/technical-seo-checklist-before-launch",
      label: "Launch checklist",
    },
  },
  title: {
    tab: "issues",
    tool: { href: "/tools/meta-tag-checker", label: "Meta Tag Checker" },
  },
  description: {
    tab: "issues",
    tool: { href: "/tools/meta-tag-checker", label: "Meta Tag Checker" },
  },
  canonical: {
    tab: "issues",
    tool: { href: "/tools/canonical-checker", label: "Canonical Checker" },
    guide: {
      href: "/blog/robots-txt-vs-noindex-vs-canonical",
      label: "robots vs noindex vs canonical",
    },
  },
  "robots-txt": {
    tab: "issues",
    tool: { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
    guide: {
      href: "/blog/robots-txt-vs-noindex-vs-canonical",
      label: "robots vs noindex vs canonical",
    },
  },
  "robots-meta": {
    tab: "issues",
    tool: { href: "/tools/noindex-checker", label: "Noindex Checker" },
    guide: {
      href: "/blog/robots-txt-vs-noindex-vs-canonical",
      label: "robots vs noindex vs canonical",
    },
  },
  noindex: {
    tab: "issues",
    tool: { href: "/tools/noindex-checker", label: "Noindex Checker" },
    guide: {
      href: "/blog/robots-txt-vs-noindex-vs-canonical",
      label: "robots vs noindex vs canonical",
    },
  },
  sitemap: {
    tab: "issues",
    tool: { href: "/tools/sitemap-checker", label: "Sitemap Checker" },
    guide: {
      href: "/blog/xml-sitemaps-that-actually-help",
      label: "XML sitemaps guide",
    },
  },
  https: {
    tab: "domain",
    tool: { href: "/tools/ssl-checker", label: "SSL Days Checker" },
    guide: {
      href: "/blog/ssl-and-security-headers-for-seo",
      label: "SSL & headers",
    },
  },
  ssl: {
    tab: "domain",
    tool: { href: "/tools/ssl-checker", label: "SSL Days Checker" },
    guide: {
      href: "/blog/ssl-and-security-headers-for-seo",
      label: "SSL & headers",
    },
  },
  "security-headers": {
    tab: "domain",
    tool: {
      href: "/tools/security-headers-checker",
      label: "Security Headers",
    },
    guide: {
      href: "/blog/ssl-and-security-headers-for-seo",
      label: "SSL & headers",
    },
  },
  "redirect-chain": {
    tab: "domain",
    tool: { href: "/tools/redirect-checker", label: "Redirect Checker" },
  },
  "open-graph": {
    tab: "signals",
    tool: { href: "/tools/open-graph-checker", label: "Open Graph Checker" },
  },
  "llms-txt": {
    tab: "geo",
    tool: { href: "/tools/geo-content-checker", label: "GEO Content Checker" },
    guide: {
      href: "/blog/geo-llms-txt-practical-guide",
      label: "GEO & llms.txt",
    },
  },
  structured: {
    tab: "geo",
    tool: { href: "/tools/geo-content-checker", label: "GEO Content Checker" },
    guide: {
      href: "/blog/geo-llms-txt-practical-guide",
      label: "GEO & llms.txt",
    },
  },
  "faq-schema": {
    tab: "geo",
    guide: {
      href: "/blog/geo-llms-txt-practical-guide",
      label: "GEO & llms.txt",
    },
  },
  h1: { tab: "structure" },
  h2: { tab: "structure" },
  "images-alt": { tab: "structure" },
  "content-length": {
    tab: "keywords",
    tool: {
      href: "/tools/keyword-density-checker",
      label: "Density Checker",
    },
  },
};

function fallbackTab(issue: AuditIssue): AuditTabId {
  if (issue.category === "geo") return "geo";
  if (issue.category === "technical") return "domain";
  if (issue.category === "on-page") return "issues";
  return "issues";
}

/** Top actionable next steps for the Overview “Next 15 minutes” block. */
export function getAuditNextSteps(
  audit: AuditResult,
  limit = 3
): AuditNextStep[] {
  const ranked = [...audit.issues]
    .filter((i) => i.severity !== "info")
    .sort(
      (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    );

  const steps: AuditNextStep[] = [];
  const seen = new Set<string>();

  for (const issue of ranked) {
    if (steps.length >= limit) break;
    const key = issue.id;
    if (seen.has(key)) continue;
    seen.add(key);

    const links = ISSUE_LINKS[issue.id];
    steps.push({
      id: issue.id,
      title: issue.title,
      severity: issue.severity,
      tab: links?.tab ?? fallbackTab(issue),
      tool: links?.tool,
      guide: links?.guide,
    });
  }

  return steps;
}
