"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { AuditCtaLink } from "@/components/layout/audit-cta-link";
import { TOOL_CATALOG } from "@/lib/tools/catalog";
import { cn } from "@/lib/utils";

const featured = TOOL_CATALOG.find((t) => t.group === "featured")!;
const spotlights = TOOL_CATALOG.filter((t) => t.spotlight);
const moreTools = TOOL_CATALOG.filter(
  (t) =>
    (t.group === "growth" || t.group === "content") && !t.spotlight
);
const checkers = TOOL_CATALOG.filter((t) => t.group === "checkers");

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
          "absolute left-1/2 top-full z-50 w-[min(36rem,calc(100vw-1.5rem))] -translate-x-1/2 pt-2 transition-[opacity,transform] duration-200 ease-out",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-1 opacity-0"
        )}
      >
        <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-[color:var(--surface)] shadow-[0_20px_50px_-24px_rgba(15,23,42,0.4)] dark:border-slate-600/80 dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 0% 0%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 55%)",
            }}
          />

          <div className="relative grid grid-cols-[13.5rem_minmax(0,1fr)]">
            <div className="border-r border-slate-200/80 bg-[#0b1220] p-3 dark:border-slate-700">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-teal-300/80">
                Start here
              </p>
              <AuditCtaLink
                onNavigate={() => setOpen(false)}
                className="mt-2 block rounded-lg px-0 py-0.5 text-left"
              >
                <span className="block font-display text-sm font-bold tracking-tight text-white">
                  {featured.nav}
                </span>
                <span className="mt-1 block text-[11px] leading-snug text-slate-400">
                  {featured.short}
                </span>
              </AuditCtaLink>

              <div className="mt-4 border-t border-white/10 pt-3">
                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-teal-300/70">
                  Highlights
                </p>
                <div className="mt-2 space-y-1">
                  {spotlights.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-1.5 py-2 transition-colors hover:bg-white/5"
                    >
                      <span className="block font-display text-[13px] font-bold tracking-tight text-white">
                        {item.nav}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-slate-400">
                        {item.short}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {moreTools.length > 0 ? (
                <div className="mt-3 space-y-0.5 border-t border-white/10 pt-3">
                  {moreTools.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-2 rounded-md px-1.5 py-1.5 text-[13px] font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <span className="truncate">{item.nav}</span>
                      {item.group === "content" ? (
                        <span className="shrink-0 font-mono text-[8px] uppercase tracking-wider text-slate-500">
                          GEO
                        </span>
                      ) : null}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="p-3">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Page checkers
              </p>
              <div className="mt-2 grid grid-cols-2 gap-x-1 gap-y-0.5">
                {checkers.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    title={item.short}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-2 py-1.5 text-[13px] font-semibold text-slate-800 transition-colors hover:bg-teal-800/[0.06] hover:text-teal-900 dark:text-slate-100 dark:hover:bg-white/[0.06] dark:hover:text-white"
                  >
                    {item.nav}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/tools"
            onClick={() => setOpen(false)}
            className="relative flex items-center justify-between border-t border-slate-200/80 px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-teal-800/[0.04] hover:text-teal-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-teal-400/[0.06] dark:hover:text-teal-200"
          >
            <span>All tools</span>
            <span className="text-teal-800 dark:text-teal-300">→</span>
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
          <AuditCtaLink
            onNavigate={onNavigate}
            className="block rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-slate-50"
          >
            {featured.nav}
          </AuditCtaLink>
          {spotlights.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="block rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {item.nav}
            </Link>
          ))}
          {moreTools.concat(checkers).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="block rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {item.nav}
            </Link>
          ))}
          <Link
            href="/tools"
            onClick={onNavigate}
            className="block rounded-lg px-3 py-1.5 text-sm font-semibold text-teal-800 dark:text-teal-300"
          >
            All tools →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
