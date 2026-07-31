import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { FetchTimeoutError, fetchHtml } from "@/lib/audit/fetch";
import { parseOpenGraph, parseTwitterCards } from "@/lib/audit/parse";
import {
  enforceToolRateLimit,
  parseToolUrl,
} from "@/lib/tools/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const OG_KEYS = [
  "og:title",
  "og:description",
  "og:image",
  "og:url",
  "og:type",
  "og:site_name",
] as const;

export async function GET(request: NextRequest) {
  const parsed = parseToolUrl(request);
  if (!parsed.ok) return parsed.response;

  const limited = enforceToolRateLimit(request, parsed.domain);
  if (limited) return limited;

  try {
    const { html, finalUrl, status } = await fetchHtml(parsed.url);
    const $ = cheerio.load(html);
    const openGraph = parseOpenGraph($);
    const twitter = parseTwitterCards($);
    const title = $("title").first().text().trim() || null;

    const checklist = OG_KEYS.map((key) => ({
      key,
      present: Boolean(openGraph.tags[key]),
      value: openGraph.tags[key] ?? null,
      required: key === "og:title" || key === "og:description" || key === "og:image",
    }));

    const requiredOk = checklist
      .filter((c) => c.required)
      .every((c) => c.present);

    return NextResponse.json({
      success: true,
      domain: parsed.domain,
      requestedUrl: parsed.url,
      finalUrl,
      status,
      pageTitle: title,
      openGraph,
      twitter,
      checklist,
      score: {
        label: !openGraph.present
          ? "Missing"
          : requiredOk
            ? "Complete"
            : "Partial",
        requiredOk,
        presentCount: checklist.filter((c) => c.present).length,
        total: checklist.length,
      },
      summary: openGraph.message,
    });
  } catch (error) {
    const timedOut = error instanceof FetchTimeoutError;
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check Open Graph tags",
      },
      { status: timedOut ? 504 : 502 }
    );
  }
}
