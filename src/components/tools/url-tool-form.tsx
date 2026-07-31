"use client";

import { useState, type ReactNode } from "react";

export function UrlToolForm({
  defaultUrl,
  placeholder,
  submitLabel,
  loadingLabel,
  onResult,
}: {
  defaultUrl: string;
  placeholder?: string;
  submitLabel: string;
  loadingLabel?: string;
  onResult: (url: string) => Promise<void>;
}) {
  const [url, setUrl] = useState(defaultUrl);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onResult(url.trim());
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={placeholder ?? "https://example.com"}
        className="h-11 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-teal-700/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 items-center justify-center rounded-md bg-teal-800 px-5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
      >
        {loading ? loadingLabel ?? "Checking…" : submitLabel}
      </button>
    </form>
  );
}

export function ToolError({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
      {children}
    </p>
  );
}

export function ToolStat({ label, value }: { label: string; value: string }) {
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
