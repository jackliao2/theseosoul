"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { TOOL_CATALOG } from "@/lib/tools/catalog";
import { cn } from "@/lib/utils";

/** Pinned in the top nav — keep out of the Tools list. */
const PINNED_HREF = "/tools/domain-history";

const dropdownTools = TOOL_CATALOG.filter(
  (t) =>
    t.href !== PINNED_HREF &&
    (t.group === "growth" || t.group === "content")
);

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
          "absolute left-0 top-full z-50 w-52 pt-2 transition-[opacity,transform] duration-150 ease-out",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-1 opacity-0"
        )}
      >
        <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-[color:var(--surface)] py-1.5 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.35)] dark:border-slate-600 dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)]">
          {dropdownTools.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {item.nav}
            </Link>
          ))}

          <div className="my-1 border-t border-slate-200/80 dark:border-slate-700" />

          <Link
            href="/tools"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-800/[0.06] dark:text-teal-300 dark:hover:bg-teal-400/[0.08]"
          >
            <span>All tools</span>
            <span aria-hidden>→</span>
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
          {dropdownTools.map((item) => (
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
