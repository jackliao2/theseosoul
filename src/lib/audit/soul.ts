import { sortChecksBySeverity } from "@/lib/audit/issue-guidance";
import { computeSubScores } from "@/lib/audit/subscores";
import type { AuditResult, AuditTabId, IssueCheckCard } from "@/lib/audit/types";

export type SoulArchetypeId =
  | "beacon"
  | "architect"
  | "storyteller"
  | "hidden-gem"
  | "ghost"
  | "rising-voice";

export type SoulProfile = {
  id: SoulArchetypeId;
  name: string;
  message: string;
  evidence: string;
};

export type PrimaryAction = {
  urgent: boolean;
  title: string;
  fix: string;
  why: string;
  tab: AuditTabId;
  status: IssueCheckCard["status"];
};

/**
 * A deterministic interpretation of existing audit evidence.
 * This is brand language layered on transparent scores — not an AI prediction.
 */
export function getSoulProfile(audit: AuditResult): SoulProfile {
  const scores = Object.fromEntries(
    computeSubScores(audit).map((score) => [score.id, score.score])
  ) as Record<"meta" | "structure" | "technical" | "geo", number>;

  const noindex = /noindex|none/i.test(
    `${audit.robotsMeta.content ?? ""} ${audit.tech.xRobotsTag ?? ""}`
  );
  const crawlBlocked = audit.robots.allowsIndexing === false;
  const critical = audit.issues.filter(
    (issue) => issue.severity === "critical"
  ).length;

  if (noindex || crawlBlocked) {
    return {
      id: "ghost",
      name: "The Ghost",
      message:
        "The page is alive, but its crawl or indexing signals make it difficult to discover.",
      evidence: noindex ? "Indexing restricted" : "Crawl access restricted",
    };
  }

  const contentAverage = Math.round(
    (scores.meta + scores.structure + scores.geo) / 3
  );
  if (contentAverage >= 65 && scores.technical < 55) {
    return {
      id: "hidden-gem",
      name: "The Hidden Gem",
      message:
        "There is real substance here; technical gaps are keeping some of it out of view.",
      evidence: `Content ${contentAverage} · Technical ${scores.technical}`,
    };
  }

  if (
    audit.score >= 80 &&
    critical === 0 &&
    Math.min(...Object.values(scores)) >= 65
  ) {
    return {
      id: "beacon",
      name: "The Beacon",
      message:
        "Clear, discoverable, and well signposted for both people and crawlers.",
      evidence: `SEO ${audit.score} · GEO ${scores.geo}`,
    };
  }

  if (
    scores.technical >= 68 &&
    scores.structure >= 68 &&
    scores.technical + scores.structure >= scores.meta + scores.geo
  ) {
    return {
      id: "architect",
      name: "The Architect",
      message:
        "A disciplined technical foundation gives this page a strong, dependable shape.",
      evidence: `Structure ${scores.structure} · Technical ${scores.technical}`,
    };
  }

  if (
    scores.meta + scores.geo > scores.structure + scores.technical ||
    (audit.density.totalWords >= 500 && scores.meta >= 60)
  ) {
    return {
      id: "storyteller",
      name: "The Storyteller",
      message:
        "The page has a clear voice; stronger technical signals can help it travel further.",
      evidence: `Meta ${scores.meta} · GEO ${scores.geo}`,
    };
  }

  return {
    id: "rising-voice",
    name: "The Rising Voice",
    message:
      "The foundations are taking shape, with a few clear opportunities to become easier to find.",
    evidence: `SEO ${audit.score} · GEO ${scores.geo}`,
  };
}

/** Pick one useful next step instead of making the user scan the full issue list. */
export function getPrimaryAction(audit: AuditResult): PrimaryAction {
  const check = sortChecksBySeverity(audit.issueChecks).find(
    (item) =>
      (item.status === "fail" || item.status === "warn") &&
      item.id !== "humans-txt" &&
      item.id !== "ads-txt"
  );

  if (!check) {
    return {
      urgent: false,
      title: "Nothing urgent today",
      fix: "Keep the foundations healthy and re-run the audit after your next release.",
      why: "No failed or warning checks need immediate attention.",
      tab: "issues",
      status: "pass",
    };
  }

  return {
    urgent: true,
    title: check.title,
    fix: check.fix,
    why: check.why,
    tab: tabForCheck(check.id),
    status: check.status,
  };
}

function tabForCheck(id: string): AuditTabId {
  if (/^(h1|h2|h3|images-alt|content-length|title-h1)$/.test(id)) {
    return "structure";
  }
  if (/^(open-graph|structured)$/.test(id)) return "signals";
  if (/^(llms-txt|faq-schema)$/.test(id)) return "geo";
  if (
    /^(robots-txt|viewport|https|sitemap|security-headers|mixed-content|ssl|security-txt|dns-spf|text-html-ratio|redirect-chain)$/.test(
      id
    )
  ) {
    return "domain";
  }
  return "issues";
}
