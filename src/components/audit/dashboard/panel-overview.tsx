"use client";

import { ExternalLink } from "lucide-react";
import { CharBadge } from "@/components/audit/dashboard/char-badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { computeSubScores } from "@/lib/audit/subscores";
import type { AuditResult, AuditTabId, CheckStatus } from "@/lib/audit/types";
import { cn } from "@/lib/utils";

function gradeTone(grade: string) {
  if (grade === "A") return "bg-emerald-500 text-white";
  if (grade === "B") return "bg-teal-500 text-white";
  if (grade === "C") return "bg-amber-500 text-white";
  if (grade === "D") return "bg-orange-500 text-white";
  return "bg-rose-500 text-white";
}

function barColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 55) return "bg-amber-500";
  return "bg-rose-500";
}

function attentionItems(audit: AuditResult): Array<{
  label: string;
  status: CheckStatus;
  tab: AuditTabId;
}> {
  const items: Array<{
    label: string;
    status: CheckStatus;
    tab: AuditTabId;
  }> = [];
  const push = (label: string, status: CheckStatus, tab: AuditTabId) => {
    if (status === "fail" || status === "warn") {
      items.push({ label, status, tab });
    }
  };

  push("Title", audit.title.status, "issues");
  push("Description", audit.description.status, "issues");
  push("Canonical", audit.canonical.status, "issues");
  push("H1", audit.headings.h1Status, "structure");
  push("Images", audit.images.status, "structure");
  push("Open Graph", audit.openGraph.status, "signals");
  push("TLS", audit.extras.ssl.status, "domain");
  if (audit.extras.redirectChain.length > 3) {
    push(`Redirects ×${audit.extras.redirectChain.length}`, "warn", "domain");
  }
  if (!audit.extras.llmsTxt.present) push("llms.txt", "warn", "geo");
  if (
    audit.extras.mixedContent.applicable &&
    audit.extras.mixedContent.count > 0
  ) {
    push(
      `Mixed content ×${audit.extras.mixedContent.count}`,
      audit.extras.mixedContent.status,
      "domain"
    );
  }
  const aiBlocked = audit.robots.aiCrawlers.filter((c) => c.blocked).length;
  if (aiBlocked) push(`${aiBlocked} AI bots blocked`, "warn", "geo");

  return items.slice(0, 8);
}

export function PanelOverview({
  audit,
  onSelectTab,
}: {
  audit: AuditResult;
  onSelectTab: (id: AuditTabId) => void;
}) {
  const critical = audit.issues.filter((i) => i.severity === "critical").length;
  const warnings = audit.issues.filter((i) => i.severity === "warning").length;
  const attention = attentionItems(audit);
  const subs = computeSubScores(audit);

  return (
    <div className="flex h-full min-h-0 flex-col justify-between gap-3">
      <div className="space-y-3">
        <div className="flex items-start gap-4">
          <ScoreRing score={audit.score} size="lg" />
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {audit.favicon.href ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={audit.favicon.href}
                  alt=""
                  className="h-5 w-5 rounded border border-slate-200 bg-white object-contain"
                />
              ) : null}
              <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {audit.domain}
              </h2>
              <span
                className={cn(
                  "inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 font-display text-sm font-bold",
                  gradeTone(audit.grade)
                )}
              >
                {audit.grade}
              </span>
            </div>
            <p className="mt-1 max-w-xl text-sm leading-snug text-slate-600 dark:text-slate-400">
              {audit.summary}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {critical} critical · {warnings} warnings · GEO {audit.geo.score}
            </p>
            <a
              href={audit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-teal-700 hover:underline dark:text-teal-400"
            >
              <span className="truncate">{audit.url}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        </div>

        {/* Seobility-style sub-scores */}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          {subs.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelectTab(s.tab)}
                className="w-full text-left"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {s.label}
                  </span>
                  <span className="text-[11px] font-bold tabular-nums text-slate-900 dark:text-white">
                    {s.score}
                  </span>
                </div>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <span
                    className={cn("block h-full rounded-full", barColor(s.score))}
                    style={{ width: `${s.score}%` }}
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="space-y-1.5">
          <Row
            label="Title"
            trailing={
              <CharBadge
                length={audit.title.length}
                max={audit.title.idealMax}
                status={audit.title.status}
              />
            }
          >
            <span className="line-clamp-1">
              {audit.title.content ?? "Missing"}
            </span>
          </Row>
          <Row
            label="Description"
            trailing={
              <CharBadge
                length={audit.description.length}
                max={audit.description.idealMax}
                status={audit.description.status}
              />
            }
          >
            <span className="line-clamp-2">
              {audit.description.content ?? "Missing"}
            </span>
          </Row>
          <Row label="Canonical">
            <span className="line-clamp-1">
              {audit.canonical.href ?? "Missing"}
            </span>
          </Row>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 px-3 py-2.5 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Needs attention
          </p>
          <button
            type="button"
            onClick={() => onSelectTab("issues")}
            className="text-[11px] font-semibold text-teal-700 hover:underline dark:text-teal-400"
          >
            Open to-do →
          </button>
        </div>
        {attention.length === 0 ? (
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
            No critical on-page flags. Dig into Structure, Keywords, or Domain
            for detail.
          </p>
        ) : (
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {attention.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => onSelectTab(item.tab)}
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-semibold transition-opacity hover:opacity-80",
                    item.status === "fail"
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                      : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  children,
  trailing,
}: {
  label: string;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr_auto] items-start gap-3 text-sm">
      <span className="pt-0.5 text-xs font-medium text-slate-500">{label}</span>
      <div className="min-w-0 text-slate-800 dark:text-slate-200">{children}</div>
      {trailing ?? <span />}
    </div>
  );
}
