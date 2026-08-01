import { NextRequest, NextResponse } from "next/server";
import { runGuardedAudit } from "@/lib/audit/guard";
import { clientIpFromHeaders } from "@/lib/audit/limit";
import { captureException, captureMessage } from "@/lib/monitoring";

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

async function reportAuditFailure(
  result: Awaited<ReturnType<typeof runGuardedAudit>>,
  url: string
): Promise<void> {
  if (result.success) return;
  if (result.code === "INVALID_URL" || result.code === "RATE_LIMITED") return;
  const extra = {
    code: result.code,
    domain: result.domain,
    url,
    error: result.error,
  };
  if (result.code === "TIMEOUT") {
    await captureMessage(`Audit timeout: ${result.domain || url}`, extra);
    return;
  }
  await captureException(new Error(result.error || "Audit failed"), extra);
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
  await reportAuditFailure(result, url);
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
  await reportAuditFailure(result, url);
  const response = NextResponse.json(result, { status: statusFor(result) });
  if (!result.success && result.code === "RATE_LIMITED") {
    response.headers.set("Retry-After", "60");
  }
  return response;
}
