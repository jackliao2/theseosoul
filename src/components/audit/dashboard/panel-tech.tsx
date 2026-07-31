import type { AuditResult } from "@/lib/audit/types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function PanelTech({ audit }: { audit: AuditResult }) {
  const { tech } = audit;
  const headerEntries = Object.entries(tech.headers);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
        Page Tech
      </h2>
      <p className="text-sm text-slate-500">{tech.message}</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Charset" value={tech.charset ?? "N/A"} />
        <Stat label="HTML lang" value={tech.lang ?? "N/A"} />
        <Stat label="HTTPS" value={tech.hasHttps ? "Yes" : "No"} />
        <Stat label="HTML size" value={formatBytes(tech.htmlBytes)} />
        <Stat label="Scripts" value={String(tech.scriptCount)} />
        <Stat label="Stylesheets" value={String(tech.stylesheetCount)} />
        <Stat label="Generator" value={tech.generator ?? "N/A"} />
        <Stat
          label="Sitemap"
          value={tech.sitemapPresent ? "Found" : "Not found"}
        />
        <Stat
          label="X-Robots-Tag"
          value={tech.xRobotsTag ?? "Not set"}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Viewport
        </h3>
        <p className="mt-2 break-all text-sm text-slate-600 dark:text-slate-400">
          {tech.viewport ?? "Missing viewport meta tag"}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Response headers
        </h3>
        {headerEntries.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No headers captured.</p>
        ) : (
          <dl className="mt-3 space-y-2">
            {headerEntries.map(([key, value]) => (
              <div key={key} className="grid gap-1 sm:grid-cols-[180px_1fr]">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {key}
                </dt>
                <dd className="break-all text-sm text-slate-800 dark:text-slate-200">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {tech.sitemapUrl ? (
          <p className="mt-4 text-xs text-slate-500">
            Checked:{" "}
            <a
              href={tech.sitemapUrl}
              className="text-teal-700 hover:underline dark:text-teal-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              {tech.sitemapUrl}
            </a>
          </p>
        ) : null}
      </div>

      {audit.robots.sitemapDirectives.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Sitemap directives in robots.txt
          </h3>
          <ul className="mt-2 space-y-1">
            {audit.robots.sitemapDirectives.map((entry) => (
              <li key={entry}>
                <a
                  href={entry}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-sm text-teal-700 hover:underline dark:text-teal-400"
                >
                  {entry}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {audit.robots.content ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            robots.txt preview
          </h3>
          <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-300">
            {audit.robots.content}
          </pre>
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
      <p className="mt-1 break-all font-display text-base font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
