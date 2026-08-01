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
      hostname: string;
      requestedUrl: string;
      finalUrl: string | null;
      httpsFinal: boolean;
      available: boolean;
      validTo: string | null;
      daysRemaining: number | null;
      issuer: string | null;
      status: "pass" | "fail" | "warn" | "info";
      summary: string;
      redirectHops: Hop[];
    }
  | { success: false; error: string };

const STATUS_STYLES = {
  pass: "border-emerald-300/80 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/30",
  warn: "border-amber-300/80 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/30",
  fail: "border-rose-300/80 bg-rose-50/80 dark:border-rose-800 dark:bg-rose-950/30",
  info: "border-slate-300/80 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900/40",
} as const;

export function SslCheckerForm() {
  const [result, setResult] = useState<Result | null>(null);

  return (
    <div className="space-y-6">
      <UrlToolForm
        defaultUrl="https://stripe.com"
        placeholder="https://example.com"
        submitLabel="Check SSL"
        loadingLabel="Probing…"
        onResult={async (url) => {
          setResult(null);
          try {
            const res = await fetch(
              `/api/ssl-check?url=${encodeURIComponent(url)}`
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
            className={`rounded-md border px-3 py-3 ${STATUS_STYLES[result.status]}`}
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              TLS certificate
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
              {result.available && result.daysRemaining != null
                ? result.daysRemaining < 0
                  ? "Expired"
                  : `${result.daysRemaining} days`
                : "Unavailable"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {result.summary}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ToolStat
              label="Days left"
              value={
                result.daysRemaining == null
                  ? "—"
                  : String(result.daysRemaining)
              }
            />
            <ToolStat
              label="HTTPS final"
              value={result.httpsFinal ? "Yes" : "No"}
            />
            <ToolStat
              label="Issuer"
              value={result.issuer ?? "—"}
            />
          </div>

          {result.validTo ? (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Valid to
              </p>
              <p className="mt-1 font-mono text-xs text-slate-700 dark:text-slate-200">
                {new Date(result.validTo).toUTCString()}
              </p>
            </div>
          ) : null}

          {result.finalUrl ? (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Final URL
              </p>
              <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-200">
                {result.finalUrl}
              </p>
            </div>
          ) : null}

          {result.redirectHops.length > 0 ? (
            <ol className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-300/80 dark:divide-slate-700 dark:border-slate-700">
              {result.redirectHops.map((hop, i) => (
                <li
                  key={`${hop.url}-${i}`}
                  className="grid gap-1 px-3 py-2.5 sm:grid-cols-[4rem_1fr] sm:items-baseline"
                >
                  <span className="font-mono text-xs font-semibold text-teal-800 dark:text-teal-300">
                    {hop.status}
                  </span>
                  <span className="break-all font-mono text-xs text-slate-700 dark:text-slate-200">
                    {hop.url}
                  </span>
                </li>
              ))}
            </ol>
          ) : null}

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Related:{" "}
            <Link
              href="/tools/security-headers-checker"
              className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              Security headers
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
