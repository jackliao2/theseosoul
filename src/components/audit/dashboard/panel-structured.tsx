import type { AuditResult } from "@/lib/audit/types";

export function PanelStructured({ audit }: { audit: AuditResult }) {
  const { structured } = audit;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
        Structured Data
      </h2>
      <p className="text-sm text-slate-500">{structured.message}</p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="JSON-LD blocks" value={String(structured.jsonLdCount)} />
        <Stat label="Schema types" value={String(structured.types.length)} />
        <Stat
          label="Microdata"
          value={structured.hasMicrodata ? "Yes" : "No"}
        />
      </div>

      {structured.types.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {structured.types.map((type) => (
            <span
              key={type}
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {type}
            </span>
          ))}
        </div>
      ) : null}

      {structured.snippets.length > 0 ? (
        <div className="space-y-3">
          {structured.snippets.map((snippet, i) => (
            <pre
              key={i}
              className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              {snippet}
            </pre>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/50">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
