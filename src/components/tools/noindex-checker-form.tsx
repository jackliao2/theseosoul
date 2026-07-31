"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ToolError,
  ToolStat,
  UrlToolForm,
} from "@/components/tools/url-tool-form";

type Directive = {
  source: string;
  content: string;
  noindex: boolean;
  nofollow: boolean;
};

type Result =
  | {
      success: true;
      domain: string;
      requestedUrl: string;
      finalUrl: string;
      status: number;
      title: string | null;
      indexable: boolean;
      summary: string;
      directives: Directive[];
    }
  | { success: false; error: string };

const SOURCE_LABEL: Record<string, string> = {
  "meta-robots": "meta robots",
  "meta-googlebot": "meta googlebot",
  "x-robots-tag": "X-Robots-Tag",
};

export function NoindexCheckerForm() {
  const [result, setResult] = useState<Result | null>(null);

  return (
    <div className="space-y-6">
      <UrlToolForm
        defaultUrl="https://stripe.com"
        placeholder="https://example.com/page"
        submitLabel="Check noindex"
        loadingLabel="Fetching…"
        onResult={async (url) => {
          setResult(null);
          try {
            const res = await fetch(
              `/api/noindex?url=${encodeURIComponent(url)}`
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
              result.indexable
                ? "rounded-md border border-emerald-300/80 bg-emerald-50/80 px-3 py-3 dark:border-emerald-800 dark:bg-emerald-950/30"
                : "rounded-md border border-rose-300/80 bg-rose-50/80 px-3 py-3 dark:border-rose-800 dark:bg-rose-950/30"
            }
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Effective indexing
            </p>
            <p
              className={
                result.indexable
                  ? "mt-1 font-display text-2xl font-bold text-emerald-800 dark:text-emerald-300"
                  : "mt-1 font-display text-2xl font-bold text-rose-800 dark:text-rose-300"
              }
            >
              {result.indexable ? "Indexable" : "Noindex"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {result.summary}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ToolStat label="HTTP" value={String(result.status)} />
            <ToolStat
              label="Directives"
              value={String(result.directives.length)}
            />
            <ToolStat
              label="Nofollow"
              value={
                result.directives.some((d) => d.nofollow) ? "Yes" : "No"
              }
            />
          </div>

          {result.title ? (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Page title
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
                {result.title}
              </p>
            </div>
          ) : null}

          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Final URL
            </p>
            <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-200">
              {result.finalUrl}
            </p>
          </div>

          {result.directives.length > 0 ? (
            <ul className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-300/80 dark:divide-slate-700 dark:border-slate-700">
              {result.directives.map((d) => (
                <li
                  key={`${d.source}-${d.content}`}
                  className="grid gap-1 px-3 py-2.5 sm:grid-cols-[8rem_1fr] sm:items-baseline"
                >
                  <span className="font-mono text-xs font-semibold text-teal-800 dark:text-teal-300">
                    {SOURCE_LABEL[d.source] ?? d.source}
                  </span>
                  <span className="text-xs text-slate-700 dark:text-slate-200">
                    <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                      {d.content}
                    </code>
                    {d.noindex ? (
                      <span className="ml-2 font-semibold text-rose-700 dark:text-rose-300">
                        noindex
                      </span>
                    ) : null}
                    {d.nofollow ? (
                      <span className="ml-2 font-semibold text-amber-700 dark:text-amber-300">
                        nofollow
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No explicit robots directives on this URL.
            </p>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Also check crawl rules:{" "}
            <Link
              href="/tools/robots-txt-checker"
              className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              robots.txt Checker
            </Link>
            {" · "}
            <Link
              href={`/audit/${result.domain}`}
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
