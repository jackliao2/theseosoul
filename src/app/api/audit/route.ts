import { NextRequest, NextResponse } from "next/server";
import { runGuardedAudit } from "@/lib/audit/guard";
import { clientIpFromHeaders } from "@/lib/audit/limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Vercel Pro/Hobby: allow slow target sites + parallel probes. */
export const maxDuration = 60;

function statusFor(result: Awaited<ReturnType<typeof runGuardedAudit>>): number {
  if (result.success) return 200;
  if (result.code === "INVALID_URL") return 400;
  if (result.code === "RATE_LIMITED") return 429;
  if (result.code === "TIMEOUT") return 504;
  return 502;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      {
        success: false,
        domain: "",
        url: null,
        error: "Missing required query parameter: url",
        code: "INVALID_URL",
      },
      { status: 400 }
    );
  }

  const result = await runGuardedAudit(
    url,
    clientIpFromHeaders(request.headers)
  );
  const response = NextResponse.json(result, { status: statusFor(result) });
  if (!result.success && result.code === "RATE_LIMITED") {
    response.headers.set("Retry-After", "60");
  }
  return response;
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        domain: "",
        url: null,
        error: "Invalid JSON body",
        code: "INVALID_URL",
      },
      { status: 400 }
    );
  }

  const url =
    typeof body === "object" &&
    body !== null &&
    "url" in body &&
    typeof (body as { url: unknown }).url === "string"
      ? (body as { url: string }).url
      : null;

  if (!url) {
    return NextResponse.json(
      {
        success: false,
        domain: "",
        url: null,
        error: "Missing required field: url",
        code: "INVALID_URL",
      },
      { status: 400 }
    );
  }

  const result = await runGuardedAudit(
    url,
    clientIpFromHeaders(request.headers)
  );
  const response = NextResponse.json(result, { status: statusFor(result) });
  if (!result.success && result.code === "RATE_LIMITED") {
    response.headers.set("Retry-After", "60");
  }
  return response;
}
