"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu, RefreshCw, X } from "lucide-react";
import Link from "next/link";
import { SidebarNav } from "@/components/audit/dashboard/sidebar-nav";
import { PanelOverview } from "@/components/audit/dashboard/panel-overview";
import { PanelIssues } from "@/components/audit/dashboard/panel-issues";
import { PanelGeo } from "@/components/audit/dashboard/panel-geo";
import { PanelDensity } from "@/components/audit/dashboard/panel-density";
import { PanelStructure } from "@/components/audit/dashboard/panel-structure";
import { PanelSignals } from "@/components/audit/dashboard/panel-signals";
import { PanelDomain } from "@/components/audit/dashboard/panel-domain";
import { PanelLocked } from "@/components/audit/dashboard/panel-locked";
import { DashboardSearch } from "@/components/audit/dashboard/dashboard-search";
import { ReportActions } from "@/components/audit/dashboard/report-actions";
import { resolveAuditTabId } from "@/components/audit/dashboard/nav-config";
import { rememberRecentDomain } from "@/components/home/recent-audits";
import { Button } from "@/components/ui/button";
import type { AuditResult, AuditTabId } from "@/lib/audit/types";
import { cn } from "@/lib/utils";

export function AuditDashboard({ audit }: { audit: AuditResult }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [active, setActive] = useState<AuditTabId>(() =>
    resolveAuditTabId(tabParam)
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();

  useEffect(() => {
    setActive(resolveAuditTabId(tabParam));
  }, [tabParam]);

  useEffect(() => {
    rememberRecentDomain(audit.domain);
  }, [audit.domain]);

  const selectTab = useCallback(
    (id: AuditTabId) => {
      setActive(id);
      setMobileNavOpen(false);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  function onRefresh() {
    startRefresh(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", active);
      params.set("t", String(Date.now()));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      router.refresh();
    });
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-white dark:bg-slate-950">
      <div className="hidden md:block">
        <SidebarNav active={active} onSelect={selectTab} />
      </div>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative z-10 h-full">
            <SidebarNav active={active} onSelect={selectTab} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 px-2.5 py-2 sm:px-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-sm font-bold text-slate-900 dark:text-white">
                {audit.domain}
              </h1>
              <p className="text-[11px] tabular-nums text-slate-500">
                <span
                  className={cn(
                    "mr-1 inline-flex rounded px-1 py-0.5 text-[10px] font-bold text-white",
                    audit.grade === "A"
                      ? "bg-emerald-500"
                      : audit.grade === "B"
                        ? "bg-teal-500"
                        : audit.grade === "C"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                  )}
                >
                  {audit.grade}
                </span>
                {audit.score} · GEO {audit.geo.score}
              </p>
            </div>

            <div className="hidden min-w-0 flex-1 justify-center sm:flex md:max-w-xs lg:max-w-md">
              <DashboardSearch currentDomain={audit.domain} />
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
              <div className="sm:hidden">
                <DashboardSearch currentDomain={audit.domain} compact />
              </div>
              <ReportActions audit={audit} />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Refresh audit"
                onClick={onRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={cn("h-4 w-4", isRefreshing && "animate-spin")}
                />
              </Button>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Close"
              >
                <Link href="/">
                  <X className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div
          className={cn(
            "min-h-0 flex-1 px-4 py-3 sm:px-5",
            "overflow-y-auto"
          )}
        >
          {renderPanel(active, audit, selectTab)}
        </div>
      </div>
    </div>
  );
}

function renderPanel(
  active: AuditTabId,
  audit: AuditResult,
  onSelectTab: (id: AuditTabId) => void
) {
  switch (active) {
    case "overview":
      return <PanelOverview audit={audit} onSelectTab={onSelectTab} />;
    case "issues":
      return <PanelIssues audit={audit} />;
    case "structure":
      return <PanelStructure audit={audit} />;
    case "keywords":
      return <PanelDensity audit={audit} />;
    case "signals":
      return <PanelSignals audit={audit} />;
    case "geo":
      return <PanelGeo audit={audit} />;
    case "domain":
      return <PanelDomain audit={audit} />;
    case "insights":
      return (
        <PanelLocked
          title="Insights"
          description="Traffic, backlinks, and live SERP need paid third-party data APIs. The free technical report covers everything else — run another audit anytime."
        />
      );
    default:
      return <PanelOverview audit={audit} onSelectTab={onSelectTab} />;
  }
}
