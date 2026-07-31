"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SiteBrand } from "@/components/brand/site-mark";
import {
  ToolsMobileNav,
  ToolsNavMenu,
} from "@/components/layout/tools-nav-menu";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/#features", label: "Features" },
  { href: "/#faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-slate-200/70 bg-[color:var(--surface)]/90 backdrop-blur-xl dark:border-slate-700/80",
        compact && "border-slate-200 dark:border-slate-700"
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-14 items-center justify-between px-4 sm:px-6",
          compact ? "max-w-none" : "h-16 max-w-6xl"
        )}
      >
        <Link
          href="/"
          className="group transition-transform hover:scale-[1.02]"
          aria-label="TheSeoSoul home"
        >
          <SiteBrand size="md" />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {!compact ? (
            <>
              <ToolsNavMenu />
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white md:inline-block"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/#home-audit-url"
                className="rounded-md bg-teal-800 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
              >
                Free audit
              </Link>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          ) : (
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
            >
              New audit
            </Link>
          )}
          <ThemeToggle />
        </nav>
      </div>

      {!compact && open ? (
        <div className="border-t border-slate-200 bg-[color:var(--surface)] px-4 py-3 dark:border-slate-700 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            <ToolsMobileNav onNavigate={() => setOpen(false)} />
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
