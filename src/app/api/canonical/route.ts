import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { FetchTimeoutError, fetchHtml } from "@/lib/audit/fetch";
import { parseCanonical } from "@/lib/audit/parse";
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
    const canonical = parseCanonical($, finalUrl);

    let absoluteCanonical: string | null = null;
    let selfRef = false;
    let crossHost = false;

    if (canonical.href) {
      try {
        const abs = new URL(canonical.href, finalUrl);
        absoluteCanonical = abs.toString();
        const final = new URL(finalUrl);
        selfRef =
          abs.origin === final.origin &&
          abs.pathname.replace(/\/+$/, "") ===
            final.pathname.replace(/\/+$/, "") &&
          abs.search === final.search;
        crossHost =
          abs.hostname.replace(/^www\./, "") !==
          final.hostname.replace(/^www\./, "");
      } catch {
        absoluteCanonical = canonical.href;
      }
    }

    return NextResponse.json({
      success: true,
      domain: parsed.domain,
      requestedUrl: parsed.url,
      finalUrl,
      status,
      present: canonical.present,
      href: canonical.href,
      absoluteCanonical,
      matchesRequest: canonical.matchesRequest,
      selfRef,
      crossHost,
      checkStatus: canonical.status,
      message: canonical.message,
      summary: !canonical.present
        ? "No canonical link tag — search engines may pick a URL themselves."
        : selfRef
          ? "Canonical is self-referencing (usually ideal)."
          : crossHost
            ? "Canonical points to a different host — confirm this is intentional."
            : "Canonical differs from the final URL — common for www/HTTPS or pagination.",
    });
  } catch (error) {
    const timedOut = error instanceof FetchTimeoutError;
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check canonical tag",
      },
      { status: timedOut ? 504 : 502 }
    );
  }
}
