"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ToolError,
  ToolStat,
  UrlToolForm,
} from "@/components/tools/url-tool-form";
import { auditReportHref } from "@/lib/url";

type Result =
  | {
      success: true;
      domain: string;
      finalUrl: string;
      present: boolean;
      href: string | null;
      absoluteCanonical: string | null;
      selfRef: boolean;
      crossHost: boolean;
      matchesRequest: boolean | null;
      checkStatus: string;
      message: string;
      summary: string;
    }
  | { success: false; error: string };

export function CanonicalCheckerForm() {
  const [result, setResult] = useState<Result | null>(null);

  return (
    <div className="space-y-6">
      <UrlToolForm
        defaultUrl="https://www.github.com"
        placeholder="https://example.com/page"
        submitLabel="Check canonical"
        loadingLabel="Fetching…"
        onResult={async (url) => {
          setResult(null);
          try {
            const res = await fetch(
              `/api/canonical?url=${encodeURIComponent(url)}`
            );
            setResult((await res.json()) as Result);
          } catch {
            setResult({ success: false, error: "Network error — try again." });
          }
        }}
      />

      {result && !result.success ? <ToolError>{result.error}</ToolError> : null}

      {result && result.success ? (
        <div className="space-y-5">
          <div
            className={
              result.present && result.selfRef
                ? "rounded-md border border-emerald-300/80 bg-emerald-50/80 px-3 py-3 dark:border-emerald-800 dark:bg-emerald-950/30"
                : result.present
                  ? "rounded-md border border-amber-300/80 bg-amber-50/80 px-3 py-3 dark:border-amber-800 dark:bg-amber-950/30"
                  : "rounded-md border border-rose-300/80 bg-rose-50/80 px-3 py-3 dark:border-rose-800 dark:bg-rose-950/30"
            }
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Canonical
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
              {!result.present
                ? "Missing"
                : result.selfRef
                  ? "Self-referencing"
                  : "Present · differs"}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {result.summary}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ToolStat
              label="Tag"
              value={result.present ? "Found" : "Missing"}
            />
            <ToolStat
              label="Self-ref"
              value={result.selfRef ? "Yes" : "No"}
            />
            <ToolStat
              label="Cross-host"
              value={result.crossHost ? "Yes" : "No"}
            />
          </div>

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Final URL
              </dt>
              <dd className="mt-0.5 break-all font-mono text-xs text-slate-800 dark:text-slate-200">
                {result.finalUrl}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Canonical href
              </dt>
              <dd className="mt-0.5 break-all font-mono text-xs text-slate-800 dark:text-slate-200">
                {result.absoluteCanonical ?? result.href ?? "—"}
              </dd>
            </div>
          </dl>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            {result.message}
          </p>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Related:{" "}
            <Link
              href="/tools/meta-tag-checker"
              className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              Meta Tag Checker
            </Link>
            {" · "}
            <Link
              href={auditReportHref(result.domain, result.finalUrl)}
              className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              Full audit →
            </Link>
          </p>
        </div>
      ) : null}
    </div>
  );
}
