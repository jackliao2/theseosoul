"use client";

import { useState } from "react";
import Link from "next/link";
import { SerpSnippetPreview } from "@/components/seo/serp-snippet-preview";
import {
  ToolError,
  ToolStat,
  UrlToolForm,
} from "@/components/tools/url-tool-form";
import { auditReportHref } from "@/lib/url";
import { cn } from "@/lib/utils";

type FieldResult = {
  content: string | null;
  length: number;
  idealMax: number;
  status: string;
  message: string;
};

type Signal = {
  value?: string | null;
  count?: number;
  texts?: string[];
  status: string;
  message: string;
};

type FetchResult =
  | {
      success: true;
      domain: string;
      hostname: string;
      requestedUrl: string;
      finalUrl: string;
      status: number;
      redirected: boolean;
      title: FieldResult;
      description: FieldResult;
      robotsMeta: { content: string | null; message: string; status?: string };
      h1: Signal;
      lang: Signal;
      viewport: Signal;
      charset: Signal;
      summary: string;
      issues: string[];
    }
  | { success: false; error: string };

function statusTone(status: string) {
  if (status === "pass") return "text-emerald-700 dark:text-emerald-300";
  if (status === "warn") return "text-amber-700 dark:text-amber-300";
  if (status === "fail") return "text-rose-700 dark:text-rose-300";
  return "text-slate-600 dark:text-slate-300";
}

export function MetaTagCheckerForm() {
  const [mode, setMode] = useState<"url" | "manual">("url");
  const [fetchResult, setFetchResult] = useState<FetchResult | null>(null);
  const [domain, setDomain] = useState("example.com");
  const [title, setTitle] = useState(
    "Example Product — Features, Pricing & Reviews"
  );
  const [description, setDescription] = useState(
    "See how Example helps teams ship faster. Features, pricing, and customer reviews — all in one place."
  );

  const previewTitle =
    mode === "url" && fetchResult && fetchResult.success
      ? fetchResult.title.content
      : title;
  const previewDesc =
    mode === "url" && fetchResult && fetchResult.success
      ? fetchResult.description.content
      : description;
  const previewDomain =
    mode === "url" && fetchResult && fetchResult.success
      ? fetchResult.hostname
      : domain || "example.com";
  const previewUrl =
    mode === "url" && fetchResult && fetchResult.success
      ? fetchResult.finalUrl
      : `https://${domain || "example.com"}/`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1">
        {(
          [
            ["url", "Check live URL"],
            ["manual", "SERP simulator"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
              mode === id
                ? "border-teal-700 bg-teal-50 text-teal-900 dark:border-teal-400 dark:bg-teal-950 dark:text-teal-200"
                : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "url" ? (
        <UrlToolForm
          defaultUrl="https://stripe.com"
          placeholder="https://example.com/page"
          submitLabel="Check meta tags"
          loadingLabel="Fetching…"
          onResult={async (url) => {
            setFetchResult(null);
            try {
              const res = await fetch(
                `/api/meta-tags?url=${encodeURIComponent(url)}`
              );
              setFetchResult((await res.json()) as FetchResult);
            } catch {
              setFetchResult({
                success: false,
                error: "Network error — try again.",
              });
            }
          }}
        />
      ) : (
        <div className="grid gap-3">
          <ManualField
            id="meta-domain"
            label={`Domain · ${domain.length} chars`}
            value={domain}
            onChange={setDomain}
            placeholder="yoursite.com"
          />
          <ManualField
            id="meta-title"
            label={`Title · ${title.length}/60`}
            value={title}
            onChange={setTitle}
            placeholder="Page title tag"
            warn={title.length > 60 || title.length < 30}
          />
          <div>
            <label
              htmlFor="meta-desc"
              className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"
            >
              Meta description · {description.length}/160
              {description.length > 160 || description.length < 120 ? (
                <span className="ml-1 text-amber-600 dark:text-amber-400">
                  check length
                </span>
              ) : null}
            </label>
            <textarea
              id="meta-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-teal-700/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>
        </div>
      )}

      {mode === "url" && fetchResult && !fetchResult.success ? (
        <ToolError>{fetchResult.error}</ToolError>
      ) : null}

      {mode === "url" && fetchResult && fetchResult.success ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <ToolStat
              label="Title"
              value={`${fetchResult.title.length}/${fetchResult.title.idealMax}`}
            />
            <ToolStat
              label="Description"
              value={`${fetchResult.description.length}/${fetchResult.description.idealMax}`}
            />
            <ToolStat
              label="H1"
              value={String(fetchResult.h1.count ?? 0)}
            />
            <ToolStat
              label="Issues"
              value={String(fetchResult.issues.length)}
            />
          </div>

          <div className="rounded-md border border-slate-300/80 px-3 py-2.5 text-xs dark:border-slate-700">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Request vs final · HTTP {fetchResult.status}
              {fetchResult.redirected ? " · redirected" : ""}
            </p>
            <p className="mt-1 break-all font-mono text-slate-600 dark:text-slate-300">
              {fetchResult.requestedUrl}
            </p>
            {fetchResult.redirected ? (
              <p className="mt-1 break-all font-mono text-teal-800 dark:text-teal-300">
                → {fetchResult.finalUrl}
              </p>
            ) : (
              <p className="mt-1 break-all font-mono text-slate-500">
                {fetchResult.finalUrl}
              </p>
            )}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            {fetchResult.summary}
          </p>

          {fetchResult.issues.length > 0 ? (
            <ul className="list-inside list-disc space-y-1 text-sm text-amber-800 dark:text-amber-200">
              {fetchResult.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : null}

          <ul className="space-y-2 text-sm">
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                Title ·{" "}
              </span>
              <span className={statusTone(fetchResult.title.status)}>
                {fetchResult.title.message}
              </span>
              <p className="mt-0.5 text-slate-700 dark:text-slate-200">
                {fetchResult.title.content ?? "—"}
              </p>
            </li>
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                Description ·{" "}
              </span>
              <span className={statusTone(fetchResult.description.status)}>
                {fetchResult.description.message}
              </span>
              <p className="mt-0.5 text-slate-700 dark:text-slate-200">
                {fetchResult.description.content ?? "—"}
              </p>
            </li>
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                H1 ·{" "}
              </span>
              <span className={statusTone(fetchResult.h1.status)}>
                {fetchResult.h1.message}
              </span>
              {(fetchResult.h1.texts ?? []).length > 0 ? (
                <ul className="mt-0.5 space-y-0.5 text-slate-700 dark:text-slate-200">
                  {fetchResult.h1.texts!.map((text, i) => (
                    <li key={`${text}-${i}`}>{text}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-0.5 text-slate-500">—</p>
              )}
            </li>
            <li className="text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                Lang ·{" "}
              </span>
              <span className={statusTone(fetchResult.lang.status)}>
                {fetchResult.lang.message}
              </span>
            </li>
            <li className="text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                Viewport ·{" "}
              </span>
              <span className={statusTone(fetchResult.viewport.status)}>
                {fetchResult.viewport.message}
              </span>
            </li>
            <li className="text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                Charset ·{" "}
              </span>
              <span className={statusTone(fetchResult.charset.status)}>
                {fetchResult.charset.message}
              </span>
            </li>
            <li className="text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                Robots meta ·{" "}
              </span>
              <span
                className={statusTone(fetchResult.robotsMeta.status ?? "pass")}
              >
                {fetchResult.robotsMeta.message}
              </span>
            </li>
          </ul>
        </div>
      ) : null}

      <SerpSnippetPreview
        domain={previewDomain}
        title={previewTitle}
        description={previewDesc}
        url={previewUrl}
      />

      {mode === "url" && fetchResult && fetchResult.success ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Also check{" "}
          <Link
            href="/tools/canonical-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            canonical
          </Link>
          {" · "}
          <Link
            href={auditReportHref(fetchResult.domain, fetchResult.finalUrl)}
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            Full audit →
          </Link>
        </p>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Switch to <span className="font-medium">Check live URL</span> to pull
          real title & meta from a page.
        </p>
      )}
    </div>
  );
}

function ManualField({
  id,
  label,
  value,
  onChange,
  placeholder,
  warn,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  warn?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"
      >
        {label}
        {warn ? (
          <span className="ml-1 text-amber-600 dark:text-amber-400">
            check length
          </span>
        ) : null}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-teal-700/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
      />
    </div>
  );
}
