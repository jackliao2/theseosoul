import { NextRequest, NextResponse } from "next/server";
import {
  analyzeDensity,
  analyzeDensityFromText,
  focusKeywordStats,
} from "@/lib/audit/density";
import { FetchTimeoutError, fetchHtml } from "@/lib/audit/fetch";
import {
  enforceToolRateLimit,
  parseToolUrl,
  reportToolFailure,
} from "@/lib/tools/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function topNgrams(
  byNgram: ReturnType<typeof analyzeDensity>["byNgram"],
  n: 1 | 2 | 3,
  limit = 25
) {
  return byNgram[n].slice(0, limit);
}

export async function GET(request: NextRequest) {
  const focus = request.nextUrl.searchParams.get("focus")?.trim() ?? "";
  const parsed = parseToolUrl(request);
  if (!parsed.ok) return parsed.response;

  const limited = enforceToolRateLimit(request, parsed.domain);
  if (limited) return limited;

  try {
    const { html, finalUrl, status } = await fetchHtml(parsed.url);
    const density = analyzeDensity(html);
    const focusStats = focus
      ? focusKeywordStats(html, focus, true)
      : null;

    return NextResponse.json({
      success: true,
      mode: "url",
      domain: parsed.domain,
      requestedUrl: parsed.url,
      finalUrl,
      status,
      totalWords: density.totalWords,
      message: density.message,
      densityStatus: density.status,
      focus: focusStats,
      unigrams: topNgrams(density.byNgram, 1),
      bigrams: topNgrams(density.byNgram, 2),
      trigrams: topNgrams(density.byNgram, 3),
    });
  } catch (error) {
    await reportToolFailure("density", error, {
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
            : "Failed to analyze keyword density",
      },
      { status: timedOut ? 504 : 502 }
    );
  }
}

/** Paste-text mode — no crawl, still lightly rate-limited by IP. */
export async function POST(request: NextRequest) {
  let body: { text?: string; focus?: string };
  try {
    body = (await request.json()) as { text?: string; focus?: string };
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length < 20) {
    return NextResponse.json(
      { success: false, error: "Paste at least ~20 characters of text." },
      { status: 400 }
    );
  }
  if (text.length > 200_000) {
    return NextResponse.json(
      { success: false, error: "Text too long (max ~200k characters)." },
      { status: 400 }
    );
  }

  const limited = enforceToolRateLimit(request, "paste-density");
  if (limited) return limited;

  const density = analyzeDensityFromText(text);
  const focus = typeof body.focus === "string" ? body.focus.trim() : "";
  const focusStats = focus ? focusKeywordStats(text, focus, false) : null;

  return NextResponse.json({
    success: true,
    mode: "paste",
    domain: null,
    requestedUrl: null,
    finalUrl: null,
    status: null,
    totalWords: density.totalWords,
    message: density.message,
    densityStatus: density.status,
    focus: focusStats,
    unigrams: topNgrams(density.byNgram, 1),
    bigrams: topNgrams(density.byNgram, 2),
    trigrams: topNgrams(density.byNgram, 3),
  });
}
