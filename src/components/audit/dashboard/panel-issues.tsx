"use client";

import { useMemo, useState } from "react";
import { CheckCard } from "@/components/audit/dashboard/check-card";
import { sortChecksBySeverity } from "@/lib/audit/issue-guidance";
import type { AuditResult, CheckStatus } from "@/lib/audit/types";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ id: "all" | "todo" | CheckStatus; label: string }> = [
  { id: "todo", label: "To-do" },
  { id: "all", label: "All" },
  { id: "fail", label: "Fail" },
  { id: "warn", label: "Warn" },
  { id: "pass", label: "Pass" },
];

export function PanelIssues({ audit }: { audit: AuditResult }) {
  const [filter, setFilter] = useState<"all" | "todo" | CheckStatus>("todo");

  const sorted = useMemo(
    () => sortChecksBySeverity(audit.issueChecks),
    [audit.issueChecks]
  );

  const checks = useMemo(() => {
    if (filter === "all") return sorted;
    if (filter === "todo") {
      return sorted.filter((c) => c.status === "fail" || c.status === "warn");
    }
    return sorted.filter((c) => c.status === filter);
  }, [sorted, filter]);

  const counts = useMemo(() => {
    const map = { pass: 0, warn: 0, fail: 0, info: 0, todo: 0 };
    for (const c of audit.issueChecks) {
      map[c.status] += 1;
      if (c.status === "fail" || c.status === "warn") map.todo += 1;
    }
    return map;
  }, [audit.issueChecks]);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Issues
          </h2>
          <p className="text-xs text-slate-500">
            Prioritized to-do · fail first, then warnings
          </p>
        </div>
        <p className="text-xs text-slate-500">
          {counts.fail} fail · {counts.warn} warn · {counts.pass} pass
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded border px-2 py-1 text-[11px] font-semibold transition-colors",
              filter === item.id
                ? "border-teal-700 bg-teal-50 text-teal-900 dark:border-teal-500 dark:bg-teal-950 dark:text-teal-200"
                : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
            )}
          >
            {item.label}
            {item.id === "all"
              ? ` ${audit.issueChecks.length}`
              : item.id === "todo"
                ? ` ${counts.todo}`
                : ` ${counts[item.id]}`}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {checks.map((check) => (
          <CheckCard
            key={check.id}
            title={check.title}
            description={check.description}
            status={check.status}
            why={check.why}
            fix={check.fix}
          />
        ))}
        {checks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-500 dark:border-slate-700">
            {filter === "todo"
              ? "No critical or warning issues — nice work."
              : "No checks in this filter."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
