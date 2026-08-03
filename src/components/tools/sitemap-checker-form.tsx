"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ToolError,
  ToolStat,
  UrlToolForm,
} from "@/components/tools/url-tool-form";
import { auditReportHref } from "@/lib/url";
import { cn } from "@/lib/utils";

type Probe = {
  url: string;
  present: boolean;
  kind: string;
  httpOk: boolean;
  urlCount: number | null;
  samples: string[];
  bytes: number;
  note: string;
  parentUrl?: string;
};

type SampleCheck = {
  url: string;
  finalUrl: string;
  status: number;
  redirected: boolean;
  ok: boolean;
  note: string;
};

type Result =
  | {
      success: true;
      domain: string;
      origin: string;
      robotsPresent: boolean;
      robotsSitemapDirectives: string[];
      missingRobotsSitemaps: string[];
      probes: Probe[];
      nestedProbes: Probe[];
      sampleChecks: SampleCheck[];
      totalLocEstimate: number | null;
      summary: string;
      verdict: "pass" | "warn" | "fail";
    }
  | { success: false; error: string };

const VERDICT_STYLES = {
  pass: "border-emerald-300/80 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/30",
  warn: "border-amber-300/80 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/30",
  fail: "border-rose-300/80 bg-rose-50/80 dark:border-rose-800 dark:bg-rose-950/30",
} as const;

const VERDICT_TEXT = {
  pass: "text-emerald-800 dark:text-emerald-300",
  warn: "text-amber-800 dark:text-amber-300",
  fail: "text-rose-800 dark:text-rose-300",
} as const;

function ProbeRow({ p }: { p: Probe }) {
  return (
    <li className="space-y-2 px-3 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="break-all font-mono text-xs font-semibold text-teal-800 dark:text-teal-300">
          {p.url}
        </span>
        <span
          className={
            p.present
              ? "font-mono text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
              : "font-mono text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300"
          }
        >
          {p.present ? p.kind : "missing"}
        </span>
      </div>
      {p.parentUrl ? (
        <p className="font-mono text-[10px] text-slate-400">
          via {p.parentUrl}
        </p>
      ) : null}
      <p className="text-xs text-slate-600 dark:text-slate-300">
        {p.note}
        {p.urlCount != null ? ` · ${p.urlCount} <loc> entries` : ""}
      </p>
      {p.samples.length > 0 ? (
        <ul className="space-y-0.5">
          {p.samples.slice(0, 6).map((s) => (
            <li
              key={s}
              className="break-all font-mono text-[11px] text-slate-500 dark:text-slate-400"
            >
              {s}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function SitemapCheckerForm() {
  const [result, setResult] = useState<Result | null>(null);

  return (
    <div className="space-y-6">
      <UrlToolForm
        defaultUrl="https://stripe.com"
        placeholder="https://example.com"
        submitLabel="Check sitemap"
        loadingLabel="Checking…"
        onResult={async (url) => {
          setResult(null);
          try {
            const res = await fetch(
              `/api/sitemap-check?url=${encodeURIComponent(url)}`
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
            className={`rounded-md border px-3 py-3 ${VERDICT_STYLES[result.verdict]}`}
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sitemap status
            </p>
            <p
              className={`mt-1 font-display text-2xl font-bold capitalize ${VERDICT_TEXT[result.verdict]}`}
            >
              {result.verdict === "pass"
                ? "Found"
                : result.verdict === "warn"
                  ? "Partial"
                  : "Missing"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {result.summary}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <ToolStat
              label="Top-level"
              value={String(result.probes.filter((p) => p.present).length)}
            />
            <ToolStat
              label="Nested"
              value={String(
                result.nestedProbes.filter((p) => p.present).length
              )}
            />
            <ToolStat
              label="~ URLs"
              value={
                result.totalLocEstimate != null
                  ? String(result.totalLocEstimate)
                  : "—"
              }
            />
            <ToolStat
              label="Sample OK"
              value={
                result.sampleChecks.length
                  ? `${result.sampleChecks.filter((s) => s.ok).length}/${result.sampleChecks.length}`
                  : "—"
              }
            />
          </div>

          {result.robotsSitemapDirectives.length > 0 ? (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                From robots.txt
              </p>
              <ul className="mt-2 space-y-1">
                {result.robotsSitemapDirectives.map((d) => {
                  let absolute = d;
                  try {
                    absolute = new URL(d, result.origin).toString();
                  } catch {
                    /* keep d */
                  }
                  const isMissing =
                    result.missingRobotsSitemaps.includes(absolute);
                  return (
                    <li
                      key={d}
                      className="break-all font-mono text-xs text-slate-700 dark:text-slate-200"
                    >
                      {d}
                      {isMissing ? (
                        <span className="ml-2 text-rose-600 dark:text-rose-300">
                          (unreachable)
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {result.robotsPresent
                ? "robots.txt has no Sitemap: directives."
                : "robots.txt was not found."}
            </p>
          )}

          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Top-level probes
            </p>
            <ul className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-300/80 dark:divide-slate-700 dark:border-slate-700">
              {result.probes.map((p) => (
                <ProbeRow key={p.url} p={p} />
              ))}
            </ul>
          </div>

          {result.nestedProbes.length > 0 ? (
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Nested sitemaps
              </p>
              <ul className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-300/80 dark:divide-slate-700 dark:border-slate-700">
                {result.nestedProbes.map((p) => (
                  <ProbeRow key={`${p.parentUrl}-${p.url}`} p={p} />
                ))}
              </ul>
            </div>
          ) : null}

          {result.sampleChecks.length > 0 ? (
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Sample URL checks
              </p>
              <ul className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-300/80 dark:divide-slate-700 dark:border-slate-700">
                {result.sampleChecks.map((s) => (
                  <li key={s.url} className="space-y-1 px-3 py-2.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="break-all font-mono text-xs text-slate-700 dark:text-slate-200">
                        {s.url}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[10px] font-semibold uppercase tracking-wide",
                          s.ok
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-rose-700 dark:text-rose-300"
                        )}
                      >
                        {s.status || "err"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {s.note}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

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
              href={auditReportHref(result.domain, result.origin)}
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
