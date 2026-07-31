import type { AuditResult } from "@/lib/audit/types";

export function PanelHreflangs({ audit }: { audit: AuditResult }) {
  const { hreflangs } = audit;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
        Hreflangs
      </h2>
      <p className="text-sm text-slate-500">{hreflangs.message}</p>
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950/60">
            <tr>
              <th className="px-4 py-3">Lang</th>
              <th className="px-4 py-3">Href</th>
            </tr>
          </thead>
          <tbody>
            {hreflangs.items.map((item, i) => (
              <tr
                key={`${item.lang}-${i}`}
                className="border-t border-slate-100 dark:border-slate-800"
              >
                <td className="px-4 py-2.5 font-medium">{item.lang}</td>
                <td className="px-4 py-2.5 break-all text-teal-700 dark:text-teal-400">
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    {item.href}
                  </a>
                </td>
              </tr>
            ))}
            {hreflangs.items.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                  No hreflang tags found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
