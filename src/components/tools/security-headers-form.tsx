"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ToolError,
  ToolStat,
  UrlToolForm,
} from "@/components/tools/url-tool-form";

type Row = {
  id: string;
  label: string;
  header: string;
  present: boolean;
  value: string | null;
  weight: "core" | "extra";
};

type Result =
  | {
      success: true;
      domain: string;
      requestedUrl: string;
      finalUrl: string;
      status: number;
      https: boolean;
      score: number;
      summary: string;
      rows: Row[];
    }
  | { success: false; error: string };

export function SecurityHeadersForm() {
  const [result, setResult] = useState<Result | null>(null);

  return (
    <div className="space-y-6">
      <UrlToolForm
        defaultUrl="https://stripe.com"
        placeholder="https://example.com"
        submitLabel="Check headers"
        loadingLabel="Fetching…"
        onResult={async (url) => {
          setResult(null);
          try {
            const res = await fetch(
              `/api/security-headers?url=${encodeURIComponent(url)}`
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
              result.score >= 80
                ? "rounded-md border border-emerald-300/80 bg-emerald-50/80 px-3 py-3 dark:border-emerald-800 dark:bg-emerald-950/30"
                : result.score >= 50
                  ? "rounded-md border border-amber-300/80 bg-amber-50/80 px-3 py-3 dark:border-amber-800 dark:bg-amber-950/30"
                  : "rounded-md border border-rose-300/80 bg-rose-50/80 px-3 py-3 dark:border-rose-800 dark:bg-rose-950/30"
            }
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Security headers
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
              {result.score}
              <span className="text-base font-semibold text-slate-500">
                /100
              </span>
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {result.summary}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ToolStat label="HTTP" value={String(result.status)} />
            <ToolStat label="HTTPS" value={result.https ? "Yes" : "No"} />
            <ToolStat
              label="Present"
              value={`${result.rows.filter((r) => r.present).length}/${result.rows.length}`}
            />
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Final URL
            </p>
            <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-200">
              {result.finalUrl}
            </p>
          </div>

          <ul className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-300/80 dark:divide-slate-700 dark:border-slate-700">
            {result.rows.map((row) => (
              <li key={row.id} className="space-y-1 px-3 py-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    {row.label}
                    {row.weight === "extra" ? (
                      <span className="ml-2 font-mono text-[10px] uppercase tracking-wide text-slate-400">
                        extra
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={
                      row.present
                        ? "font-mono text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
                        : "font-mono text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300"
                    }
                  >
                    {row.present ? "present" : "missing"}
                  </span>
                </div>
                {row.value ? (
                  <p className="break-all font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {row.value}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Related:{" "}
            <Link
              href="/tools/ssl-checker"
              className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              SSL days checker
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
