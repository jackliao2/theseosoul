import type * as cheerio from "cheerio";
import { analyzePageCitability } from "@/lib/audit/citability";
import { clamp } from "@/lib/utils";
import { scoreToGrade } from "@/lib/audit/score";
import type {
  CheckStatus,
  GeoCategoryScore,
  GeoScoreResult,
  RobotsResult,
  StructuredDataResult,
} from "@/lib/audit/types";

function avg(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function statusFromScore(score: number): CheckStatus {
  if (score >= 85) return "pass";
  if (score >= 60) return "warn";
  return "fail";
}

function labelFromScore(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Poor";
  return "Critical";
}

function points(status: CheckStatus): number {
  if (status === "pass") return 100;
  if (status === "info") return 70;
  if (status === "warn") return 45;
  return 10;
}

export function computeGeoScore(input: {
  $: cheerio.CheerioAPI;
  robots: RobotsResult;
  structured: StructuredDataResult;
  wordCount: number;
  hasCanonical: boolean;
  hasOg: boolean;
  titlePresent: boolean;
  descriptionPresent: boolean;
  llmsTxtPresent?: boolean;
  faqSchemaPresent?: boolean;
}): GeoScoreResult {
  const { $, robots, structured, wordCount } = input;
  const citability = analyzePageCitability($, structured.types);

  // AI Crawler Access
  const blocked = robots.aiCrawlers.filter((c) => c.blocked);
  const crawlerChecks = robots.aiCrawlers.map((c) => ({
    id: c.userAgent,
    title: c.name,
    message: c.message,
    status: c.status,
  }));

  let aiScore = 100;
  if (!robots.present) aiScore = 70;
  aiScore -= blocked.length * 18;
  if (robots.allowsIndexing === false) aiScore = Math.min(aiScore, 20);
  aiScore = clamp(aiScore, 0, 100);

  const aiCategory: GeoCategoryScore = {
    id: "ai-crawler",
    label: "AI Crawler Access",
    score: aiScore,
    status: statusFromScore(aiScore),
    checks: [
      {
        id: "training",
        title: "AI Training Crawlers",
        message:
          blocked.length > 0
            ? `Blocked: ${blocked.map((b) => b.name).join(", ")}`
            : "GPTBot, Google-Extended, ClaudeBot and peers are not fully blocked.",
        status: blocked.length > 0 ? "warn" : robots.present ? "pass" : "info",
      },
      {
        id: "search",
        title: "AI Search Crawlers",
        message: robots.present
          ? "robots.txt available for AI search crawler policy checks."
          : "robots.txt missing — crawler policy cannot be fully verified.",
        status: robots.present ? "pass" : "warn",
      },
      {
        id: "assistants",
        title: "AI Assistant Fetchers",
        message: "ChatGPT-User / Claude-User typically follow robots defaults.",
        status: robots.allowsIndexing === false ? "fail" : "pass",
      },
      ...crawlerChecks.slice(0, 5),
    ],
  };

  // Machine Readability
  const lang = $("html").attr("lang")?.trim() || null;
  const hasMain = $("main").length > 0 || $('[role="main"]').length > 0;
  const hasArticle = $("article").length > 0;
  const hasNav = $("nav").length > 0;
  const hasHeader = $("header").length > 0;

  const readabilityChecks = [
    {
      id: "lang",
      title: "HTML lang attribute",
      message: lang ? `lang="${lang}"` : "Missing html lang attribute.",
      status: (lang ? "pass" : "warn") as CheckStatus,
    },
    {
      id: "main",
      title: "Main content landmark",
      message: hasMain
        ? "Found <main> or role=main."
        : "No main landmark detected.",
      status: (hasMain ? "pass" : "warn") as CheckStatus,
    },
    {
      id: "semantic",
      title: "Semantic structure",
      message: `header:${hasHeader ? "yes" : "no"} · nav:${hasNav ? "yes" : "no"} · article:${hasArticle ? "yes" : "no"}`,
      status: (hasHeader || hasNav || hasArticle ? "pass" : "warn") as CheckStatus,
    },
  ];

  const readabilityCategory: GeoCategoryScore = {
    id: "readability",
    label: "Machine Readability",
    score: avg(readabilityChecks.map((c) => points(c.status))),
    status: statusFromScore(avg(readabilityChecks.map((c) => points(c.status)))),
    checks: readabilityChecks,
  };

  // Structured Data
  const structuredChecks = [
    {
      id: "jsonld",
      title: "JSON-LD",
      message: structured.message,
      status: structured.status,
    },
    {
      id: "types",
      title: "Schema types",
      message:
        structured.types.length > 0
          ? structured.types.slice(0, 8).join(", ")
          : "No schema types detected.",
      status: (structured.types.length > 0 ? "pass" : "warn") as CheckStatus,
    },
    {
      id: "faq",
      title: "FAQ schema",
      message: input.faqSchemaPresent
        ? "FAQPage / Question schema detected — strong for AI answers."
        : "No FAQ schema — Q&A pages benefit from FAQPage markup.",
      status: (input.faqSchemaPresent ? "pass" : "info") as CheckStatus,
    },
    ...citability.filter((s) =>
      ["howto", "article-schema", "organization"].includes(s.id)
    ),
  ];

  const structuredCategory: GeoCategoryScore = {
    id: "structured",
    label: "Schema & Markup",
    score: avg(structuredChecks.map((c) => points(c.status))),
    status: statusFromScore(
      avg(structuredChecks.map((c) => points(c.status)))
    ),
    checks: structuredChecks,
  };

  // Content & Citability
  const contentChecks = [
    {
      id: "words",
      title: "Content length",
      message: `${wordCount} words extracted from page body.`,
      status: (wordCount >= 300
        ? "pass"
        : wordCount >= 100
          ? "warn"
          : "fail") as CheckStatus,
    },
    {
      id: "title",
      title: "Clear title",
      message: input.titlePresent
        ? "Page title present for citation."
        : "Missing title reduces citability.",
      status: (input.titlePresent ? "pass" : "fail") as CheckStatus,
    },
    {
      id: "description",
      title: "Meta description",
      message: input.descriptionPresent
        ? "Meta description helps AI snippets."
        : "Missing meta description.",
      status: (input.descriptionPresent ? "pass" : "warn") as CheckStatus,
    },
    {
      id: "llms-txt",
      title: "llms.txt",
      message: input.llmsTxtPresent
        ? "llms.txt found — curated summary for AI tools."
        : "No llms.txt — consider adding one for GEO.",
      status: (input.llmsTxtPresent ? "pass" : "warn") as CheckStatus,
    },
    ...citability.filter((s) =>
      ["answer-first", "qa-headings", "factual-density", "citations"].includes(
        s.id
      )
    ),
  ];

  const contentCategory: GeoCategoryScore = {
    id: "content",
    label: "Content & Citability",
    score: avg(contentChecks.map((c) => points(c.status))),
    status: statusFromScore(avg(contentChecks.map((c) => points(c.status)))),
    checks: contentChecks,
  };

  // Trust & E-E-A-T proxies
  const trustChecks = [
    {
      id: "canonical",
      title: "Canonical URL",
      message: input.hasCanonical
        ? "Canonical tag present."
        : "Missing canonical weakens trust signals.",
      status: (input.hasCanonical ? "pass" : "warn") as CheckStatus,
    },
    {
      id: "og",
      title: "Open Graph identity",
      message: input.hasOg
        ? "Open Graph tags present."
        : "Missing Open Graph identity tags.",
      status: (input.hasOg ? "pass" : "warn") as CheckStatus,
    },
    {
      id: "https",
      title: "HTTPS",
      message: "Audited over HTTPS.",
      status: "pass" as CheckStatus,
    },
    ...citability.filter((s) =>
      ["author", "freshness"].includes(s.id)
    ),
  ];

  const trustCategory: GeoCategoryScore = {
    id: "trust",
    label: "Trust & Freshness",
    score: avg(trustChecks.map((c) => points(c.status))),
    status: statusFromScore(avg(trustChecks.map((c) => points(c.status)))),
    checks: trustChecks,
  };

  const categories = [
    aiCategory,
    readabilityCategory,
    structuredCategory,
    contentCategory,
    trustCategory,
  ];

  const score = avg(categories.map((c) => c.score));
  const grade = scoreToGrade(score);

  let passed = 0;
  let warnings = 0;
  let failed = 0;
  for (const cat of categories) {
    for (const check of cat.checks) {
      if (check.status === "pass" || check.status === "info") passed += 1;
      else if (check.status === "warn") warnings += 1;
      else failed += 1;
    }
  }

  return {
    score,
    grade,
    label: labelFromScore(score),
    passed,
    warnings,
    failed,
    categories,
    status: statusFromScore(score),
    message: `GEO score ${score}/100 — ${labelFromScore(score)} (AI crawler + citation readiness).`,
  };
}
