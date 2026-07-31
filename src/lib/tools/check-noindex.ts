import * as cheerio from "cheerio";
import { FetchTimeoutError, fetchHtml } from "@/lib/audit/fetch";

export type NoindexDirective = {
  source: "meta-robots" | "meta-googlebot" | "x-robots-tag";
  content: string;
  noindex: boolean;
  nofollow: boolean;
};

export type NoindexCheckResult = {
  success: true;
  domain: string;
  requestedUrl: string;
  finalUrl: string;
  status: number;
  title: string | null;
  indexable: boolean;
  summary: string;
  directives: NoindexDirective[];
};

function parseDirectiveFlags(content: string): {
  noindex: boolean;
  nofollow: boolean;
} {
  const lower = content.toLowerCase();
  const tokens = lower.split(/[,\s]+/).filter(Boolean);
  const has = (t: string) => tokens.includes(t);
  return {
    noindex: has("noindex") || has("none"),
    nofollow: has("nofollow") || has("none"),
  };
}

export async function checkNoindex(
  url: string,
  domain: string
): Promise<NoindexCheckResult> {
  const { html, finalUrl, status, headers } = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title = $("title").first().text().trim() || null;

  const directives: NoindexDirective[] = [];

  const metaRobots = $('meta[name="robots"]').attr("content")?.trim();
  if (metaRobots) {
    const flags = parseDirectiveFlags(metaRobots);
    directives.push({
      source: "meta-robots",
      content: metaRobots,
      ...flags,
    });
  }

  const metaGooglebot = $('meta[name="googlebot"]').attr("content")?.trim();
  if (metaGooglebot) {
    const flags = parseDirectiveFlags(metaGooglebot);
    directives.push({
      source: "meta-googlebot",
      content: metaGooglebot,
      ...flags,
    });
  }

  const xRobots = headers["x-robots-tag"];
  if (xRobots) {
    const flags = parseDirectiveFlags(xRobots);
    directives.push({
      source: "x-robots-tag",
      content: xRobots,
      ...flags,
    });
  }

  const blocked = directives.some((d) => d.noindex);
  const indexable = !blocked;

  let summary: string;
  if (directives.length === 0) {
    summary =
      "No robots meta or X-Robots-Tag found — crawlers typically treat the page as index,follow.";
  } else if (blocked) {
    const sources = directives
      .filter((d) => d.noindex)
      .map((d) => d.source)
      .join(", ");
    summary = `Page is marked noindex via ${sources}. Search engines should not index this URL.`;
  } else {
    summary = `Indexing allowed. Found directive(s) without noindex: ${directives
      .map((d) => d.content)
      .join(" · ")}.`;
  }

  return {
    success: true,
    domain,
    requestedUrl: url,
    finalUrl,
    status,
    title,
    indexable,
    summary,
    directives,
  };
}

export { FetchTimeoutError };
