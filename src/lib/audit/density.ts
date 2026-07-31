import type { DensityKeyword, DensityResult } from "@/lib/audit/types";

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "can",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "i",
  "you",
  "he",
  "she",
  "we",
  "they",
  "them",
  "their",
  "our",
  "your",
  "my",
  "me",
  "him",
  "her",
  "us",
  "not",
  "no",
  "yes",
  "if",
  "then",
  "than",
  "so",
  "up",
  "out",
  "about",
  "into",
  "over",
  "after",
  "before",
  "between",
  "under",
  "again",
  "further",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "only",
  "own",
  "same",
  "too",
  "very",
  "just",
  "also",
  "than",
  "amp",
  "nbsp",
]);

function extractVisibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function tokenize(text: string): string[] {
  return text
    .split(/[^a-z0-9\u00c0-\u024f]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !/^\d+$/.test(t));
}

function countNgrams(
  tokens: string[],
  n: 1 | 2 | 3 | 4 | 5,
  totalWords: number
): DensityKeyword[] {
  const counts = new Map<string, number>();

  for (let i = 0; i <= tokens.length - n; i++) {
    const slice = tokens.slice(i, i + n);
    if (n === 1 && STOPWORDS.has(slice[0])) continue;
    if (n > 1 && slice.every((w) => STOPWORDS.has(w))) continue;
    const key = slice.join(" ");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const minCount = n === 1 ? 2 : 1;

  return Array.from(counts.entries())
    .filter(([, count]) => count >= minCount)
    .map(([keyword, count]) => ({
      keyword,
      count,
      total: totalWords,
      density: totalWords > 0 ? Number(((count / totalWords) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword))
    .slice(0, 200);
}

function buildDensityResult(tokens: string[]): DensityResult {
  const totalWords = tokens.length;

  const byNgram = {
    1: countNgrams(tokens, 1, totalWords),
    2: countNgrams(tokens, 2, totalWords),
    3: countNgrams(tokens, 3, totalWords),
    4: countNgrams(tokens, 4, totalWords),
    5: countNgrams(tokens, 5, totalWords),
  } as DensityResult["byNgram"];

  return {
    totalWords,
    byNgram,
    status: totalWords > 50 ? "pass" : totalWords > 0 ? "warn" : "fail",
    message:
      totalWords > 50
        ? `Analyzed ${totalWords} words for keyword density.`
        : totalWords > 0
          ? `Thin content detected (${totalWords} words).`
          : "No readable text content found.",
  };
}

export function analyzeDensity(html: string): DensityResult {
  return buildDensityResult(tokenize(extractVisibleText(html)));
}

/** Plain-text density (paste mode for the free Keyword Density Checker). */
export function analyzeDensityFromText(text: string): DensityResult {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  return buildDensityResult(tokenize(normalized));
}

/** Count how often a focus phrase appears (case-insensitive, whole tokens). */
export function focusKeywordStats(
  textOrHtml: string,
  focus: string,
  fromHtml: boolean
): { phrase: string; count: number; density: number; totalWords: number } | null {
  const phrase = focus.trim().toLowerCase().replace(/\s+/g, " ");
  if (!phrase) return null;
  const source = fromHtml
    ? extractVisibleText(textOrHtml)
    : textOrHtml.toLowerCase().replace(/\s+/g, " ").trim();
  const tokens = tokenize(source);
  const totalWords = tokens.length;
  const focusTokens = tokenize(phrase);
  if (!focusTokens.length || focusTokens.length > tokens.length) {
    return { phrase, count: 0, density: 0, totalWords };
  }
  let count = 0;
  for (let i = 0; i <= tokens.length - focusTokens.length; i += 1) {
    let ok = true;
    for (let j = 0; j < focusTokens.length; j += 1) {
      if (tokens[i + j] !== focusTokens[j]) {
        ok = false;
        break;
      }
    }
    if (ok) count += 1;
  }
  return {
    phrase,
    count,
    density:
      totalWords > 0 ? Number(((count / totalWords) * 100).toFixed(2)) : 0,
    totalWords,
  };
}
