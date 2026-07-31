"use client";

import { useState } from "react";
import Link from "next/link";

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
  const [url, setUrl] = useState("https://www.github.com");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/redirects?url=${encodeURIComponent(url.trim())}`
      );
      const data = (await res.json()) as Result;
      setResult(data);
    } catch {
      setResult({ success: false, error: "Network error — try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com or www.example.com"
          className="h-11 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-teal-700/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center justify-center rounded-md bg-teal-800 px-5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
        >
          {loading ? "Tracing…" : "Check redirects"}
        </button>
      </form>

      {result && !result.success ? (
        <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          {result.error}
        </p>
      ) : null}

      {result && result.success ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Hops" value={String(result.hops)} />
            <Stat label="Final status" value={String(result.status)} />
            <Stat
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-300/80 px-3 py-2 dark:border-slate-700">
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 font-display text-lg font-bold text-slate-900 dark:text-slate-50">
        {value}
      </p>
    </div>
  );
}
