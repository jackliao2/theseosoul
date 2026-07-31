export default function AuditLoading() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <div className="hidden w-[168px] shrink-0 border-r border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 md:block">
        <div className="mb-4 h-6 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="mb-2 h-9 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800/80"
          />
        ))}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-800">
          <div className="h-8 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="ml-auto h-8 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
        </div>
        <div className="flex-1 space-y-4 p-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 animate-pulse rounded-full bg-teal-100/70 dark:bg-teal-950/40" />
            <div className="space-y-2">
              <div className="h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-72 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
            </div>
          </div>
          <div className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />
          <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
          <div className="space-y-1 pt-4 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Running technical audit…
            </p>
            <p className="text-xs text-slate-500">
              Fetching page · redirect chain · DNS · TLS · WHOIS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
