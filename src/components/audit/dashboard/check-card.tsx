"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, Info, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckStatus } from "@/lib/audit/types";

const map = {
  pass: {
    wrap: "border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30",
    Icon: CheckCircle2,
    icon: "text-emerald-600 dark:text-emerald-400",
    badge: "Pass",
  },
  warn: {
    wrap: "border-amber-200/80 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30",
    Icon: AlertTriangle,
    icon: "text-amber-600 dark:text-amber-400",
    badge: "Warn",
  },
  fail: {
    wrap: "border-rose-200/80 bg-rose-50/70 dark:border-rose-900 dark:bg-rose-950/30",
    Icon: XCircle,
    icon: "text-rose-600 dark:text-rose-400",
    badge: "Fail",
  },
  info: {
    wrap: "border-sky-200/80 bg-sky-50/70 dark:border-sky-900 dark:bg-sky-950/30",
    Icon: Info,
    icon: "text-sky-600 dark:text-sky-400",
    badge: "Info",
  },
} as const;

export function CheckCard({
  title,
  description,
  status,
  why,
  fix,
}: {
  title: string;
  description: string;
  status: CheckStatus;
  why?: string;
  fix?: string;
}) {
  const { wrap, Icon, icon, badge } = map[status];
  const expandable = Boolean(why || fix);
  const [open, setOpen] = useState(status === "fail" || status === "warn");

  return (
    <div className={cn("rounded-md border", wrap)}>
      <button
        type="button"
        disabled={!expandable}
        onClick={() => expandable && setOpen((v) => !v)}
        className={cn(
          "flex w-full items-start gap-2 px-2.5 py-1.5 text-left",
          expandable && "cursor-pointer"
        )}
      >
        <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", icon)} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-white">
              {title}
            </p>
            <span className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
              {badge}
            </span>
          </div>
          <p className="text-xs leading-snug text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>
        {expandable ? (
          <ChevronDown
            className={cn(
              "mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform",
              open && "rotate-180"
            )}
          />
        ) : null}
      </button>
      {expandable && open ? (
        <div className="space-y-1.5 border-t border-black/5 px-2.5 py-2 dark:border-white/10">
          {why ? (
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Why ·{" "}
              </span>
              {why}
            </p>
          ) : null}
          {fix ? (
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Fix ·{" "}
              </span>
              {fix}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
