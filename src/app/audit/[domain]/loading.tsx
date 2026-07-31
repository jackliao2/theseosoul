import { LoaderCircle } from "lucide-react";

const checks = [
  "Page & redirects",
  "Robots & sitemap",
  "DNS records",
  "TLS certificate",
  "WHOIS / RDAP",
  "On-page signals",
] as const;

export default function AuditLoading() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside
        className="hidden w-[168px] shrink-0 border-r border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 md:block"
        aria-hidden
      >
        <div className="mb-4 h-6 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="mb-2 h-9 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800/80"
          />
        ))}
      </aside>

      <div className="flex flex-1 flex-col">
        <div
          className="flex items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-800"
          aria-hidden
        >
          <div className="h-8 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="ml-auto h-8 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
        </div>

        <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-35" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, color-mix(in oklab, var(--accent) 12%, transparent), transparent 38%)",
            }}
          />

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
              We’re checking the live site from our servers. Slower websites can
              take a little longer.
            </p>

            <div className="relative mt-6 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <span className="audit-loading-bar absolute inset-y-0 w-2/5 rounded-full bg-teal-700 dark:bg-teal-400" />
            </div>

            <ul className="mt-5 grid grid-cols-2 gap-2 text-left">
              {checks.map((check, index) => (
                <li
                  key={check}
                  className="flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white/45 px-2.5 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/35 dark:text-slate-300"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-teal-700 dark:bg-teal-300"
                    style={{ animationDelay: `${index * 140}ms` }}
                  />
                  {check}
                </li>
              ))}
            </ul>

            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
              Keep this tab open · report appears automatically
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
