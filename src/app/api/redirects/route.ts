import { NextRequest, NextResponse } from "next/server";
import {
  FetchTimeoutError,
  traceRedirects,
} from "@/lib/audit/fetch";
import { clientIpFromHeaders, checkAuditRateLimit } from "@/lib/audit/limit";
import { reportToolFailure } from "@/lib/tools/api-helpers";
import { normalizeUrl } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) {
    return NextResponse.json(
      { success: false, error: "Missing url parameter" },
      { status: 400 }
    );
  }

  let normalized: ReturnType<typeof normalizeUrl>;
  try {
    normalized = normalizeUrl(raw);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Invalid URL",
      },
      { status: 400 }
    );
  }

  const ip = clientIpFromHeaders(request.headers);
  const limit = checkAuditRateLimit(ip, normalized.domain);
  if (!limit.ok) {
    const res = NextResponse.json(
      { success: false, error: "Rate limited — try again shortly." },
      { status: 429 }
    );
    res.headers.set("Retry-After", String(limit.retryAfterSec));
    return res;
  }

  try {
    const result = await traceRedirects(normalized.url);
    // redirectChain also includes the final non-redirect response for display.
    // A hop is an actual redirect, not the final landing request.
    const hops = result.redirectChain.filter(
      ({ status }) => status >= 300 && status < 400
    ).length;
    return NextResponse.json({
      success: true,
      domain: normalized.domain,
      startUrl: result.startUrl,
      finalUrl: result.finalUrl,
      status: result.status,
      hops,
      redirectChain: result.redirectChain,
      note:
        hops > 3
          ? "Long chain — prefer linking to the final URL."
          : hops > 0
            ? "Redirects found — fine if intentional (HTTP→HTTPS / www)."
            : "No redirect hops — request landed on the start URL.",
    });
  } catch (error) {
    await reportToolFailure("redirects", error, {
      domain: normalized.domain,
      url: normalized.url,
    });
    const timedOut = error instanceof FetchTimeoutError;
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to trace redirects",
      },
      { status: timedOut ? 504 : 502 }
    );
  }
}
