"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ToolError,
  ToolStat,
  UrlToolForm,
} from "@/components/tools/url-tool-form";

type Crawler = {
  name: string;
  mentioned: boolean;
  blocked: boolean;
  status: string;
  message: string;
};

type Result =
  | {
      success: true;
      domain: string;
      origin: string;
      present: boolean;
      url: string;
      content: string | null;
      allowsIndexing: boolean | null;
      sitemapDirectives: string[];
      aiCrawlers: Crawler[];
      status: string;
      message: string;
    }
  | { success: false; error: string };

export function RobotsCheckerForm() {
  const [result, setResult] = useState<Result | null>(null);

  return (
    <div className="space-y-6">
      <UrlToolForm
        defaultUrl="https://stripe.com"
        placeholder="domain.com or https://example.com"
        submitLabel="Check robots.txt"
        loadingLabel="Fetching…"
        onResult={async (url) => {
          setResult(null);
          try {
            const res = await fetch(
              `/api/robots?url=${encodeURIComponent(url)}`
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
          <div className="grid gap-3 sm:grid-cols-3">
            <ToolStat
              label="File"
              value={result.present ? "Found" : "Missing"}
            />
            <ToolStat
              label="Crawl-all"
              value={
                result.allowsIndexing === null
                  ? "Unknown"
                  : result.allowsIndexing
                    ? "Allowed"
                    : "Blocked"
              }
            />
            <ToolStat
              label="Sitemaps"
              value={String(result.sitemapDirectives.length)}
            />
          </div>

          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {result.message}
          </p>

          <p className="break-all font-mono text-xs text-slate-500 dark:text-slate-400">
            {result.url}
          </p>

          {result.sitemapDirectives.length > 0 ? (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Sitemap directives
              </p>
              <ul className="mt-2 space-y-1">
                {result.sitemapDirectives.map((s) => (
                  <li
                    key={s}
                    className="break-all font-mono text-xs text-slate-700 dark:text-slate-200"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              AI crawlers
            </p>
            <ul className="mt-2 divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-300/80 dark:divide-slate-700 dark:border-slate-700">
              {result.aiCrawlers.map((c) => (
                <li
                  key={c.name}
                  className="grid gap-1 px-3 py-2.5 sm:grid-cols-[7rem_1fr] sm:items-baseline"
                >
                  <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-50">
                    {c.name}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    {c.blocked ? (
                      <span className="font-semibold text-rose-700 dark:text-rose-300">
                        Blocked ·{" "}
                      </span>
                    ) : c.mentioned ? (
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                        Allowed ·{" "}
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-500">
                        Default ·{" "}
                      </span>
                    )}
                    {c.message}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {result.content ? (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Preview
              </p>
              <pre className="mt-2 max-h-64 overflow-auto rounded-md border border-slate-300/80 bg-[color:var(--surface)] p-3 font-mono text-[11px] leading-relaxed text-slate-700 dark:border-slate-700 dark:text-slate-300">
                {result.content}
              </pre>
            </div>
          ) : null}

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Full technical + GEO report for{" "}
            <span className="font-medium">{result.domain}</span>:{" "}
            <Link
              href={`/audit/${result.domain}`}
              className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              Open audit →
            </Link>
          </p>
        </div>
      ) : null}
    </div>
  );
}
