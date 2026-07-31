import type { AuditResult } from "@/lib/audit/types";

export function PanelHeadings({ audit }: { audit: AuditResult }) {
  const { headings } = audit;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
        Headings
      </h2>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="H1" value={headings.h1Count} />
        <Stat label="H2" value={headings.h2Count} />
        <Stat label="H3" value={headings.h3Count} />
      </div>
      <p className="text-sm text-slate-500">{headings.message}</p>
      <ul className="max-h-[560px] space-y-2 overflow-y-auto">
        {headings.items.map((item, idx) => (
          <li
            key={`${item.level}-${idx}`}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
          >
            <span className="mr-2 font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
              H{item.level}
            </span>
            {item.text}
          </li>
        ))}
        {headings.items.length === 0 ? (
          <li className="text-sm text-slate-500">No headings found.</li>
        ) : null}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center dark:border-slate-800 dark:bg-slate-950/50">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
