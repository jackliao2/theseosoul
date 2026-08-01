"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, RefreshCw, Wrench } from "lucide-react";
import { getAuditNextSteps } from "@/lib/audit/next-steps";
import type { AuditResult, AuditTabId } from "@/lib/audit/types";
import { cn } from "@/lib/utils";

export function PanelNextSteps({
  audit,
  onSelectTab,
  onReaudit,
  isRefreshing,
}: {
  audit: AuditResult;
  onSelectTab: (id: AuditTabId) => void;
  onReaudit: () => void;
  isRefreshing?: boolean;
}) {
  const steps = getAuditNextSteps(audit, 3);

  return (
    <section className="mt-6 rounded-xl border border-teal-200/70 bg-teal-50/40 p-4 dark:border-teal-900/60 dark:bg-teal-950/25 sm:p-5 print:border-slate-300 print:bg-white">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-800 dark:text-teal-300">
            Next 15 minutes
          </p>
          <h2 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-slate-50">
            {steps.length
              ? "Fix these, then re-audit"
              : "Looking solid — re-audit anytime"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onReaudit}
          disabled={isRefreshing}
          className="no-print inline-flex items-center gap-1.5 rounded-md bg-teal-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
          />
          Re-audit this URL
        </button>
      </div>

      {steps.length ? (
        <ol className="mt-4 space-y-3">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className="rounded-lg border border-slate-200/80 bg-white/80 px-3 py-3 dark:border-slate-700 dark:bg-slate-950/40"
            >
              <div className="flex flex-wrap items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white dark:bg-slate-100 dark:text-slate-900">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onSelectTab(step.tab)}
                    className="text-left text-sm font-semibold text-slate-900 hover:text-teal-800 dark:text-slate-50 dark:hover:text-teal-300"
                  >
                    {step.title}
                    <ArrowRight className="ml-1 inline h-3.5 w-3.5 opacity-60" />
                  </button>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    {step.severity}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {step.tool ? (
                      <Link
                        href={step.tool.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-teal-300 hover:text-teal-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-700 dark:hover:text-teal-300"
                      >
                        <Wrench className="h-3 w-3" />
                        {step.tool.label}
                      </Link>
                    ) : null}
                    {step.guide ? (
                      <Link
                        href={step.guide.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-teal-300 hover:text-teal-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-700 dark:hover:text-teal-300"
                      >
                        <BookOpen className="h-3 w-3" />
                        {step.guide.label}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          No critical or warning issues in this pass. Share the report, or dig
          into GEO and Structure tabs for polish.
        </p>
      )}
    </section>
  );
}
