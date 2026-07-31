import type { AuditResult, AuditTabId, CheckStatus } from "@/lib/audit/types";

export type SubScore = {
  id: string;
  label: string;
  score: number;
  tab: AuditTabId;
};

function points(status: CheckStatus): number {
  switch (status) {
    case "pass":
      return 100;
    case "info":
      return 78;
    case "warn":
      return 48;
    case "fail":
    default:
      return 12;
  }
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/** Seobility-style sub-scores for Overview (0–100). */
export function computeSubScores(audit: AuditResult): SubScore[] {
  const meta = avg([
    points(audit.title.status),
    points(audit.description.status),
    points(audit.canonical.status),
    points(audit.openGraph.status),
  ]);

  const structure = avg([
    points(audit.headings.h1Status),
    points(audit.headings.h2Status),
    points(audit.headings.status),
    points(audit.images.status),
    points(audit.extras.titleH1.status),
  ]);

  const technical = avg([
    points(audit.tech.hasHttps ? "pass" : "fail"),
    points(audit.tech.viewport ? "pass" : "fail"),
    points(audit.robots.status),
    points(audit.tech.sitemapPresent ? "pass" : "warn"),
    points(audit.extras.ssl.status),
    points(
      audit.extras.redirectChain.length > 3
        ? "warn"
        : audit.extras.redirected
          ? "info"
          : "pass"
    ),
    points(audit.extras.mixedContent.status),
  ]);

  return [
    { id: "meta", label: "Meta", score: meta, tab: "issues" },
    { id: "structure", label: "Structure", score: structure, tab: "structure" },
    { id: "technical", label: "Technical", score: technical, tab: "domain" },
    { id: "geo", label: "GEO", score: audit.geo.score, tab: "geo" },
  ];
}
