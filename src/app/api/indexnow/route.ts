import { NextRequest, NextResponse } from "next/server";
import { submitIndexNow, submitSitemapToIndexNow } from "@/lib/indexnow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: NextRequest): boolean {
  const secret = process.env.INDEXNOW_SUBMIT_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  const query = request.nextUrl.searchParams.get("secret");
  return query === secret;
}

/**
 * Notify IndexNow (Bing and partners) about sitemap URLs or a custom list.
 * Requires INDEXNOW_SUBMIT_SECRET. Does not auto-submit random /audit pages.
 */
export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      urls?: string[];
    };
    const result =
      body.urls?.length
        ? await submitIndexNow(body.urls)
        : await submitSitemapToIndexNow();

    return NextResponse.json(
      {
        success: result.ok,
        status: result.status,
        body: result.body,
      },
      { status: result.ok ? 200 : 502 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "IndexNow submit failed",
      },
      { status: 502 }
    );
  }
}
