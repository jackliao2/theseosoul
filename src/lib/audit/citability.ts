import type * as cheerio from "cheerio";
import type { CheckStatus } from "@/lib/audit/types";

export type CitabilitySignal = {
  id: string;
  title: string;
  message: string;
  status: CheckStatus;
};

const AUTHORITY_HOST =
  /\b(wikipedia\.org|gov|edu|nytimes\.com|bbc\.|reuters\.|nature\.com|sciencedirect\.|pubmed|who\.int|nih\.gov|un\.org|ft\.com|wsj\.com|theguardian\.com|harvard\.edu|mit\.edu|stanford\.edu)\b/i;

/** Heuristic GEO citability signals from live HTML (no LLM). */
export function analyzePageCitability(
  $: cheerio.CheerioAPI,
  schemaTypes: string[]
): CitabilitySignal[] {
  const signals: CitabilitySignal[] = [];
  const norm = schemaTypes.map((t) => t.toLowerCase());
  const hasType = (name: string) =>
    norm.some((t) => t === name || t.endsWith(`/${name}`));

  // Answer-first: first substantial paragraph
  const firstP =
    $("main p, article p, .content p, #content p, p")
      .toArray()
      .map((el) =>
        $(el)
          .text()
          .replace(/\s+/g, " ")
          .trim()
      )
      .find((t) => t.length >= 40) ?? "";

  const answerFirst =
    firstP.length >= 80 &&
    firstP.length <= 320 &&
    !/^(welcome|click|subscribe|cookie|sign up)/i.test(firstP);

  signals.push({
    id: "answer-first",
    title: "Answer-first opening",
    message: answerFirst
      ? "Opening paragraph looks concise and citation-friendly."
      : firstP
        ? "Opening copy is thin, long, or promo-heavy — lead with a direct answer."
        : "No substantial opening paragraph found.",
    status: answerFirst ? "pass" : "warn",
  });

  // Question-style headings
  const h2Texts = $("h2")
    .toArray()
    .map((el) => $(el).text().replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const questionHeads = h2Texts.filter((t) =>
    /\?$|^(what|why|how|when|where|who|which|can|does|is)\b/i.test(t)
  ).length;

  signals.push({
    id: "qa-headings",
    title: "Q&A-style headings",
    message:
      questionHeads > 0
        ? `${questionHeads} heading(s) look like questions AI can map to answers.`
        : "Few question-style H2s — FAQ / How-to headings help AI extraction.",
    status: questionHeads >= 2 ? "pass" : questionHeads === 1 ? "info" : "warn",
  });

  // Freshness
  const modified =
    $('meta[property="article:modified_time"]').attr("content") ||
    $('meta[property="og:updated_time"]').attr("content") ||
    $("time[datetime]").attr("datetime") ||
    null;
  let freshStatus: CheckStatus = "warn";
  let freshMsg = "No modified/published date found (time / article:modified_time).";
  if (modified) {
    const t = Date.parse(modified);
    if (!Number.isNaN(t)) {
      const days = (Date.now() - t) / (24 * 60 * 60 * 1000);
      if (days <= 180) {
        freshStatus = "pass";
        freshMsg = `Content date ~${Math.round(days)} days ago — relatively fresh.`;
      } else if (days <= 540) {
        freshStatus = "info";
        freshMsg = `Content date ~${Math.round(days / 30)} months ago — consider refreshing.`;
      } else {
        freshStatus = "warn";
        freshMsg = `Content looks stale (~${Math.round(days / 365)}y). AI prefers fresher sources.`;
      }
    } else {
      freshMsg = `Date found but unparseable: ${modified.slice(0, 40)}`;
    }
  }
  signals.push({
    id: "freshness",
    title: "Content freshness",
    message: freshMsg,
    status: freshStatus,
  });

  // Author / org proxies
  const hasAuthorMeta = Boolean(
    $('meta[name="author"]').attr("content") ||
      $('[rel="author"]').length ||
      $('[itemprop="author"]').length ||
      hasType("person")
  );
  const hasOrg = hasType("organization") || hasType("localbusiness");

  signals.push({
    id: "author",
    title: "Author / expert signal",
    message: hasAuthorMeta
      ? "Author meta or Person schema detected."
      : "No author meta / Person schema — weak E-E-A-T proxy for AI trust.",
    status: hasAuthorMeta ? "pass" : "warn",
  });

  signals.push({
    id: "organization",
    title: "Organization schema",
    message: hasOrg
      ? "Organization / LocalBusiness schema present."
      : "No Organization schema — brand identity harder for AI to ground.",
    status: hasOrg ? "pass" : "info",
  });

  // HowTo / Article
  signals.push({
    id: "howto",
    title: "HowTo schema",
    message: hasType("howto")
      ? "HowTo schema present — strong for step answers."
      : "No HowTo schema (optional for guides).",
    status: hasType("howto") ? "pass" : "info",
  });

  signals.push({
    id: "article-schema",
    title: "Article schema",
    message: hasType("article") || hasType("blogposting") || hasType("newsarticle")
      ? "Article-family schema present."
      : "No Article schema on this page.",
    status:
      hasType("article") || hasType("blogposting") || hasType("newsarticle")
        ? "pass"
        : "info",
  });

  // Outbound citation-like links
  const hrefs = $("a[href]")
    .toArray()
    .map((el) => $(el).attr("href") || "")
    .filter((h) => /^https?:\/\//i.test(h));
  const authorityHits = hrefs.filter((h) => AUTHORITY_HOST.test(h)).length;

  signals.push({
    id: "citations",
    title: "Outbound authority links",
    message:
      authorityHits > 0
        ? `${authorityHits} link(s) toward common authority hosts — citation-friendly.`
        : "Few/no links to known authority hosts (edu/gov/major publishers).",
    status: authorityHits >= 2 ? "pass" : authorityHits === 1 ? "info" : "warn",
  });

  // Factual density proxy: numbers / % / years in body text
  const bodyText = $("main, article, body").first().text().replace(/\s+/g, " ");
  const factTokens = (
    bodyText.match(
      /\b\d{1,3}(?:,\d{3})*(?:\.\d+)?%?|\b(?:19|20)\d{2}\b|\$\d+/g
    ) || []
  ).length;
  const words = bodyText.split(/\s+/).filter(Boolean).length || 1;
  const factDensity = factTokens / Math.max(words / 100, 1);

  signals.push({
    id: "factual-density",
    title: "Factual density",
    message:
      factDensity >= 1.2
        ? `Solid data signals (~${factTokens} numbers/dates in body).`
        : `Low numeric/date density (~${factTokens}) — AI prefers citeable facts.`,
    status: factDensity >= 1.2 ? "pass" : factDensity >= 0.5 ? "info" : "warn",
  });

  return signals;
}
