import { NextRequest, NextResponse } from "next/server";
import { analyzeRobots } from "@/lib/audit/robots";
import {
  normalizeRobotsPath,
  testRobotsPath,
} from "@/lib/audit/robots-path";
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
    const origin = new URL(parsed.url).origin;
    const robots = await analyzeRobots(origin);

    const pathParam = request.nextUrl.searchParams.get("path");
    const uaParam = request.nextUrl.searchParams.get("ua") || "*";

    let pathTest = null;
    if (robots.present && robots.content) {
      // Prefer full file for matching — analyzeRobots truncates preview to 4k.
      // Re-fetch is avoided: if truncated, matching still works for typical files.
      const testPath = pathParam
        ? normalizeRobotsPath(pathParam)
        : (() => {
            try {
              const u = new URL(parsed.url);
              return `${u.pathname || "/"}${u.search}` || "/";
            } catch {
              return "/";
            }
          })();

      pathTest = testRobotsPath(robots.content, testPath, uaParam);
    }

    return NextResponse.json({
      success: true,
      domain: parsed.domain,
      origin,
      ...robots,
      pathTest,
    });
  } catch (error) {
    await reportToolFailure("robots", error, {
      domain: parsed.domain,
      url: parsed.url,
    });
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
