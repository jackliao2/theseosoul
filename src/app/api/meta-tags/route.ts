import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { FetchTimeoutError, fetchHtml } from "@/lib/audit/fetch";
import {
  parseHeadings,
  parseMetaDescription,
  parseMetaTitle,
  parseRobotsMeta,
} from "@/lib/audit/parse";
import {
  enforceToolRateLimit,
  parseToolUrl,
  reportToolFailure,
} from "@/lib/tools/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const parsed = parseToolUrl(request);
  if (!parsed.ok) return parsed.response;

  const limited = enforceToolRateLimit(request, parsed.domain);
  if (limited) return limited;

  try {
    const { html, finalUrl, status, headers } = await fetchHtml(parsed.url);
    const $ = cheerio.load(html);
    const title = parseMetaTitle($);
    const description = parseMetaDescription($);
    const robotsMeta = parseRobotsMeta($);
    const headings = parseHeadings($);

    const lang =
      $("html").attr("lang")?.trim() ||
      $("html").attr("xml:lang")?.trim() ||
      null;
    const viewport =
      $('meta[name="viewport"]').attr("content")?.trim() || null;
    const charset =
      $("meta[charset]").attr("charset")?.trim() ||
      $('meta[http-equiv="Content-Type"]')
        .attr("content")
        ?.match(/charset=([^;]+)/i)?.[1]
        ?.trim() ||
      headers["content-type"]?.match(/charset=([^;]+)/i)?.[1]?.trim() ||
      null;

    const h1Items = headings.items.filter((h) => h.level === 1);
    const h1Texts = h1Items.map((h) => h.text).filter(Boolean);

    let hostname = parsed.domain;
    let redirected = false;
    try {
      const final = new URL(finalUrl);
      const requested = new URL(parsed.url);
      hostname = final.hostname.replace(/^www\./, "");
      redirected =
        final.hostname !== requested.hostname ||
        final.pathname.replace(/\/+$/, "") !==
          requested.pathname.replace(/\/+$/, "") ||
        final.search !== requested.search;
    } catch {
      // keep domain
    }

    const issues: string[] = [];
    if (title.status === "fail" || title.status === "warn") {
      issues.push(title.message);
    }
    if (description.status === "fail" || description.status === "warn") {
      issues.push(description.message);
    }
    if (h1Texts.length === 0) {
      issues.push("No H1 heading found on the page.");
    } else if (h1Texts.length > 1) {
      issues.push(`Multiple H1 headings (${h1Texts.length}) — prefer one.`);
    }
    if (!lang) {
      issues.push('Missing html lang attribute (e.g. lang="en").');
    }
    if (!viewport) {
      issues.push("Missing viewport meta tag (hurts mobile SEO).");
    }
    if (!charset) {
      issues.push("No charset declared in HTML or Content-Type.");
    }
    if (robotsMeta.status === "fail") {
      issues.push(robotsMeta.message);
    }

    const h1Status =
      h1Texts.length === 1 ? "pass" : h1Texts.length === 0 ? "fail" : "warn";

    return NextResponse.json({
      success: true,
      domain: parsed.domain,
      hostname,
      requestedUrl: parsed.url,
      finalUrl,
      status,
      redirected,
      title,
      description,
      robotsMeta,
      h1: {
        count: h1Texts.length,
        texts: h1Texts.slice(0, 5),
        status: h1Status,
        message: headings.h1Message,
      },
      lang: {
        value: lang,
        status: lang ? "pass" : "fail",
        message: lang
          ? `html lang="${lang}"`
          : 'Missing html lang attribute.',
      },
      viewport: {
        value: viewport,
        status: viewport ? "pass" : "fail",
        message: viewport
          ? `Viewport: ${viewport}`
          : "Missing viewport meta tag.",
      },
      charset: {
        value: charset,
        status: charset ? "pass" : "warn",
        message: charset
          ? `Charset: ${charset}`
          : "No charset declared.",
      },
      issues,
      summary:
        issues.length === 0
          ? "Title, description, H1, lang, and viewport look in good shape."
          : `${issues.length} issue(s) to review on this page’s meta/on-page signals.`,
    });
  } catch (error) {
    await reportToolFailure("meta-tags", error, {
      domain: parsed.domain,
      url: parsed.url,
    });
    const timedOut = error instanceof FetchTimeoutError;
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check meta tags",
      },
      { status: timedOut ? 504 : 502 }
    );
  }
}
