"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { scoreContentForGeo } from "@/lib/geo/content-score";
import { cn } from "@/lib/utils";

function barColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 55) return "bg-amber-500";
  return "bg-rose-500";
}

export function GeoContentCheckerForm() {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    if (!submitted || text.trim().length < 40) return null;
    return scoreContentForGeo(text);
  }, [submitted, text]);

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="space-y-3"
      >
        <label htmlFor="geo-content" className="sr-only">
          Content to check
        </label>
        <textarea
          id="geo-content"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSubmitted(false);
          }}
          rows={12}
          placeholder="Paste an article, FAQ, or landing-page draft (≈100+ words)…"
          className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm leading-relaxed text-slate-800 outline-none ring-teal-700/30 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={text.trim().length < 40}
            className="inline-flex h-11 items-center justify-center rounded-md bg-teal-800 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-40 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
          >
            Score for GEO
          </button>
          <p className="text-xs text-slate-500">
            Free · No signup · Rule-based (no LLM API)
          </p>
        </div>
      </form>

      {submitted && text.trim().length < 40 ? (
        <p className="text-sm text-rose-600" role="alert">
          Paste a bit more text (at least ~40 characters) to score.
        </p>
      ) : null}

      {result ? (
        <div className="space-y-5 border-t border-slate-200 pt-6 dark:border-slate-800">
          <div className="flex flex-wrap items-end gap-4">
            <p className="font-display text-4xl font-extrabold tabular-nums text-slate-900 dark:text-white">
              {result.score}
              <span className="text-lg font-semibold text-slate-400">/100</span>
            </p>
            <div className="text-sm text-slate-500">
              <p>{result.wordCount.toLocaleString()} words analyzed</p>
              <p className="mt-0.5">
                Citation-readiness score for AI answers (heuristic).
              </p>
            </div>
          </div>

          <ul className="space-y-3">
            {result.dimensions.map((d) => (
              <li key={d.id}>
                <div className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-xs font-semibold text-slate-800 dark:text-slate-200 sm:w-48">
                    {d.label}
                  </span>
                  <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <span
                      className={cn("block h-full rounded-full", barColor(d.score))}
                      style={{ width: `${d.score}%` }}
                    />
                  </span>
                  <span className="w-8 text-right text-xs font-bold tabular-nums">
                    {d.score}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {result.suggestions.length ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Priority fixes
              </p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
                {result.suggestions.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          ) : null}

          <p className="text-sm text-slate-600 dark:text-slate-400">
            Want bots, schema, llms.txt, and TLS too?{" "}
            <Link
              href="/#home-audit-url"
              className="font-semibold text-teal-700 hover:underline dark:text-teal-400"
            >
              Run a full technical + GEO audit →
            </Link>
          </p>
        </div>
      ) : null}
    </div>
  );
}
