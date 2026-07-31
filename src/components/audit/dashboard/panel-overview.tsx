"use client";

import type { ReactNode } from "react";
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

function fmtDate(iso: string | null): string {
  if (!iso) return "Unavailable";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toISOString().slice(0, 10);
}

function fmtTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
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

  const uniqueImages =
    audit.images.unique ??
    new Set(audit.images.items.map((image) => image.src).filter(Boolean)).size;
  const imagesMissingTitle =
    audit.images.missingTitle ??
    audit.images.items.filter((image) => !image.title).length;
  const uniqueLinks =
    audit.links.unique ??
    new Set(audit.links.items.map((link) => link.href)).size;
  const dofollow = Math.max(0, audit.links.total - audit.links.nofollow);
  const analytics = audit.extras.trackers.filter((tracker) =>
    /google analytics|gtm|matomo|plausible|clarity/i.test(tracker)
  );
  const hasAdsense = audit.extras.trackers.some((tracker) =>
    /adsense/i.test(tracker)
  );

  return (
    <div className="space-y-3 pb-3">
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
          <p className="mt-1 max-w-2xl text-sm leading-snug text-slate-600 dark:text-slate-400">
            {audit.summary}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {critical} critical · {warnings} warnings · GEO {audit.geo.score} ·
            fetched {fmtTimestamp(audit.fetchedAt)}
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

      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {subs.map((subscore) => (
          <li key={subscore.id}>
            <button
              type="button"
              onClick={() => onSelectTab(subscore.tab)}
              className="w-full text-left"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  {subscore.label}
                </span>
                <span className="text-[11px] font-bold tabular-nums text-slate-900 dark:text-white">
                  {subscore.score}
                </span>
              </div>
              <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <span
                  className={cn(
                    "block h-full rounded-full",
                    barColor(subscore.score)
                  )}
                  style={{ width: `${subscore.score}%` }}
                />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,.75fr)]">
        <OverviewCard title="Page essentials">
          <div className="space-y-2">
            <MetaRow
              label="Title"
              trailing={
                <CharBadge
                  length={audit.title.length}
                  max={audit.title.idealMax}
                  status={audit.title.status}
                />
              }
            >
              <span className="line-clamp-2">
                {audit.title.content ?? "Missing"}
              </span>
            </MetaRow>
            <MetaRow
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
            </MetaRow>
            <MetaRow
              label="Keywords"
              trailing={
                audit.keywords.content ? (
                  <span className="font-mono text-[10px] tabular-nums text-slate-400">
                    {audit.keywords.content.length} chars
                  </span>
                ) : undefined
              }
            >
              <span className="line-clamp-2">
                {audit.keywords.content ?? "Not set (optional)"}
              </span>
            </MetaRow>
            <MetaRow label="Fetched URL">
              <span className="line-clamp-1">{audit.url}</span>
            </MetaRow>
            <MetaRow label="Canonical">
              <span className="line-clamp-1">
                {audit.canonical.href ?? "Missing"}
              </span>
            </MetaRow>
          </div>
        </OverviewCard>

        <OverviewCard
          title="Index & domain"
          action={
            <button
              type="button"
              onClick={() => onSelectTab("domain")}
              className="text-[11px] font-semibold text-teal-700 hover:underline dark:text-teal-400"
            >
              Domain detail →
            </button>
          }
        >
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            <Fact
              label="Robots tag"
              value={audit.robotsMeta.content ?? "index, follow"}
            />
            <Fact
              label="X-Robots-Tag"
              value={audit.tech.xRobotsTag ?? "Not set"}
            />
            <Fact
              label="robots.txt"
              value={audit.robots.present ? "Available" : "Missing"}
              tone={audit.robots.present ? "good" : "bad"}
            />
            <Fact
              label="sitemap.xml"
              value={audit.tech.sitemapPresent ? "Available" : "Missing"}
              tone={audit.tech.sitemapPresent ? "good" : "bad"}
            />
            <Fact label="Domain created" value={fmtDate(audit.whois.createdAt)} />
            <Fact label="Domain expires" value={fmtDate(audit.whois.expiresAt)} />
            <Fact
              label="Analytics"
              value={analytics.length ? analytics.join(", ") : "Not detected"}
            />
            <Fact
              label="Google AdSense"
              value={hasAdsense ? "Detected" : "Not detected"}
            />
          </dl>
        </OverviewCard>
      </div>

      <OverviewCard
        title="Content snapshot"
        action={
          <button
            type="button"
            onClick={() => onSelectTab("structure")}
            className="text-[11px] font-semibold text-teal-700 hover:underline dark:text-teal-400"
          >
            Inspect structure →
          </button>
        }
      >
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          <Stat label="Words" value={audit.density.totalWords} />
          <Stat label="Lang" value={audit.tech.lang ?? "—"} />
          <Stat label="H1" value={audit.headings.h1Count} />
          <Stat label="H2" value={audit.headings.h2Count} />
          <Stat label="H3" value={audit.headings.h3Count} />
          <Stat
            label="Read time"
            value={`~${audit.extras.readingMinutes}m`}
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <MetricGroup
            title="Images"
            metrics={[
              ["Total", audit.images.total],
              ["Unique", uniqueImages],
              ["Missing alt", audit.images.missingAlt],
              ["Missing title", imagesMissingTitle],
            ]}
          />
          <MetricGroup
            title="Links"
            metrics={[
              ["Total", audit.links.total],
              ["Unique", uniqueLinks],
              ["Internal", audit.links.internal],
              ["External", audit.links.external],
              ["Dofollow", dofollow],
              ["Nofollow", audit.links.nofollow],
            ]}
          />
        </div>
      </OverviewCard>

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

function OverviewCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/45 p-3 dark:border-slate-800 dark:bg-slate-900/25">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function MetaRow({
  label,
  children,
  trailing,
}: {
  label: string;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-start gap-2.5 text-xs">
      <span className="pt-0.5 font-medium text-slate-500">{label}</span>
      <div className="min-w-0 leading-relaxed text-slate-800 dark:text-slate-200">
        {children}
      </div>
      {trailing ?? <span />}
    </div>
  );
}

function Fact({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "bad";
}) {
  return (
    <div className="min-w-0 border-l-2 border-slate-200 pl-2 dark:border-slate-700">
      <dt className="text-[9px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-0.5 truncate text-xs font-semibold text-slate-800 dark:text-slate-200",
          tone === "good" && "text-emerald-700 dark:text-emerald-400",
          tone === "bad" && "text-rose-700 dark:text-rose-400"
        )}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/60 px-2 py-2 text-center dark:border-slate-800 dark:bg-slate-950/35">
      <p className="font-display text-lg font-bold tabular-nums text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="text-[9px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );
}

function MetricGroup({
  title,
  metrics,
}: {
  title: string;
  metrics: Array<[string, number]>;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/45 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/25">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <dl className="mt-2 grid grid-cols-3 gap-x-3 gap-y-2">
        {metrics.map(([label, value]) => (
          <div key={label}>
            <dd className="font-display text-base font-bold tabular-nums text-slate-900 dark:text-white">
              {value}
            </dd>
            <dt className="text-[9px] uppercase tracking-wide text-slate-500">
              {label}
            </dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
