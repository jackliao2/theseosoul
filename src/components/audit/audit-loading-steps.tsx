"use client";

import { useEffect, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Fetching page & redirects",
  "Reading robots.txt & sitemap",
  "Checking TLS certificate",
  "Probing DNS / WHOIS",
  "Parsing on-page SEO signals",
  "Scoring GEO & citability",
] as const;

export function AuditLoadingSteps() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    // Keep the step UI snappy — it is cosmetic only; the server audit is the real wait.
    const id = window.setInterval(() => {
      setActive((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-[color:var(--surface)]/95 p-6 text-center shadow-[0_24px_70px_-38px_rgba(15,23,42,0.5)] backdrop-blur sm:p-8 dark:border-slate-700 dark:shadow-[0_28px_80px_-38px_rgba(0,0,0,0.85)]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-800 text-white shadow-[0_12px_30px_-14px_rgba(15,118,110,0.8)] dark:bg-teal-400 dark:text-slate-950">
        <LoaderCircle className="h-7 w-7 animate-spin" />
      </div>

      <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        Running technical audit…
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Checking the live URL you pasted. Most sites finish in a few seconds.
      </p>

      <div className="relative mt-6 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <span
          className="absolute inset-y-0 rounded-full bg-teal-700 transition-[width] duration-700 ease-out dark:bg-teal-400"
          style={{
            width: `${Math.min(96, ((active + 1) / STEPS.length) * 100)}%`,
          }}
        />
      </div>

      <ol className="mt-5 space-y-1.5 text-left">
        {STEPS.map((step, index) => {
          const done = index < active;
          const current = index === active;
          return (
            <li
              key={step}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors",
                done &&
                  "border-emerald-200/80 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
                current &&
                  "border-teal-300/80 bg-teal-50/80 text-teal-900 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200",
                !done &&
                  !current &&
                  "border-slate-200/70 bg-white/45 text-slate-500 dark:border-slate-700 dark:bg-slate-900/35 dark:text-slate-400"
              )}
            >
              {done ? (
                <Check className="h-3.5 w-3.5 shrink-0" />
              ) : current ? (
                <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin" />
              ) : (
                <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-current/30" />
              )}
              {step}
            </li>
          );
        })}
      </ol>

      <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
        Keep this tab open · report appears automatically
      </p>
    </section>
  );
}
