"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditErrorResult } from "@/lib/audit/types";
import { auditHref, normalizeUrl } from "@/lib/url";

const titles: Record<AuditErrorResult["code"], string> = {
  INVALID_URL: "Invalid URL",
  TIMEOUT: "Site timed out",
  UNREACHABLE: "Website unreachable",
  PARSE_ERROR: "Couldn’t parse page",
  RATE_LIMITED: "Slow down",
  UNKNOWN: "Audit unavailable",
};

const friendly: Record<AuditErrorResult["code"], string> = {
  INVALID_URL: "That doesn’t look like a valid website URL.",
  TIMEOUT:
    "The site took too long to respond. Enterprise sites with a WAF sometimes need a second try.",
  UNREACHABLE:
    "We couldn’t load a page from this domain. It may be offline, not set up for the web, or blocking automated checks.",
  PARSE_ERROR: "We fetched the page but couldn’t parse its HTML.",
  RATE_LIMITED: "You’re auditing a bit too fast — wait a minute and try again.",
  UNKNOWN: "Something unexpected went wrong during the audit.",
};

/** Hide Undici noise / duplicates of the friendly headline. */
function detailForDisplay(error: AuditErrorResult): string | null {
  const detail = error.error?.trim();
  if (!detail) return null;
  if (/^fetch failed$/i.test(detail)) return null;

  const headline = friendly[error.code].toLowerCase();
  if (detail.toLowerCase() === headline) return null;

  // Prefer the humanized detail as the main body when it's richer than the headline.
  return detail;
}

function retryHref(error: AuditErrorResult): string {
  if (error.url) {
    try {
      return auditHref(normalizeUrl(error.url));
    } catch {
      /* fall through */
    }
  }
  return `/audit/${error.domain}`;
}

export function AuditError({ error }: { error: AuditErrorResult }) {
  const router = useRouter();
  const detail = detailForDisplay(error);

  function retry() {
    const target = new URL(retryHref(error), window.location.origin);
    target.searchParams.set("t", String(Date.now()));
    router.push(`${target.pathname}${target.search}${target.hash}`);
  }

  return (
    <Card className="border-rose-200 dark:border-rose-900/50">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <CardTitle>{titles[error.code]}</CardTitle>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {detail ?? friendly[error.code]}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-950/60">
          <p>
            <span className="font-medium text-slate-500">Domain:</span>{" "}
            <span className="text-slate-900 dark:text-white">{error.domain}</span>
          </p>
          {error.url ? (
            <p className="mt-1 break-all">
              <span className="font-medium text-slate-500">URL:</span>{" "}
              <span className="text-slate-900 dark:text-white">{error.url}</span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={retry}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
