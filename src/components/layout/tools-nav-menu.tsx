"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { AuditCtaLink } from "@/components/layout/audit-cta-link";
import { TOOL_CATALOG } from "@/lib/tools/catalog";
import { cn } from "@/lib/utils";

const featured = TOOL_CATALOG.find((t) => t.group === "featured")!;
const growth = TOOL_CATALOG.filter((t) => t.group === "growth");
const checkers = TOOL_CATALOG.filter((t) => t.group === "checkers");
const content = TOOL_CATALOG.filter((t) => t.group === "content");

export function ToolsNavMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative hidden md:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          open
            ? "text-slate-900 dark:text-white"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        Tools
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 opacity-70 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <div
        id={menuId}
        role="menu"
        aria-hidden={!open}
        className={cn(
          "absolute left-1/2 top-full z-50 w-[min(28rem,calc(100vw-1.5rem))] -translate-x-1/2 pt-2 transition-[opacity,transform] duration-200 ease-out",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-1 opacity-0"
        )}
      >
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-[color:var(--surface)] shadow-[0_24px_60px_-28px_rgba(15,23,42,0.45)] dark:border-slate-600/80 dark:shadow-[0_28px_70px_-24px_rgba(0,0,0,0.75)]">
          {/* Atmosphere */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 0% 0%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 100%, color-mix(in oklab, var(--accent) 10%, transparent), transparent 50%)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-grain opacity-30 dark:opacity-20" />

          <div className="relative p-3">
            <AuditCtaLink
              onNavigate={() => setOpen(false)}
              className="group flex items-stretch gap-3 overflow-hidden rounded-xl bg-[#0b1220] px-3.5 py-3 text-left transition-transform duration-200 hover:scale-[1.01] dark:bg-[#0a1018]"
            >
              <span className="flex w-1 shrink-0 rounded-full bg-teal-400/90" />
              <span className="min-w-0 flex-1">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-teal-300/90">
                  Whole site
                </span>
                <span className="mt-0.5 block font-display text-[15px] font-bold tracking-tight text-white">
                  {featured.title}
                </span>
                <span className="mt-0.5 block text-xs text-slate-400">
                  {featured.short}
                </span>
              </span>
              <span className="self-center font-display text-lg text-teal-300/80 transition-transform group-hover:translate-x-0.5">
                ↗
              </span>
            </AuditCtaLink>

            <div className="mt-3 grid grid-cols-2 gap-1">
              {checkers.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="group rounded-xl px-3 py-2.5 transition-colors hover:bg-white/70 dark:hover:bg-white/[0.06]"
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-[13px] font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      {item.nav}
                    </span>
                    <span className="font-mono text-[9px] tabular-nums text-slate-300 transition-colors group-hover:text-teal-700 dark:text-slate-600 dark:group-hover:text-teal-300">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                    {item.short}
                  </span>
                </Link>
              ))}
            </div>

            {growth.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center justify-between gap-3 rounded-xl border border-teal-800/15 bg-teal-800/[0.04] px-3 py-2.5 transition-colors hover:border-teal-800/30 hover:bg-teal-800/[0.08] dark:border-teal-400/15 dark:bg-teal-400/[0.05] dark:hover:border-teal-400/30"
              >
                <span>
                  <span className="font-display text-[13px] font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    {item.nav}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                    {item.short}
                  </span>
                </span>
                <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                  New
                </span>
              </Link>
            ))}

            {content.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/70 dark:hover:bg-white/[0.06]"
              >
                <span>
                  <span className="font-display text-[13px] font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    {item.nav}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                    {item.short}
                  </span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-teal-800/70 dark:text-teal-300/70">
                  GEO
                </span>
              </Link>
            ))}
          </div>

          <Link
            href="/tools"
            onClick={() => setOpen(false)}
            className="relative flex items-center justify-between border-t border-slate-200/80 px-4 py-2.5 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-teal-800/[0.05] hover:text-teal-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-teal-400/[0.06] dark:hover:text-teal-200"
          >
            <span>See the full toolkit</span>
            <span className="font-display text-teal-800 dark:text-teal-300">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ToolsMobileNav({ onNavigate }: { onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        Tools
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>
      {expanded ? (
        <div className="mb-1 ml-1 space-y-0.5 border-l-2 border-teal-800/25 pl-2 dark:border-teal-400/25">
          <AuditCtaLink onNavigate={onNavigate} className="block rounded-lg px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-teal-800 dark:text-teal-300">
              Whole site
            </span>
            <span className="mt-0.5 block text-sm font-semibold text-slate-900 dark:text-slate-50">
              {featured.title}
            </span>
          </AuditCtaLink>
          {growth.concat(checkers, content).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {item.nav}
              <span className="mt-0.5 block text-[11px] text-slate-400">
                {item.short}
              </span>
            </Link>
          ))}
          <Link
            href="/tools"
            onClick={onNavigate}
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-teal-800 dark:text-teal-300"
          >
            See the full toolkit →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
