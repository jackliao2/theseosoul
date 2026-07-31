import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { FetchTimeoutError, fetchHtml } from "@/lib/audit/fetch";
import {
  parseMetaDescription,
  parseMetaTitle,
  parseRobotsMeta,
} from "@/lib/audit/parse";
import {
  enforceToolRateLimit,
  parseToolUrl,
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
    const { html, finalUrl, status } = await fetchHtml(parsed.url);
    const $ = cheerio.load(html);
    const title = parseMetaTitle($);
    const description = parseMetaDescription($);
    const robotsMeta = parseRobotsMeta($);
    let hostname = parsed.domain;
    try {
      hostname = new URL(finalUrl).hostname.replace(/^www\./, "");
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

    return NextResponse.json({
      success: true,
      domain: parsed.domain,
      hostname,
      requestedUrl: parsed.url,
      finalUrl,
      status,
      title,
      description,
      robotsMeta,
      issues,
      summary:
        issues.length === 0
          ? "Title and meta description look within common length bands."
          : `${issues.length} issue(s) to review on title/description.`,
    });
  } catch (error) {
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
