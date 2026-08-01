import { NextRequest, NextResponse } from "next/server";
import {
  enforceToolRateLimit,
  parseToolUrl,
  reportToolFailure,
} from "@/lib/tools/api-helpers";
import { checkAdsenseReadiness } from "@/lib/tools/check-adsense-readiness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const parsed = parseToolUrl(request);
  if (!parsed.ok) return parsed.response;

  const limited = enforceToolRateLimit(request, parsed.domain);
  if (limited) return limited;

  try {
    const origin = new URL(parsed.url).origin;
    const result = await checkAdsenseReadiness(origin, parsed.domain);
    return NextResponse.json(result);
  } catch (error) {
    await reportToolFailure("adsense-readiness", error, {
      domain: parsed.domain,
      url: parsed.url,
    });
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "AdSense readiness check failed",
      },
      { status: 502 }
    );
  }
}
