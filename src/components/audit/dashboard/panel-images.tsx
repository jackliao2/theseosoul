import type { AuditResult } from "@/lib/audit/types";

export function PanelImages({ audit }: { audit: AuditResult }) {
  const { images } = audit;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
        Images
      </h2>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Total" value={images.total} />
        <Stat label="With alt" value={images.withAlt} />
        <Stat label="Missing alt" value={images.missingAlt} />
      </div>
      <p className="text-sm text-slate-500">{images.message}</p>
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950/60">
            <tr>
              <th className="px-3 py-2">Src</th>
              <th className="px-3 py-2">Alt</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {images.items.slice(0, 80).map((img, i) => (
              <tr
                key={`${img.src}-${i}`}
                className="border-t border-slate-100 dark:border-slate-800"
              >
                <td className="max-w-[220px] truncate px-3 py-2 text-slate-600">
                  {img.src || "—"}
                </td>
                <td className="max-w-[220px] truncate px-3 py-2">
                  {img.alt ?? "—"}
                </td>
                <td className="px-3 py-2">
                  {img.missingAlt ? (
                    <span className="text-rose-600">Missing</span>
                  ) : (
                    <span className="text-emerald-600">OK</span>
                  )}
                </td>
              </tr>
            ))}
            {images.items.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-slate-500">
                  No images found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
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
