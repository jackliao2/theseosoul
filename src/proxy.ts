import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  type AuditRouteSearchParams,
  targetFromAuditRoute,
} from "@/lib/url";

const AUDIT_PREFIX = "/audit/";

function routeSearchParams(searchParams: URLSearchParams): AuditRouteSearchParams {
  const result: AuditRouteSearchParams = {};

  for (const [key, value] of searchParams) {
    const current = result[key];
    if (current === undefined) {
      result[key] = value;
    } else if (Array.isArray(current)) {
      current.push(value);
    } else {
      result[key] = [current, value];
    }
  }

  return result;
}

/** Reject malformed audit URLs before the route's loading shell starts streaming. */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith(AUDIT_PREFIX)) return NextResponse.next();

  const target = pathname.slice(AUDIT_PREFIX.length).split("/");

  try {
    targetFromAuditRoute(target, routeSearchParams(request.nextUrl.searchParams));
    return NextResponse.next();
  } catch {
    const destination = request.nextUrl.clone();
    destination.pathname = "/_not-found";
    destination.search = "";
    return NextResponse.rewrite(destination, { status: 404 });
  }
}

export const config = {
  matcher: "/audit/:path+",
};
