"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ToolError,
  ToolStat,
  UrlToolForm,
} from "@/components/tools/url-tool-form";
import { auditReportHref } from "@/lib/url";

type Hop = { url: string; status: number };

type Result =
  | {
      success: true;
      domain: string;
      startUrl: string;
      finalUrl: string;
      status: number;
      hops: number;
      redirectChain: Hop[];
      note: string;
    }
  | { success: false; error: string };

export function RedirectCheckerForm() {
  const [result, setResult] = useState<Result | null>(null);

  return (
    <div className="space-y-6">
      <UrlToolForm
        defaultUrl="https://www.github.com"
        placeholder="https://example.com or www.example.com"
        submitLabel="Check redirects"
        loadingLabel="Tracing…"
        onResult={async (url) => {
          setResult(null);
          try {
            const res = await fetch(
              `/api/redirects?url=${encodeURIComponent(url)}`
            );
            setResult((await res.json()) as Result);
          } catch {
            setResult({ success: false, error: "Network error — try again." });
          }
        }}
      />

      {result && !result.success ? <ToolError>{result.error}</ToolError> : null}

      {result && result.success ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <ToolStat label="Hops" value={String(result.hops)} />
            <ToolStat label="Final status" value={String(result.status)} />
            <ToolStat
              label="Changed host?"
              value={
                new URL(result.startUrl).hostname ===
                new URL(result.finalUrl).hostname
                  ? "No"
                  : "Yes"
              }
            />
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {result.note}
          </p>
          <ol className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-300/80 dark:divide-slate-700 dark:border-slate-700">
            {result.redirectChain.map((hop, i) => (
              <li
                key={`${hop.url}-${i}`}
                className="grid gap-1 px-3 py-2.5 sm:grid-cols-[4rem_1fr] sm:items-baseline"
              >
                <span className="font-mono text-xs font-semibold text-teal-800 dark:text-teal-300">
                  {hop.status}
                </span>
                <span className="break-all font-mono text-xs text-slate-700 dark:text-slate-200">
                  {hop.url}
                  {i === result.redirectChain.length - 1 ? (
                    <span className="ml-2 text-[10px] font-sans font-semibold uppercase tracking-wide text-slate-500">
                      final
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Want the full technical report for{" "}
            <span className="font-medium">{result.domain}</span>?{" "}
            <Link
              href={auditReportHref(result.domain, result.finalUrl)}
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
