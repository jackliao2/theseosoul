import type { AuditResult } from "@/lib/audit/types";

export function PanelLinks({ audit }: { audit: AuditResult }) {
  const { links } = audit;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
        Links
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={links.total} />
        <Stat label="Internal" value={links.internal} />
        <Stat label="External" value={links.external} />
        <Stat label="Nofollow" value={links.nofollow} />
      </div>
      <p className="text-sm text-slate-500">{links.message}</p>
      <ul className="max-h-[520px] space-y-2 overflow-y-auto">
        {links.items.map((link, i) => (
          <li
            key={`${link.href}-${i}`}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={
                  link.internal
                    ? "rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                    : "rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }
              >
                {link.internal ? "Internal" : "External"}
              </span>
              {link.nofollow ? (
                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                  nofollow
                </span>
              ) : null}
            </div>
            <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">
              {link.text}
            </p>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block truncate text-xs text-teal-700 hover:underline dark:text-teal-400"
            >
              {link.href}
            </a>
          </li>
        ))}
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
