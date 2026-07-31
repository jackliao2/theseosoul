import type { CheckStatus } from "@/lib/audit/types";

export type ContentDimension = {
  id: string;
  label: string;
  score: number;
  status: CheckStatus;
  tips: string[];
};

export type ContentScoreResult = {
  score: number;
  wordCount: number;
  dimensions: ContentDimension[];
  suggestions: string[];
};

function statusFromScore(score: number): CheckStatus {
  if (score >= 80) return "pass";
  if (score >= 55) return "warn";
  return "fail";
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Rule-based GEO content checker (no LLM / no paid API).
 * Mirrors common “citation readiness” dimensions used by GEO tools.
 */
export function scoreContentForGeo(raw: string): ContentScoreResult {
  const text = raw.replace(/\r\n/g, "\n").trim();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const headings = lines.filter(
    (l) =>
      /^#{1,3}\s+\S/.test(l) ||
      (/^[A-Z0-9][\w\s?/,-]{2,80}$/.test(l) && l.length < 90 && !/[.!?]$/.test(l))
  );
  const questions = lines.filter((l) => /\?$/.test(l) || /^(what|why|how|when|where|who)\b/i.test(l));
  const bullets = lines.filter((l) => /^[-*•]\s+|^\d+[.)]\s+/.test(l));
  const numbers = (text.match(/\b\d{1,3}(?:,\d{3})*(?:\.\d+)?%?|\b(?:19|20)\d{2}\b|\$\d+/g) || []).length;
  const citations = (text.match(/\b(?:according to|source:|doi:|https?:\/\/|et al\.|\[\d+\])/gi) || []).length;
  const definitions = (text.match(/\bis\s+(?:a|an|the)\b|\bmeans\b|\bdefined as\b|\brefers to\b/gi) || []).length;
  const firstPara = text.split(/\n\s*\n/)[0]?.replace(/\s+/g, " ").trim() || text.slice(0, 280);
  const answerFirst =
    firstPara.length >= 60 &&
    firstPara.length <= 400 &&
    !/^(welcome|in this (article|post)|click|subscribe)/i.test(firstPara);

  const hasUniqueClaim =
    /\b(our|we|unique|proprietary|unlike|compared to|benchmark|study|research)\b/i.test(
      text
    );

  // 1 Structure
  let structure = 40;
  if (wordCount >= 100) structure += 10;
  if (headings.length >= 2) structure += 25;
  else if (headings.length === 1) structure += 12;
  if (bullets.length >= 3) structure += 15;
  if (questions.length >= 1) structure += 10;
  structure = clamp(structure, 0, 100);

  // 2 Factual density
  const factPer100 = numbers / Math.max(wordCount / 100, 1);
  let factual = clamp(Math.round(factPer100 * 35), 15, 95);
  if (citations >= 2) factual = clamp(factual + 15, 0, 100);
  else if (citations === 1) factual = clamp(factual + 8, 0, 100);

  // 3 Semantic clarity
  let clarity = 45;
  if (definitions >= 2) clarity += 25;
  else if (definitions === 1) clarity += 12;
  if (questions.length >= 2) clarity += 15;
  if (wordCount >= 200 && wordCount <= 2500) clarity += 10;
  if (/(jargon|lorem ipsum)/i.test(text)) clarity -= 20;
  clarity = clamp(clarity, 0, 100);

  // 4 Answer completeness
  let completeness = 30;
  if (wordCount >= 300) completeness += 25;
  else if (wordCount >= 150) completeness += 12;
  if (wordCount >= 600) completeness += 15;
  if (questions.length >= 2 || headings.length >= 3) completeness += 15;
  if (answerFirst) completeness += 15;
  completeness = clamp(completeness, 0, 100);

  // 5 Authority signals
  let authority = 25;
  if (citations >= 3) authority += 35;
  else if (citations >= 1) authority += 18;
  if (/\b(phd|professor|md|certified|expert|years of experience)\b/i.test(text))
    authority += 20;
  if (/\b(we|our team|i have)\b/i.test(text)) authority += 10;
  if (numbers >= 5) authority += 10;
  authority = clamp(authority, 0, 100);

  // 6 Differentiation
  let differentiation = 35;
  if (hasUniqueClaim) differentiation += 25;
  if (/\b(case study|benchmark|original data|survey of)\b/i.test(text))
    differentiation += 20;
  if (bullets.length >= 4 && headings.length >= 2) differentiation += 10;
  if (wordCount < 120) differentiation -= 15;
  differentiation = clamp(differentiation, 0, 100);

  const dimensions: ContentDimension[] = [
    {
      id: "structure",
      label: "Content Structure",
      score: structure,
      status: statusFromScore(structure),
      tips: [
        "Use clear H2/H3 or markdown headings",
        "Add short bullet lists for scannability",
        "Include question-style section titles",
      ],
    },
    {
      id: "factual",
      label: "Factual Density",
      score: factual,
      status: statusFromScore(factual),
      tips: [
        "Add specific numbers, dates, or percentages",
        "Cite sources (links or “according to…”)",
      ],
    },
    {
      id: "clarity",
      label: "Semantic Clarity",
      score: clarity,
      status: statusFromScore(clarity),
      tips: [
        "Define key terms early (“X is a…”)",
        "Answer one clear question per section",
      ],
    },
    {
      id: "completeness",
      label: "Answer Completeness",
      score: completeness,
      status: statusFromScore(completeness),
      tips: [
        "Lead with a direct answer in the first paragraph",
        "Aim for 300+ words on informational topics",
      ],
    },
    {
      id: "authority",
      label: "Authority Signals",
      score: authority,
      status: statusFromScore(authority),
      tips: [
        "Mention credentials or experience briefly",
        "Link to reputable references",
      ],
    },
    {
      id: "differentiation",
      label: "Competitive Differentiation",
      score: differentiation,
      status: statusFromScore(differentiation),
      tips: [
        "Add original data, a case study, or a clear POV",
        "Call out what is unique vs common advice",
      ],
    },
  ];

  const score = Math.round(
    dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length
  );

  const suggestions = dimensions
    .filter((d) => d.score < 75)
    .sort((a, b) => a.score - b.score)
    .flatMap((d) => d.tips.slice(0, 1))
    .slice(0, 5);

  if (wordCount < 100) {
    suggestions.unshift("Paste at least ~100 words for a meaningful GEO score.");
  }

  return { score, wordCount, dimensions, suggestions };
}
