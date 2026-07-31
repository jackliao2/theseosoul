import { sortChecksBySeverity } from "@/lib/audit/issue-guidance";
import { computeSubScores } from "@/lib/audit/subscores";
import type { AuditResult, AuditTabId, IssueCheckCard } from "@/lib/audit/types";

export type SoulArchetypeId =
  | "beacon"
  | "powerhouse"
  | "architect"
  | "storyteller"
  | "pathfinder"
  | "minimalist"
  | "specialist"
  | "craftsperson"
  | "hidden-gem"
  | "ghost"
  | "rising-voice";

export const SOUL_ARCHETYPES: ReadonlyArray<{
  id: SoulArchetypeId;
  name: string;
  essence: string;
}> = [
  { id: "beacon", name: "The Beacon", essence: "Balanced and discoverable" },
  {
    id: "powerhouse",
    name: "The Powerhouse",
    essence: "Three dimensions operating at a high level",
  },
  {
    id: "architect",
    name: "The Architect",
    essence: "Structure and technical discipline",
  },
  {
    id: "storyteller",
    name: "The Storyteller",
    essence: "A strong voice with depth",
  },
  {
    id: "pathfinder",
    name: "The Pathfinder",
    essence: "GEO readiness leads the way",
  },
  {
    id: "minimalist",
    name: "The Minimalist",
    essence: "Lean content, deliberate signals",
  },
  {
    id: "specialist",
    name: "The Specialist",
    essence: "One exceptional discipline",
  },
  {
    id: "craftsperson",
    name: "The Craftsperson",
    essence: "Thoughtful work across every layer",
  },
  {
    id: "hidden-gem",
    name: "The Hidden Gem",
    essence: "Substance obscured by technical gaps",
  },
  {
    id: "ghost",
    name: "The Ghost",
    essence: "Alive but restricted from discovery",
  },
  {
    id: "rising-voice",
    name: "The Rising Voice",
    essence: "A foundation still taking shape",
  },
];

export type SoulProfile = {
  id: SoulArchetypeId;
  name: string;
  message: string;
  evidence: string;
};

export type SoulSignals = {
  score: number;
  meta: number;
  structure: number;
  technical: number;
  geo: number;
  wordCount: number;
  criticalIssues: number;
  indexingRestricted: boolean;
  crawlRestricted: boolean;
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

  return classifySoul({
    score: audit.score,
    meta: scores.meta,
    structure: scores.structure,
    technical: scores.technical,
    geo: scores.geo,
    wordCount: audit.density.totalWords,
    criticalIssues: critical,
    indexingRestricted: noindex,
    crawlRestricted: crawlBlocked,
  });
}

/**
 * Eleven ordered archetypes. Hard access problems win first, then balanced
 * excellence, strong-but-uneven profiles, dominant specialties, and defaults.
 */
export function classifySoul(signals: SoulSignals): SoulProfile {
  const {
    score,
    meta,
    structure,
    technical,
    geo,
    wordCount,
    criticalIssues,
    indexingRestricted,
    crawlRestricted,
  } = signals;
  const dimensions = [meta, structure, technical, geo];
  const strongest = Math.max(...dimensions);
  const weakest = Math.min(...dimensions);
  const spread = strongest - weakest;
  const strongDimensions = dimensions.filter((value) => value >= 85).length;

  if (indexingRestricted || crawlRestricted) {
    return {
      id: "ghost",
      name: "The Ghost",
      message:
        "The page is alive, but its crawl or indexing signals make it difficult to discover.",
      evidence: indexingRestricted
        ? "Indexing restricted"
        : "Crawl access restricted",
    };
  }

  const contentAverage = Math.round((meta + structure + geo) / 3);
  if (contentAverage >= 65 && technical < 55) {
    return {
      id: "hidden-gem",
      name: "The Hidden Gem",
      message:
        "There is real substance here; technical gaps are keeping some of it out of view.",
      evidence: `Content ${contentAverage} · Technical ${technical}`,
    };
  }

  if (
    score >= 82 &&
    criticalIssues === 0 &&
    weakest >= 70 &&
    spread <= 22
  ) {
    return {
      id: "beacon",
      name: "The Beacon",
      message:
        "Clear, discoverable, and well signposted for both people and crawlers.",
      evidence: `Balanced profile · SEO ${score} · GEO ${geo}`,
    };
  }

  if (score >= 75 && strongDimensions >= 3) {
    return {
      id: "powerhouse",
      name: "The Powerhouse",
      message:
        "Multiple systems are operating at a high level; one weaker layer is holding back an otherwise formidable presence.",
      evidence: `Meta ${meta} · Technical ${technical} · GEO ${geo}`,
    };
  }

  if (
    technical >= 75 &&
    structure >= 70 &&
    technical + structure >= meta + geo - 10
  ) {
    return {
      id: "architect",
      name: "The Architect",
      message:
        "A disciplined technical foundation gives this page a strong, dependable shape.",
      evidence: `Structure ${structure} · Technical ${technical}`,
    };
  }

  if (
    geo >= 85 &&
    geo >= Math.max(meta, structure, technical) + 12
  ) {
    return {
      id: "pathfinder",
      name: "The Pathfinder",
      message:
        "AI-readiness is leading the way, while classic SEO signals still have room to catch up.",
      evidence: `GEO leads at ${geo} · SEO ${score}`,
    };
  }

  if (
    wordCount >= 650 &&
    meta >= 70 &&
    geo >= 65 &&
    technical < 85
  ) {
    return {
      id: "storyteller",
      name: "The Storyteller",
      message:
        "The page has a clear voice; stronger technical signals can help it travel further.",
      evidence: `${wordCount} words · Meta ${meta} · GEO ${geo}`,
    };
  }

  if (wordCount < 250 && meta >= 70 && technical >= 70) {
    return {
      id: "minimalist",
      name: "The Minimalist",
      message:
        "Lean and deliberate: the page says little, but its essential signals are carefully placed.",
      evidence: `${wordCount} words · Meta ${meta} · Technical ${technical}`,
    };
  }

  if (strongest >= 85 && spread >= 28) {
    const lead =
      strongest === meta
        ? "Meta"
        : strongest === structure
          ? "Structure"
          : strongest === technical
            ? "Technical"
            : "GEO";
    return {
      id: "specialist",
      name: "The Specialist",
      message:
        "One discipline stands out clearly; strengthening the quieter layers will make the whole site more resilient.",
      evidence: `${lead} leads at ${strongest} · spread ${spread} points`,
    };
  }

  if (weakest >= 60 && criticalIssues <= 1) {
    return {
      id: "craftsperson",
      name: "The Craftsperson",
      message:
        "Thoughtful work is visible across the page, even if the final polish is still underway.",
      evidence: `All four layers at 60+ · SEO ${score}`,
    };
  }

  return {
    id: "rising-voice",
    name: "The Rising Voice",
    message:
      "The foundations are taking shape, with a few clear opportunities to become easier to find.",
    evidence: `SEO ${score} · GEO ${geo}`,
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
