import { guidanceFor, sortChecksBySeverity } from "@/lib/audit/issue-guidance";
import { clamp } from "@/lib/utils";
import type {
  AuditIssue,
  AuditResult,
  CheckStatus,
  IssueCheckCard,
  SeoGrade,
} from "@/lib/audit/types";

function withGuidance(
  card: Omit<IssueCheckCard, "why" | "fix">
): IssueCheckCard {
  const g = guidanceFor(card.id);
  return { ...card, why: g.why, fix: g.fix };
}

function pointsFor(status: CheckStatus, max: number): number {
  switch (status) {
    case "pass":
      return max;
    case "warn":
      return Math.round(max * 0.55);
    case "info":
      return Math.round(max * 0.85);
    case "fail":
    default:
      return 0;
  }
}

export function scoreToGrade(score: number): SeoGrade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function computeScore(parts: {
  title: CheckStatus;
  description: CheckStatus;
  canonical: CheckStatus;
  headings: CheckStatus;
  images: CheckStatus;
  openGraph: CheckStatus;
  robots: CheckStatus;
  robotsMeta?: CheckStatus;
  aiBlockedCount: number;
}): { score: number; grade: SeoGrade } {
  let score = 0;
  score += pointsFor(parts.title, 18);
  score += pointsFor(parts.description, 18);
  score += pointsFor(parts.canonical, 12);
  score += pointsFor(parts.headings, 16);
  score += pointsFor(parts.images, 12);
  score += pointsFor(parts.openGraph, 12);
  score += pointsFor(parts.robots, 12);

  // Accidental noindex is a hard indexing blocker — heavy penalty.
  if (parts.robotsMeta === "fail") {
    score -= 25;
  }

  score -= Math.min(10, parts.aiBlockedCount * 2);

  const normalized = clamp(Math.round(score), 0, 100);
  return { score: normalized, grade: scoreToGrade(normalized) };
}

export function buildIssueChecks(
  result: Pick<
    AuditResult,
    | "title"
    | "description"
    | "canonical"
    | "headings"
    | "images"
    | "openGraph"
    | "robots"
    | "robotsMeta"
    | "tech"
    | "structured"
    | "density"
    | "extras"
  >
): IssueCheckCard[] {
  const securityHeaders = [
    "strict-transport-security",
    "x-content-type-options",
    "content-security-policy",
    "x-frame-options",
  ];
  const presentSecurity = securityHeaders.filter((h) => result.tech.headers[h]);
  const securityStatus =
    presentSecurity.length >= 3
      ? "pass"
      : presentSecurity.length >= 1
        ? "warn"
        : "fail";

  const checks: IssueCheckCard[] = [
    withGuidance({
      id: "meta-title",
      title: "Meta Title Check",
      description: result.title.message,
      status: result.title.status,
    }),
    withGuidance({
      id: "meta-description",
      title: "Meta Description Check",
      description: result.description.message,
      status: result.description.status,
    }),
    withGuidance({
      id: "canonical",
      title: "Canonical URL Check",
      description: result.canonical.message,
      status: result.canonical.status,
    }),
    withGuidance({
      id: "h1",
      title: "H1 Check",
      description: result.headings.h1Message,
      status: result.headings.h1Status,
    }),
    withGuidance({
      id: "h2",
      title: "H2 Check",
      description: result.headings.h2Message,
      status: result.headings.h2Status,
    }),
    withGuidance({
      id: "h3",
      title: "H3 Check",
      description: result.headings.h3Message,
      status: result.headings.h3Status,
    }),
    withGuidance({
      id: "images-alt",
      title: "Image Alt Check",
      description: result.images.message,
      status: result.images.status,
    }),
    withGuidance({
      id: "open-graph",
      title: "Open Graph Check",
      description: result.openGraph.message,
      status: result.openGraph.status,
    }),
    withGuidance({
      id: "robots-txt",
      title: "robots.txt Check",
      description: result.robots.message,
      status: result.robots.status,
    }),
    withGuidance({
      id: "robots-meta",
      title: "Robots Meta / X-Robots-Tag",
      description: (() => {
        const x = result.tech.xRobotsTag;
        if (result.robotsMeta.status === "fail" || /noindex|\bnone\b/i.test(x ?? "")) {
          const bits = [
            result.robotsMeta.content
              ? `meta: ${result.robotsMeta.content}`
              : null,
            x ? `header: ${x}` : null,
          ].filter(Boolean);
          return bits.length
            ? `Indexing restricted (${bits.join("; ")}).`
            : "Indexing directives block this URL.";
        }
        return result.robotsMeta.message;
      })(),
      status:
        result.robotsMeta.status === "fail" ||
        /noindex|\bnone\b/i.test(result.tech.xRobotsTag ?? "")
          ? "fail"
          : result.robotsMeta.status,
    }),
    withGuidance({
      id: "viewport",
      title: "Viewport Check",
      description: result.tech.viewport
        ? "Viewport meta tag is present."
        : "Missing viewport meta tag (hurts mobile SEO).",
      status: result.tech.viewport ? "pass" : "fail",
    }),
    withGuidance({
      id: "https",
      title: "HTTPS Check",
      description: result.tech.hasHttps
        ? "Page is served over HTTPS."
        : "Page is not using HTTPS.",
      status: result.tech.hasHttps ? "pass" : "fail",
    }),
    withGuidance({
      id: "sitemap",
      title: "Sitemap Check",
      description: result.tech.sitemapPresent
        ? "sitemap.xml appears present."
        : "sitemap.xml not found at /sitemap.xml.",
      status: result.tech.sitemapPresent ? "pass" : "warn",
    }),
    withGuidance({
      id: "structured",
      title: "Structured Data Check",
      description: result.structured.message,
      status: result.structured.status,
    }),
    withGuidance({
      id: "content-length",
      title: "Content Length Check",
      description: result.density.message,
      status: result.density.status,
    }),
    withGuidance({
      id: "security-headers",
      title: "Security Headers Check",
      description:
        presentSecurity.length > 0
          ? `Found ${presentSecurity.length}/${securityHeaders.length} common security headers.`
          : "No common security headers detected (HSTS, X-Content-Type-Options, CSP, X-Frame-Options).",
      status: securityStatus,
    }),
    withGuidance({
      id: "llms-txt",
      title: "llms.txt Check",
      description: result.extras.llmsTxt.message,
      status: result.extras.llmsTxt.status,
    }),
    withGuidance({
      id: "ads-txt",
      title: "ads.txt Check",
      description: result.extras.adsTxt.message,
      status: result.extras.adsTxt.status,
    }),
    withGuidance({
      id: "humans-txt",
      title: "humans.txt Check",
      description: result.extras.humansTxt.message,
      status: result.extras.humansTxt.status,
    }),
    withGuidance({
      id: "faq-schema",
      title: "FAQ Schema Check",
      description: result.extras.faqSchema.message,
      status: result.extras.faqSchema.status,
    }),
    withGuidance({
      id: "mixed-content",
      title: "Mixed Content Check",
      description: result.extras.mixedContent.message,
      status: result.extras.mixedContent.status,
    }),
    withGuidance({
      id: "ssl",
      title: "TLS Certificate Check",
      description: result.extras.ssl.message,
      status: result.extras.ssl.status,
    }),
    withGuidance({
      id: "security-txt",
      title: "security.txt Check",
      description: result.extras.securityTxt.message,
      status: result.extras.securityTxt.status,
    }),
    withGuidance({
      id: "dns-spf",
      title: "DNS / SPF Check",
      description: result.extras.dns.message,
      status: result.extras.dns.status,
    }),
    withGuidance({
      id: "text-html-ratio",
      title: "Text-to-HTML Ratio",
      description: result.extras.textHtmlMessage,
      status: result.extras.textHtmlStatus,
    }),
    withGuidance({
      id: "title-h1",
      title: "Title ↔ H1 Overlap",
      description: result.extras.titleH1.message,
      status: result.extras.titleH1.status,
    }),
    withGuidance({
      id: "redirect-chain",
      title: "Redirect Chain",
      description:
        result.extras.redirectChain.length > 1
          ? `${result.extras.redirectChain.length} hop(s) to final URL.`
          : "No redirect hops recorded.",
      status:
        result.extras.redirectChain.length > 3
          ? "warn"
          : result.extras.redirected
            ? "info"
            : "pass",
    }),
  ];

  return sortChecksBySeverity(checks);
}

export function buildIssues(
  result: Omit<
    AuditResult,
    "issues" | "summary" | "score" | "grade" | "issueChecks"
  >
): AuditIssue[] {
  const issues: AuditIssue[] = [];

  if (result.title.status === "fail" || result.title.status === "warn") {
    issues.push({
      id: "title",
      category: "on-page",
      severity: result.title.status === "fail" ? "critical" : "warning",
      title: "Meta title needs attention",
      description: result.title.message,
    });
  }

  if (
    result.description.status === "fail" ||
    result.description.status === "warn"
  ) {
    issues.push({
      id: "description",
      category: "on-page",
      severity: result.description.status === "fail" ? "critical" : "warning",
      title: "Meta description needs attention",
      description: result.description.message,
    });
  }

  if (result.canonical.status === "fail" || result.canonical.status === "warn") {
    issues.push({
      id: "canonical",
      category: "technical",
      severity: result.canonical.status === "fail" ? "critical" : "warning",
      title: "Canonical URL issue",
      description: result.canonical.message,
    });
  }

  if (result.headings.status === "fail" || result.headings.status === "warn") {
    issues.push({
      id: "headings",
      category: "on-page",
      severity: result.headings.status === "fail" ? "critical" : "warning",
      title: "Heading structure issue",
      description: result.headings.message,
    });
  }

  if (result.images.status === "fail" || result.images.status === "warn") {
    issues.push({
      id: "images",
      category: "on-page",
      severity: result.images.status === "fail" ? "critical" : "warning",
      title: "Image alt attributes incomplete",
      description: result.images.message,
    });
  }

  if (result.openGraph.status === "fail" || result.openGraph.status === "warn") {
    issues.push({
      id: "og",
      category: "technical",
      severity: result.openGraph.status === "fail" ? "critical" : "warning",
      title: "Open Graph tags incomplete",
      description: result.openGraph.message,
    });
  }

  if (result.robots.status === "fail" || result.robots.status === "warn") {
    issues.push({
      id: "robots",
      category: "technical",
      severity: result.robots.status === "fail" ? "critical" : "warning",
      title: "robots.txt issue",
      description: result.robots.message,
    });
  }

  const xRobots = result.tech.xRobotsTag ?? "";
  const robotsMetaBlocked =
    result.robotsMeta.status === "fail" ||
    /noindex|\bnone\b/i.test(result.robotsMeta.content ?? "");
  const xRobotsBlocked = /noindex|\bnone\b/i.test(xRobots);
  if (robotsMetaBlocked || xRobotsBlocked) {
    const bits = [
      result.robotsMeta.content
        ? `meta robots: ${result.robotsMeta.content}`
        : null,
      xRobots ? `X-Robots-Tag: ${xRobots}` : null,
    ].filter(Boolean);
    issues.push({
      id: "noindex",
      category: "technical",
      severity: "critical",
      title: "Page is marked noindex",
      description: bits.length
        ? `Indexing is restricted (${bits.join("; ")}).`
        : "Indexing directives block this URL from search results.",
    });
  }

  for (const crawler of result.robots.aiCrawlers) {
    if (crawler.blocked) {
      issues.push({
        id: `ai-${crawler.userAgent}`,
        category: "geo",
        severity: "warning",
        title: `${crawler.name} blocked`,
        description: crawler.message,
      });
    }
  }

  if (
    result.extras.mixedContent.applicable &&
    (result.extras.mixedContent.status === "fail" ||
      result.extras.mixedContent.status === "warn")
  ) {
    issues.push({
      id: "mixed-content",
      category: "technical",
      severity:
        result.extras.mixedContent.status === "fail" ? "critical" : "warning",
      title: "Mixed content on HTTPS page",
      description: result.extras.mixedContent.message,
    });
  }

  if (result.extras.llmsTxt.status === "warn" && !result.extras.llmsTxt.present) {
    issues.push({
      id: "llms-txt",
      category: "geo",
      severity: "info",
      title: "Missing llms.txt",
      description: result.extras.llmsTxt.message,
    });
  }

  if (
    result.extras.ssl.status === "fail" ||
    result.extras.ssl.status === "warn"
  ) {
    issues.push({
      id: "ssl",
      category: "technical",
      severity: result.extras.ssl.status === "fail" ? "critical" : "warning",
      title: "TLS certificate issue",
      description: result.extras.ssl.message,
    });
  }

  if (result.extras.dns.status === "warn") {
    issues.push({
      id: "dns-spf",
      category: "technical",
      severity: "warning",
      title: "DNS / email auth gap",
      description: result.extras.dns.message,
    });
  }

  if (result.extras.textHtmlStatus === "warn") {
    issues.push({
      id: "text-html-ratio",
      category: "technical",
      severity: "warning",
      title: "Low text-to-HTML ratio",
      description: result.extras.textHtmlMessage,
    });
  }

  if (result.extras.titleH1.status === "warn") {
    issues.push({
      id: "title-h1",
      category: "on-page",
      severity: "warning",
      title: "Title and H1 may not align",
      description: result.extras.titleH1.message,
    });
  }

  if (result.extras.redirectChain.length > 3) {
    issues.push({
      id: "redirect-chain",
      category: "technical",
      severity: "warning",
      title: "Long redirect chain",
      description: `${result.extras.redirectChain.length} hops before the final URL.`,
    });
  }

  return issues;
}

export function buildSummary(
  domain: string,
  score: number,
  grade: SeoGrade,
  issues: AuditIssue[]
): string {
  const critical = issues.filter((i) => i.severity === "critical").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;

  if (score >= 90) {
    return `${domain} shows strong on-page SEO fundamentals (Grade ${grade}). Only minor polish remains.`;
  }
  if (critical > 0) {
    return `${domain} scored ${score}/100 (Grade ${grade}) with ${critical} critical issue${critical === 1 ? "" : "s"} and ${warnings} warning${warnings === 1 ? "" : "s"} to address.`;
  }
  if (warnings > 0) {
    return `${domain} scored ${score}/100 (Grade ${grade}). No critical blockers, but ${warnings} warning${warnings === 1 ? "" : "s"} should be reviewed.`;
  }
  return `${domain} scored ${score}/100 (Grade ${grade}) with a clean technical baseline.`;
}
