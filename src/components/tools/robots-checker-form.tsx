"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ToolError,
  ToolStat,
  UrlToolForm,
} from "@/components/tools/url-tool-form";
import {
  ROBOTS_TEST_AGENTS,
  testRobotsPath,
} from "@/lib/audit/robots-path";
import { auditReportHref } from "@/lib/url";
import { cn } from "@/lib/utils";

type Crawler = {
  name: string;
  mentioned: boolean;
  blocked: boolean;
  status: string;
  message: string;
};

type PathTest = {
  path: string;
  userAgent: string;
  allowed: boolean;
  matchedRule: {
    type: "allow" | "disallow";
    pattern: string;
    line: string;
  } | null;
  groupAgents: string[];
  usedWildcardGroup: boolean;
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
      pathTest: PathTest | null;
    }
  | { success: false; error: string };

export function RobotsCheckerForm() {
  const [result, setResult] = useState<Result | null>(null);
  const [lastUrl, setLastUrl] = useState("https://stripe.com");
  const [testPath, setTestPath] = useState("/");
  const [testUa, setTestUa] = useState("Googlebot");
  const [testing, setTesting] = useState(false);

  async function runCheck(url: string, path: string, ua: string) {
    const params = new URLSearchParams({
      url,
      path,
      ua,
    });
    const res = await fetch(`/api/robots?${params.toString()}`);
    return (await res.json()) as Result;
  }

  return (
    <div className="space-y-6">
      <UrlToolForm
        defaultUrl="https://stripe.com"
        placeholder="domain.com or https://example.com/path"
        submitLabel="Check robots.txt"
        loadingLabel="Fetching…"
        onResult={async (url) => {
          setResult(null);
          setLastUrl(url);
          try {
            // Prefer path from pasted URL when present
            let path = testPath;
            try {
              if (/^https?:\/\//i.test(url.trim())) {
                const u = new URL(
                  /^https?:\/\//i.test(url.trim())
                    ? url.trim()
                    : `https://${url.trim()}`
                );
                if (u.pathname && u.pathname !== "/") {
                  path = `${u.pathname}${u.search}`;
                  setTestPath(path);
                }
              }
            } catch {
              /* keep testPath */
            }
            setResult(await runCheck(url, path, testUa));
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

          {result.present ? (
            <div className="rounded-md border border-teal-200/80 bg-teal-50/50 p-4 dark:border-teal-900 dark:bg-teal-950/30">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-800 dark:text-teal-300">
                Path tester
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Check whether a crawler may fetch a specific path (longest
                Allow/Disallow match).
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={testPath}
                  onChange={(e) => setTestPath(e.target.value)}
                  placeholder="/blog or https://example.com/pricing"
                  className="h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 outline-none ring-teal-700/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
                />
                <select
                  value={testUa}
                  onChange={(e) => setTestUa(e.target.value)}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-teal-700/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
                >
                  {ROBOTS_TEST_AGENTS.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={testing}
                  onClick={() => {
                    if (result.content) {
                      const pathTest = testRobotsPath(
                        result.content,
                        testPath,
                        testUa
                      );
                      setResult({ ...result, pathTest });
                      return;
                    }
                    setTesting(true);
                    void runCheck(lastUrl, testPath, testUa)
                      .then(setResult)
                      .catch(() =>
                        setResult({
                          success: false,
                          error: "Network error — try again.",
                        })
                      )
                      .finally(() => setTesting(false));
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-teal-800 px-4 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
                >
                  {testing ? "Testing…" : "Test path"}
                </button>
              </div>

              {result.pathTest ? (
                <div
                  className={cn(
                    "mt-3 rounded-md border px-3 py-2.5 text-sm",
                    result.pathTest.allowed
                      ? "border-emerald-300/80 bg-emerald-50/80 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "border-rose-300/80 bg-rose-50/80 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                  )}
                >
                  <p className="font-semibold">
                    {result.pathTest.allowed ? "Allowed" : "Blocked"} ·{" "}
                    <span className="font-mono text-xs">
                      {result.pathTest.userAgent}
                    </span>{" "}
                    →{" "}
                    <span className="font-mono text-xs">
                      {result.pathTest.path}
                    </span>
                  </p>
                  <p className="mt-1 text-xs opacity-90">
                    {result.pathTest.message}
                  </p>
                  {result.pathTest.matchedRule ? (
                    <p className="mt-1 font-mono text-[11px] opacity-80">
                      Rule: {result.pathTest.matchedRule.line}
                    </p>
                  ) : null}
                  {result.pathTest.groupAgents.length > 0 ? (
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider opacity-70">
                      Group: {result.pathTest.groupAgents.join(", ")}
                      {result.pathTest.usedWildcardGroup
                        ? " (fallback *)"
                        : ""}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

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
                {result.content.slice(0, 4000)}
              </pre>
            </div>
          ) : null}

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Full technical + GEO report for{" "}
            <span className="font-medium">{result.domain}</span>:{" "}
            <Link
              href={auditReportHref(result.domain, result.origin)}
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
