"use client";

import { useMemo, useState } from "react";
import { Copy, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AuditResult } from "@/lib/audit/types";

const NGRAMS = [1, 2, 3, 4, 5] as const;

export function PanelDensity({ audit }: { audit: AuditResult }) {
  const [n, setN] = useState<(typeof NGRAMS)[number]>(1);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const list = audit.density.byNgram[n] ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((row) => row.keyword.includes(q));
  }, [audit.density.byNgram, n, query]);

  const maxCount = useMemo(
    () => Math.max(1, ...rows.map((r) => r.count)),
    [rows]
  );

  async function copyList() {
    const text = rows.map((r) => `${r.keyword}\t${r.count}\t${r.density}%`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Keywords
        </h2>
        <p className="text-xs text-slate-500">
          {audit.density.totalWords.toLocaleString()} words · ~
          {audit.extras.readingMinutes} min read
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-0.5 rounded-md border border-slate-200 p-0.5 dark:border-slate-700">
          {NGRAMS.map((size) => {
            const active = n === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setN(size)}
                className={cn(
                  "rounded px-2 py-1 text-[11px] font-semibold tabular-nums transition-colors",
                  active
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                {size}w
              </button>
            );
          })}
        </div>
        <div className="relative min-w-[10rem] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter keywords…"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <Button variant="outline" size="sm" className="h-8" onClick={copyList}>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full table-fixed text-left text-xs">
          <colgroup>
            <col className="w-auto" />
            <col className="w-[4.5rem]" />
            <col className="w-[4.5rem]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-950">
            <tr>
              <th className="px-2.5 py-1.5">Keyword</th>
              <th className="px-2 py-1.5 text-right">Count</th>
              <th className="px-2 py-1.5 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 100).map((row) => (
              <tr
                key={row.keyword}
                className="border-t border-slate-100 dark:border-slate-800"
              >
                <td className="px-2.5 py-1.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="min-w-0 flex-1 truncate font-medium text-slate-800 dark:text-slate-200">
                      {row.keyword}
                    </span>
                    <span className="hidden h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100 sm:block dark:bg-slate-800">
                      <span
                        className="block h-full rounded-full bg-teal-600/80 dark:bg-teal-400/70"
                        style={{ width: `${(row.count / maxCount) * 100}%` }}
                      />
                    </span>
                  </div>
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-slate-600">
                  {row.count}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-slate-600">
                  {row.density}%
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-slate-500">
                  No keywords matched.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
