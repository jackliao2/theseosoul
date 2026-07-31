"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUDIT_NAV } from "@/components/audit/dashboard/nav-config";
import type { AuditTabId } from "@/lib/audit/types";
import { SiteWordmark } from "@/components/brand/site-mark";

export function SidebarNav({
  active,
  onSelect,
}: {
  active: AuditTabId;
  onSelect: (id: AuditTabId) => void;
}) {
  const free = AUDIT_NAV.filter((i) => !i.locked);
  const locked = AUDIT_NAV.filter((i) => i.locked);

  return (
    <aside className="flex h-full w-[168px] shrink-0 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-200 px-3 py-3 dark:border-slate-800">
        <Link href="/" aria-label="TheSeoSoul home">
          <SiteWordmark size="sm" />
        </Link>
      </div>

      <nav className="flex-1 overflow-hidden px-1.5 py-2">
        <p className="px-2 pb-1 pt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
          Report
        </p>
        <ul className="space-y-0.5">
          {free.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={active === item.id}
              onSelect={onSelect}
            />
          ))}
        </ul>

        {locked.length ? (
          <>
            <p className="mt-3 px-2 pb-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Pro later
            </p>
            <ul className="space-y-0.5">
              {locked.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  active={active === item.id}
                  onSelect={onSelect}
                />
              ))}
            </ul>
          </>
        ) : null}
      </nav>

      <div className="border-t border-slate-200 px-2 py-2 dark:border-slate-800">
        <Link
          href="/tools"
          className="block rounded-md px-2 py-1.5 text-[12px] font-semibold text-teal-800 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/50"
        >
          Free tools →
        </Link>
      </div>
    </aside>
  );
}

function NavButton({
  item,
  active,
  onSelect,
}: {
  item: (typeof AUDIT_NAV)[number];
  active: boolean;
  onSelect: (id: AuditTabId) => void;
}) {
  const Icon = item.icon;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] font-medium transition-colors",
          active
            ? "bg-teal-50 text-teal-900 dark:bg-teal-950/60 dark:text-teal-300"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {item.locked ? <Lock className="h-3 w-3 shrink-0 opacity-50" /> : null}
      </button>
    </li>
  );
}
