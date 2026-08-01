"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SiteBrand } from "@/components/brand/site-mark";
import { AuditCtaLink } from "@/components/layout/audit-cta-link";
import {
  ToolsMobileNav,
  ToolsNavMenu,
} from "@/components/layout/tools-nav-menu";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/#features", label: "Features" },
  { href: "/blog", label: "Guides" },
  { href: "/#faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const navLinkClass =
  "hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white md:inline-block";

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
              <Link href="/tools/domain-history" className={navLinkClass}>
                Domain History
              </Link>
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className={navLinkClass}>
                  {item.label}
                </Link>
              ))}
              <AuditCtaLink className="rounded-md bg-teal-800 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300">
                Free audit
              </AuditCtaLink>
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
            <>
              <ToolsNavMenu openInNewTab />
              <Link
                href="/tools/domain-history"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white lg:inline-block"
              >
                Domain History
              </Link>
              <Link
                href="/#home-audit-url"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
              >
                New audit
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
          )}
          <ThemeToggle />
        </nav>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-[color:var(--surface)] px-4 py-3 dark:border-slate-700 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            <Link
              href="/tools/domain-history"
              {...(compact
                ? { target: "_blank" as const, rel: "noopener noreferrer" }
                : {})}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Domain History
            </Link>
            <ToolsMobileNav
              onNavigate={() => setOpen(false)}
              openInNewTab={compact}
            />
            {!compact ? (
              NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  {item.label}
                </Link>
              ))
            ) : (
              <>
                <Link
                  href="/about"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  About
                </Link>
                <Link
                  href="/#home-audit-url"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  New audit
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
