"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, Info, XCircle } from "lucide-react";
import { ScoreRing } from "@/components/ui/score-ring";
import { cn } from "@/lib/utils";
import type { AuditResult, CheckStatus } from "@/lib/audit/types";

function barColor(score: number) {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "pass") {
    return <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />;
  }
  if (status === "fail") {
    return <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />;
  }
  return <Info className="h-3.5 w-3.5 shrink-0 text-sky-500" />;
}

export function PanelGeo({ audit }: { audit: AuditResult }) {
  const { geo } = audit;
  const [openId, setOpenId] = useState<string | null>(geo.categories[0]?.id ?? null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ScoreRing score={geo.score} size="md" label={`GEO score ${geo.score}`} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              GEO
            </h2>
            <span
              className={cn(
                "font-display text-lg font-bold",
                geo.score >= 75
                  ? "text-emerald-600 dark:text-emerald-400"
                  : geo.score >= 60
                    ? "text-amber-600"
                    : "text-rose-600"
              )}
            >
              {geo.label}
            </span>
            <span className="text-xs text-slate-500">Grade {geo.grade}</span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {geo.passed} pass · {geo.warnings} warn · {geo.failed} fail
            {" · "}
            AI crawlers, schema, answer-first, freshness
          </p>
          <Link
            href="/tools"
            className="mt-1 inline-block text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400"
          >
            Free tools hub →
          </Link>
        </div>
      </div>

      {/* Single accordion list — no nested scroll regions */}
      <ul className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        {geo.categories.map((cat) => {
          const open = openId === cat.id;
          return (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : cat.id)}
                className="flex w-full items-center gap-3 py-2.5 text-left"
              >
                <span className="w-32 shrink-0 truncate text-xs font-semibold text-slate-800 dark:text-slate-200 sm:w-40">
                  {cat.label}
                </span>
                <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <span
                    className={cn("block h-full rounded-full", barColor(cat.score))}
                    style={{ width: `${cat.score}%` }}
                  />
                </span>
                <span className="w-8 text-right text-xs font-bold tabular-nums text-slate-700 dark:text-slate-300">
                  {cat.score}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform",
                    open && "rotate-180"
                  )}
                />
              </button>
              {open ? (
                <ul className="space-y-1.5 pb-3 pl-0 sm:pl-2">
                  {cat.checks.map((check) => (
                    <li
                      key={check.id}
                      className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400"
                    >
                      <StatusIcon status={check.status} />
                      <span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {check.title}
                        </span>
                        {" — "}
                        {check.message}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
