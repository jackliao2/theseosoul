import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  type AuditRouteSearchParams,
  targetFromAuditRoute,
} from "@/lib/url";

const AUDIT_PREFIX = "/audit/";

/**
 * Confirmed Network Solutions parking and parameter-spam routes from the
 * domain's previous life. These have no modern replacement and should leave
 * the index instead of being redirected into the current site.
 */
const LEGACY_GONE_PATHS = new Set([
  "/Build_a_Web_Site.cfm",
  "/Custom_Web_Design.cfm",
  "/Java_Programming_Tools.cfm",
  "/Quick_Web_Development_Tools.cfm",
  "/chatrpad.php",
  "/logpstatus.php",
  "/page.php",
  "/privacy_policy.php",
  "/search.php",
  "/search_caf.php",
]);

function isConfirmedLegacyPollution(pathname: string): boolean {
  return (
    LEGACY_GONE_PATHS.has(pathname) ||
    pathname.startsWith("/__media__/js/netsoltrademark.php") ||
    pathname.startsWith("/phpmyadmin/") ||
    pathname.startsWith("/rmgdsc/")
  );
}

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

  if (isConfirmedLegacyPollution(pathname)) {
    return new NextResponse("Gone\n", {
      status: 410,
      headers: {
        "cache-control": "public, max-age=0, s-maxage=86400",
        "content-type": "text/plain; charset=utf-8",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

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
  matcher: [
    "/audit/:path+",
    "/__media__/:path*",
    "/phpmyadmin/:path*",
    "/rmgdsc/:path*",
    "/Build_a_Web_Site.cfm",
    "/Custom_Web_Design.cfm",
    "/Java_Programming_Tools.cfm",
    "/Quick_Web_Development_Tools.cfm",
    "/chatrpad.php",
    "/logpstatus.php",
    "/page.php",
    "/privacy_policy.php",
    "/search.php",
    "/search_caf.php",
  ],
};
