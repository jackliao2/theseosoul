import { NextRequest, NextResponse } from "next/server";
import {
  checkNoindex,
  FetchTimeoutError,
} from "@/lib/tools/check-noindex";
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
    const result = await checkNoindex(parsed.url, parsed.domain);
    return NextResponse.json(result);
  } catch (error) {
    const timedOut = error instanceof FetchTimeoutError;
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check indexing directives",
      },
      { status: timedOut ? 504 : 502 }
    );
  }
}
