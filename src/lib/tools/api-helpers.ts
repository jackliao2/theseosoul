import { NextRequest, NextResponse } from "next/server";
import { checkAuditRateLimit, clientIpFromHeaders } from "@/lib/audit/limit";
import { normalizeUrl } from "@/lib/url";

export function parseToolUrl(request: NextRequest):
  | { ok: true; url: string; domain: string; hostname: string }
  | { ok: false; response: NextResponse } {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Missing url parameter" },
        { status: 400 }
      ),
    };
  }

  try {
    const normalized = normalizeUrl(raw);
    return { ok: true, ...normalized };
  } catch (error) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Invalid URL",
        },
        { status: 400 }
      ),
    };
  }
}

export function enforceToolRateLimit(
  request: NextRequest,
  domain: string
): NextResponse | null {
  const ip = clientIpFromHeaders(request.headers);
  const limit = checkAuditRateLimit(ip, domain);
  if (!limit.ok) {
    const res = NextResponse.json(
      { success: false, error: "Rate limited — try again shortly." },
      { status: 429 }
    );
    res.headers.set("Retry-After", String(limit.retryAfterSec));
    return res;
  }
  return null;
}
