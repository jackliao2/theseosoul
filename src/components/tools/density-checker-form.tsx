"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ToolError,
  ToolStat,
  UrlToolForm,
} from "@/components/tools/url-tool-form";
import { cn } from "@/lib/utils";

type Kw = { keyword: string; count: number; density: number };

type Result =
  | {
      success: true;
      mode: "url" | "paste";
      domain: string | null;
      finalUrl: string | null;
      totalWords: number;
      message: string;
      focus: {
        phrase: string;
        count: number;
        density: number;
        totalWords: number;
      } | null;
      unigrams: Kw[];
      bigrams: Kw[];
      trigrams: Kw[];
    }
  | { success: false; error: string };

export function DensityCheckerForm() {
  const [mode, setMode] = useState<"url" | "paste">("url");
  const [focus, setFocus] = useState("");
  const [paste, setPaste] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [ngram, setNgram] = useState<1 | 2 | 3>(1);

  async function runUrl(url: string) {
    setResult(null);
    const qs = new URLSearchParams({ url });
    if (focus.trim()) qs.set("focus", focus.trim());
    const res = await fetch(`/api/density?${qs}`);
    setResult((await res.json()) as Result);
  }

  async function runPaste(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/density", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: paste, focus: focus.trim() || undefined }),
      });
      setResult((await res.json()) as Result);
    } catch {
      setResult({ success: false, error: "Network error — try again." });
    } finally {
      setLoading(false);
    }
  }

  const list =
    result && result.success
      ? ngram === 1
        ? result.unigrams
        : ngram === 2
          ? result.bigrams
          : result.trigrams
      : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1">
        {(
          [
            ["url", "From URL"],
            ["paste", "Paste text"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              setResult(null);
            }}
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

      <div>
        <label
          htmlFor="density-focus"
          className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"
        >
          Focus keyword (optional)
        </label>
        <input
          id="density-focus"
          type="text"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder="e.g. free seo audit"
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-teal-700/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
        />
      </div>

      {mode === "url" ? (
        <UrlToolForm
          defaultUrl="https://stripe.com"
          placeholder="https://example.com/blog-post"
          submitLabel="Check density"
          loadingLabel="Analyzing…"
          onResult={async (url) => {
            try {
              await runUrl(url);
            } catch {
              setResult({ success: false, error: "Network error — try again." });
            }
          }}
        />
      ) : (
        <form onSubmit={runPaste} className="space-y-3">
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            rows={8}
            placeholder="Paste article or landing-page copy…"
            className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-teal-700/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-md bg-teal-800 px-5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
          >
            {loading ? "Analyzing…" : "Check density"}
          </button>
        </form>
      )}

      {result && !result.success ? <ToolError>{result.error}</ToolError> : null}

      {result && result.success ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <ToolStat label="Words" value={String(result.totalWords)} />
            <ToolStat
              label="Focus hits"
              value={
                result.focus ? String(result.focus.count) : "—"
              }
            />
            <ToolStat
              label="Focus density"
              value={
                result.focus ? `${result.focus.density}%` : "—"
              }
            />
          </div>

          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {result.message}
            {result.focus
              ? ` Focus “${result.focus.phrase}” appears ${result.focus.count}× (${result.focus.density}%).`
              : null}
          </p>

          {result.finalUrl ? (
            <p className="break-all font-mono text-xs text-slate-500 dark:text-slate-400">
              {result.finalUrl}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-1">
            {(
              [
                [1, "1-word"],
                [2, "2-word"],
                [3, "3-word"],
              ] as const
            ).map(([n, label]) => (
              <button
                key={n}
                type="button"
                onClick={() => setNgram(n)}
                className={cn(
                  "rounded border px-2.5 py-1 text-[11px] font-semibold",
                  ngram === n
                    ? "border-teal-700 text-teal-900 dark:border-teal-400 dark:text-teal-200"
                    : "border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <ol className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-300/80 dark:divide-slate-700 dark:border-slate-700">
            {list.map((row, i) => (
              <li
                key={`${row.keyword}-${i}`}
                className="grid grid-cols-[2rem_1fr_auto_auto] items-baseline gap-3 px-3 py-2 text-xs"
              >
                <span className="font-mono text-slate-400">{i + 1}</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {row.keyword}
                </span>
                <span className="font-mono tabular-nums text-slate-500">
                  ×{row.count}
                </span>
                <span className="font-mono tabular-nums text-teal-800 dark:text-teal-300">
                  {row.density}%
                </span>
              </li>
            ))}
            {list.length === 0 ? (
              <li className="px-3 py-4 text-sm text-slate-500">
                No phrases at this n-gram size.
              </li>
            ) : null}
          </ol>

          {result.domain ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Full technical report:{" "}
              <Link
                href={`/audit/${result.domain}`}
                className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
              >
                Open audit →
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
