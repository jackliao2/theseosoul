import { AuditLoadingSteps } from "@/components/audit/audit-loading-steps";

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

          <div className="relative">
            <AuditLoadingSteps />
          </div>
        </main>
      </div>
    </div>
  );
}
