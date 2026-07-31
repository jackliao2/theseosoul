import type { AuditResult } from "@/lib/audit/types";

function fmt(iso: string | null): string {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
}

export function PanelWhois({ audit }: { audit: AuditResult }) {
  const { whois } = audit;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
        Whois
      </h2>
      <p className="text-sm text-slate-500">{whois.message}</p>

      <div className="grid overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 sm:grid-cols-2">
        <Cell label="Domain" value={whois.domain} />
        <Cell
          label="Domain Age"
          value={
            whois.ageYears != null ? `${whois.ageYears} years` : "N/A"
          }
        />
        <Cell label="Domain Creation" value={fmt(whois.createdAt)} />
        <Cell label="Domain Expiration" value={fmt(whois.expiresAt)} />
        <Cell label="Last Updated" value={fmt(whois.updatedAt)} />
        <Cell label="Registrar" value={whois.registrar ?? "N/A"} />
        <Cell label="Source" value={whois.source === "rdap" ? "RDAP" : "Unavailable"} />
        <Cell
          label="Status"
          value={whois.status.length ? whois.status.join(", ") : "N/A"}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Name servers
        </h3>
        {whois.nameServers.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No name servers returned.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
            {whois.nameServers.map((ns) => (
              <li key={ns} className="font-mono text-xs sm:text-sm">
                {ns}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 sm:odd:border-r">
      <div className="bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 dark:bg-slate-950/60">
        {label}
      </div>
      <div className="break-words px-3 py-3 text-sm text-slate-800 dark:text-slate-200">
        {value}
      </div>
    </div>
  );
}
