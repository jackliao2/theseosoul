import type * as cheerio from "cheerio";
import type { CheckStatus, PageTechResult } from "@/lib/audit/types";
import { fetchText } from "@/lib/audit/fetch";

export function parsePageTech(
  $: cheerio.CheerioAPI,
  html: string,
  pageUrl: string,
  headers: Record<string, string>
): Omit<PageTechResult, "sitemapUrl" | "sitemapPresent" | "sitemapSamples"> {
  const charset =
    $('meta[charset]').attr("charset")?.trim() ||
    $('meta[http-equiv="Content-Type"]')
      .attr("content")
      ?.match(/charset=([^;]+)/i)?.[1]
      ?.trim() ||
    headers["content-type"]?.match(/charset=([^;]+)/i)?.[1]?.trim() ||
    null;

  const viewport = $('meta[name="viewport"]').attr("content")?.trim() || null;
  const lang = $("html").attr("lang")?.trim() || null;
  const generator =
    $('meta[name="generator"]').attr("content")?.trim() || null;
  const htmlBytes = Buffer.byteLength(html, "utf8");
  const scriptCount = $("script").length;
  const stylesheetCount =
    $('link[rel="stylesheet"]').length + $("style").length;

  let hasHttps = true;
  try {
    hasHttps = new URL(pageUrl).protocol === "https:";
  } catch {
    hasHttps = false;
  }

  const xRobotsTag = headers["x-robots-tag"] ?? null;

  const issues: string[] = [];
  if (!charset) issues.push("charset");
  if (!viewport) issues.push("viewport");
  if (!lang) issues.push("lang");
  if (!hasHttps) issues.push("https");

  let status: CheckStatus = "pass";
  let message = "Core page technical signals look healthy.";
  if (issues.length >= 3) {
    status = "fail";
    message = `Missing technical signals: ${issues.join(", ")}.`;
  } else if (issues.length > 0) {
    status = "warn";
    message = `Improve: ${issues.join(", ")}.`;
  }

  return {
    charset,
    viewport,
    lang,
    generator,
    htmlBytes,
    scriptCount,
    stylesheetCount,
    hasHttps,
    headers,
    xRobotsTag,
    status,
    message,
  };
}

function parseSitemapSamples(content: string, limit = 5): string[] {
  const locs = Array.from(content.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)).map(
    (m) => m[1].trim()
  );
  return Array.from(new Set(locs)).slice(0, limit);
}

export async function checkSitemap(origin: string): Promise<{
  sitemapUrl: string;
  sitemapPresent: boolean;
  sitemapSamples: string[];
}> {
  const sitemapUrl = new URL("/sitemap.xml", origin).toString();
  const content = await fetchText(sitemapUrl, 4_000);
  const sitemapPresent = Boolean(
    content &&
      (content.includes("<urlset") ||
        content.includes("<sitemapindex") ||
        content.includes("<url"))
  );
  return {
    sitemapUrl,
    sitemapPresent,
    sitemapSamples: content && sitemapPresent ? parseSitemapSamples(content) : [],
  };
}

export async function enrichPageTech(
  partial: Omit<
    PageTechResult,
    "sitemapUrl" | "sitemapPresent" | "sitemapSamples"
  >,
  origin: string
): Promise<PageTechResult> {
  const { sitemapUrl, sitemapPresent, sitemapSamples } =
    await checkSitemap(origin);
  return { ...partial, sitemapUrl, sitemapPresent, sitemapSamples };
}
