"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DomainHistoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void import("@/lib/monitoring").then(({ captureException }) =>
      captureException(error, {
        digest: error.digest,
        boundary: "domain-history/error",
      })
    );
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <h1 className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">
        History lookup failed
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Internet Archive or WHOIS did not finish. Retry, or start from the
        domain history checker.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={reset}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
        <Button asChild variant="outline">
          <Link href="/tools/domain-history">
            <ArrowLeft className="h-4 w-4" />
            Domain history checker
          </Link>
        </Button>
      </div>
    </div>
  );
}
