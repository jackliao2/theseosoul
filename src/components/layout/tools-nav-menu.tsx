"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { TOOL_CATALOG } from "@/lib/tools/catalog";
import { cn } from "@/lib/utils";

const featured = TOOL_CATALOG.filter((t) => t.group === "featured");
const rest = TOOL_CATALOG.filter((t) => t.group !== "featured");

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
          "absolute left-0 top-full z-50 w-[22rem] pt-2 transition-[opacity,transform] duration-150",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        )}
      >
        <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-[color:var(--surface)] shadow-[0_16px_40px_-20px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:shadow-[0_16px_40px_-18px_rgba(0,0,0,0.65)]">
          {featured.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block border-b border-slate-100 px-4 py-3 transition-colors hover:bg-teal-800/[0.06] dark:border-slate-800 dark:hover:bg-teal-400/10"
            >
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-teal-800 dark:text-teal-300">
                Start here
              </span>
              <span className="mt-0.5 block text-sm font-semibold text-slate-900 dark:text-slate-50">
                {item.title}
              </span>
            </Link>
          ))}

          <ul className="grid grid-cols-2 gap-x-1 gap-y-0.5 p-2">
            {rest.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2.5 py-2 text-[13px] font-medium leading-snug text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  {item.title.replace(/ Checker$/, "")}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/tools"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-semibold text-teal-800 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/60 dark:text-teal-300 dark:hover:bg-slate-900"
          >
            All free tools
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
        <div className="mb-1 ml-2 space-y-0.5 border-l border-slate-200 pl-2 dark:border-slate-700">
          {TOOL_CATALOG.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {item.title}
            </Link>
          ))}
          <Link
            href="/tools"
            onClick={onNavigate}
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-teal-800 dark:text-teal-300"
          >
            All free tools →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
