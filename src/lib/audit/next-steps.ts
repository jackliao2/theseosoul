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

/** Keys must match AuditIssue.id values from buildIssues(). */
const ISSUE_LINKS: Record<
  string,
  { tab: AuditTabId; tool?: NextStepLink; guide?: NextStepLink }
> = {
  title: {
    tab: "issues",
    tool: { href: "/tools/meta-tag-checker", label: "Meta Tag Checker" },
    guide: {
      href: "/blog/technical-seo-checklist-before-launch",
      label: "Launch checklist",
    },
  },
  description: {
    tab: "issues",
    tool: { href: "/tools/meta-tag-checker", label: "Meta Tag Checker" },
    guide: {
      href: "/blog/technical-seo-checklist-before-launch",
      label: "Launch checklist",
    },
  },
  canonical: {
    tab: "issues",
    tool: { href: "/tools/canonical-checker", label: "Canonical Checker" },
    guide: {
      href: "/blog/robots-txt-vs-noindex-vs-canonical",
      label: "robots vs noindex vs canonical",
    },
  },
  headings: { tab: "structure" },
  images: { tab: "structure" },
  og: {
    tab: "signals",
    tool: { href: "/tools/open-graph-checker", label: "Open Graph Checker" },
  },
  robots: {
    tab: "issues",
    tool: { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
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
  "mixed-content": {
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
  "dns-spf": { tab: "domain" },
  "text-html-ratio": { tab: "structure" },
  "title-h1": { tab: "structure" },
  "redirect-chain": {
    tab: "domain",
    tool: { href: "/tools/redirect-checker", label: "Redirect Checker" },
  },
  "llms-txt": {
    tab: "geo",
    tool: { href: "/tools/geo-content-checker", label: "GEO Content Checker" },
    guide: {
      href: "/blog/geo-llms-txt-practical-guide",
      label: "GEO & llms.txt",
    },
  },
};

function fallbackTab(issue: AuditIssue): AuditTabId {
  if (issue.category === "geo") return "geo";
  if (issue.category === "technical") return "domain";
  if (issue.category === "on-page") return "issues";
  return "issues";
}

function linksFor(issue: AuditIssue) {
  if (ISSUE_LINKS[issue.id]) return ISSUE_LINKS[issue.id];
  // AI crawler blocks: ai-GPTBot, etc.
  if (issue.id.startsWith("ai-")) {
    return {
      tab: "geo" as const,
      tool: { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
      guide: {
        href: "/blog/geo-llms-txt-practical-guide",
        label: "GEO & llms.txt",
      },
    };
  }
  return undefined;
}

/** Top actionable next steps for the Overview “Next 15 minutes” block. */
export function getAuditNextSteps(
  audit: AuditResult,
  limit = 3
): AuditNextStep[] {
  const ranked = [...audit.issues]
    .filter((i) => i.severity !== "info")
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const steps: AuditNextStep[] = [];
  const seen = new Set<string>();

  for (const issue of ranked) {
    if (steps.length >= limit) break;
    if (seen.has(issue.id)) continue;
    seen.add(issue.id);

    const links = linksFor(issue);
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
