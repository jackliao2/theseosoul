import { NextRequest, NextResponse } from "next/server";
import { analyzeRobots } from "@/lib/audit/robots";
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
    const origin = new URL(parsed.url).origin;
    const robots = await analyzeRobots(origin);

    return NextResponse.json({
      success: true,
      domain: parsed.domain,
      origin,
      ...robots,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch robots.txt",
      },
      { status: 502 }
    );
  }
}
