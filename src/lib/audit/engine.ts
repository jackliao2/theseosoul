import { domainFromParam, normalizeUrl } from "@/lib/url";
import { analyzeDensity } from "@/lib/audit/density";
import { fetchHtml, FetchTimeoutError } from "@/lib/audit/fetch";
import { computeGeoScore } from "@/lib/audit/geo-score";
import { parseLinks } from "@/lib/audit/links";
import {
  loadDocument,
  parseCanonical,
  parseFavicon,
  parseHeadings,
  parseImages,
  parseKeywords,
  parseMetaDescription,
  parseMetaTitle,
  parseOpenGraph,
  parseRobotsMeta,
  parseTwitterCards,
} from "@/lib/audit/parse";
import { analyzeRobots } from "@/lib/audit/robots";
import {
  buildIssueChecks,
  buildIssues,
  buildSummary,
  computeScore,
} from "@/lib/audit/score";
import { rememberAudit } from "@/lib/audit/store";
import { parseHreflangs, parseStructuredData } from "@/lib/audit/structured";
import { buildSiteExtras } from "@/lib/audit/extras";
import { enrichPageTech, parsePageTech } from "@/lib/audit/tech";
import { lookupWhois } from "@/lib/audit/whois";
import type { AuditResponse, SocialResult } from "@/lib/audit/types";

export async function runAudit(input: string): Promise<AuditResponse> {
  let url: string;
  let domain: string;

  try {
    const normalized = input.includes("/")
      ? normalizeUrl(input)
      : domainFromParam(input);
    url = normalized.url;
    domain = normalized.domain;
  } catch (error) {
    return {
      success: false,
      domain: input.trim() || "unknown",
      url: null,
      error: error instanceof Error ? error.message : "Invalid URL",
      code: "INVALID_URL",
    };
  }

  try {
    const { html, finalUrl, headers, redirectChain } = await fetchHtml(url);
    const $ = loadDocument(html);

    const title = parseMetaTitle($);
    const description = parseMetaDescription($);
    const keywords = parseKeywords($);
    const favicon = parseFavicon($, finalUrl);
    const robotsMeta = parseRobotsMeta($);
    const canonical = parseCanonical($, finalUrl);
    const headings = parseHeadings($);
    const images = parseImages($);
    const openGraph = parseOpenGraph($);
    const twitter = parseTwitterCards($);
    const links = parseLinks($, finalUrl);
    const hreflangs = parseHreflangs($, finalUrl);
    const structured = parseStructuredData($);
    const density = analyzeDensity(html);
    const techPartial = parsePageTech($, html, finalUrl, headers);

    const socialStatus =
      openGraph.status === "fail"
        ? "fail"
        : openGraph.status === "pass" && twitter.status === "pass"
          ? "pass"
          : "warn";

    const social: SocialResult = {
      openGraph,
      twitter,
      status: socialStatus,
      message:
        openGraph.status === "pass"
          ? twitter.status === "pass"
            ? "Open Graph and Twitter Cards look solid."
            : "Open Graph present; Twitter Cards incomplete."
          : openGraph.message,
    };

    const final = new URL(finalUrl);
    const origin = final.origin;

    const [robots, tech, whois, extras] = await Promise.all([
      analyzeRobots(origin),
      enrichPageTech(techPartial, origin),
      lookupWhois(domain).catch(() => ({
        domain,
        createdAt: null,
        expiresAt: null,
        updatedAt: null,
        registrar: null,
        status: [] as string[],
        nameServers: [] as string[],
        ageYears: null,
        available: false as const,
        source: "none" as const,
        checkStatus: "warn" as const,
        message: "WHOIS lookup failed — skipped without blocking the audit.",
      })),
      buildSiteExtras({
        $,
        html,
        origin,
        hostname: final.hostname,
        domain,
        wordCount: density.totalWords,
        headers,
        hasHttps: techPartial.hasHttps,
        requestedUrl: url,
        finalUrl,
        schemaTypes: structured.types,
        redirectChain,
        title: title.content,
        h1Texts: headings.items
          .filter((h) => h.level === 1)
          .map((h) => h.text),
      }),
    ]);

    const geo = computeGeoScore({
      $,
      robots,
      structured,
      wordCount: density.totalWords,
      hasCanonical: canonical.present,
      hasOg: openGraph.present,
      titlePresent: Boolean(title.content),
      descriptionPresent: Boolean(description.content),
      llmsTxtPresent: extras.llmsTxt.present,
      faqSchemaPresent: extras.faqSchema.present,
    });

    const { score, grade } = computeScore({
      title: title.status,
      description: description.status,
      canonical: canonical.status,
      headings: headings.status,
      images: images.status,
      openGraph: openGraph.status,
      robots: robots.status,
      aiBlockedCount: robots.aiCrawlers.filter((c) => c.blocked).length,
    });

    const base = {
      success: true as const,
      domain,
      url: finalUrl,
      fetchedAt: new Date().toISOString(),
      title,
      description,
      keywords,
      favicon,
      robotsMeta,
      canonical,
      headings,
      images,
      openGraph,
      social,
      links,
      hreflangs,
      structured,
      density,
      geo,
      tech,
      whois,
      extras,
      robots,
    };

    const issueChecks = buildIssueChecks(base);
    const issues = buildIssues(base);
    const summary = buildSummary(domain, score, grade, issues);

    rememberAudit(domain);

    return {
      ...base,
      issueChecks,
      score,
      grade,
      issues,
      summary,
    };
  } catch (error) {
    if (error instanceof FetchTimeoutError) {
      return {
        success: false,
        domain,
        url,
        error: error.message,
        code: "TIMEOUT",
      };
    }

    const message =
      error instanceof Error ? error.message : "Unknown audit failure";

    const unreachable =
      /fetch failed|ENOTFOUND|ECONNREFUSED|ECONNRESET|certificate|HTTP\s[45]/i.test(
        message
      );

    return {
      success: false,
      domain,
      url,
      error: message,
      code: unreachable ? "UNREACHABLE" : "UNKNOWN",
    };
  }
}
