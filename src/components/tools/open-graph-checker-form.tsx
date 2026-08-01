"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ToolError,
  ToolStat,
  UrlToolForm,
} from "@/components/tools/url-tool-form";
import { auditReportHref } from "@/lib/url";

type CheckItem = {
  key: string;
  present: boolean;
  value: string | null;
  required: boolean;
};

type Result =
  | {
      success: true;
      domain: string;
      finalUrl: string;
      pageTitle: string | null;
      summary: string;
      score: {
        label: string;
        requiredOk: boolean;
        presentCount: number;
        total: number;
      };
      checklist: CheckItem[];
      openGraph: { tags: Record<string, string> };
      twitter: { tags: Record<string, string>; present: boolean; message: string };
    }
  | { success: false; error: string };

export function OpenGraphCheckerForm() {
  const [result, setResult] = useState<Result | null>(null);

  return (
    <div className="space-y-6">
      <UrlToolForm
        defaultUrl="https://stripe.com"
        placeholder="https://example.com/page"
        submitLabel="Check Open Graph"
        loadingLabel="Fetching…"
        onResult={async (url) => {
          setResult(null);
          try {
            const res = await fetch(
              `/api/open-graph?url=${encodeURIComponent(url)}`
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
              result.score.label === "Complete"
                ? "rounded-md border border-emerald-300/80 bg-emerald-50/80 px-3 py-3 dark:border-emerald-800 dark:bg-emerald-950/30"
                : result.score.label === "Partial"
                  ? "rounded-md border border-amber-300/80 bg-amber-50/80 px-3 py-3 dark:border-amber-800 dark:bg-amber-950/30"
                  : "rounded-md border border-rose-300/80 bg-rose-50/80 px-3 py-3 dark:border-rose-800 dark:bg-rose-950/30"
            }
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Open Graph
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
              {result.score.label}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {result.summary} · {result.score.presentCount}/{result.score.total}{" "}
              common tags.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ToolStat
              label="Required trio"
              value={result.score.requiredOk ? "OK" : "Missing"}
            />
            <ToolStat
              label="Twitter cards"
              value={result.twitter.present ? "Found" : "None"}
            />
            <ToolStat label="Domain" value={result.domain} />
          </div>

          {/* Social preview */}
          <div className="overflow-hidden rounded-md border border-slate-300/80 dark:border-slate-700">
            {result.openGraph.tags["og:image"] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.openGraph.tags["og:image"]}
                alt=""
                className="aspect-[1.91/1] w-full object-cover bg-slate-100 dark:bg-slate-900"
              />
            ) : (
              <div className="flex aspect-[1.91/1] items-center justify-center bg-slate-100 text-xs text-slate-500 dark:bg-slate-900">
                No og:image
              </div>
            )}
            <div className="space-y-1 border-t border-slate-200 px-3 py-2.5 dark:border-slate-700">
              <p className="truncate text-[11px] uppercase tracking-wide text-slate-500">
                {result.openGraph.tags["og:site_name"] ?? result.domain}
              </p>
              <p className="line-clamp-2 font-display text-sm font-semibold text-slate-900 dark:text-slate-50">
                {result.openGraph.tags["og:title"] ??
                  result.pageTitle ??
                  "Missing og:title"}
              </p>
              <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                {result.openGraph.tags["og:description"] ??
                  "Missing og:description"}
              </p>
            </div>
          </div>

          <ul className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-300/80 dark:divide-slate-700 dark:border-slate-700">
            {result.checklist.map((item) => (
              <li
                key={item.key}
                className="grid gap-1 px-3 py-2.5 sm:grid-cols-[9rem_1fr] sm:items-baseline"
              >
                <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {item.key}
                  {item.required ? (
                    <span className="ml-1 text-[10px] text-slate-400">req</span>
                  ) : null}
                </span>
                <span className="break-all text-xs text-slate-600 dark:text-slate-300">
                  {item.present ? (
                    item.value
                  ) : (
                    <span className="font-semibold text-rose-700 dark:text-rose-300">
                      Missing
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          {result.twitter.present ? (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Twitter Card
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {Object.entries(result.twitter.tags).map(([k, v]) => (
                  <li key={k}>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {k}
                    </span>
                    <span className="mx-2 text-slate-300">·</span>
                    <span className="break-all">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {result.twitter.message}
            </p>
          )}

          <p className="break-all font-mono text-xs text-slate-500">
            {result.finalUrl}
          </p>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Also try{" "}
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
