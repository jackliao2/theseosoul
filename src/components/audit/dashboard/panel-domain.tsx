"use client";

import { useState } from "react";
import type { AuditResult, TextFileCheck } from "@/lib/audit/types";
import { cn } from "@/lib/utils";

type Sub = "whois" | "tech" | "dns" | "files";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function PanelDomain({ audit }: { audit: AuditResult }) {
  const [sub, setSub] = useState<Sub>("whois");
  const { whois, tech, extras } = audit;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Domain
        </h2>
        <div className="flex rounded-md border border-slate-200 p-0.5 text-xs dark:border-slate-700">
          {(
            [
              ["whois", "WHOIS"],
              ["tech", "Tech"],
              ["dns", "DNS"],
              ["files", "Files"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSub(id)}
              className={cn(
                "rounded px-2.5 py-1 font-semibold transition-colors",
                sub === id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {sub === "whois" ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">{whois.message}</p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
            <Fact label="Created" value={fmt(whois.createdAt)} />
            <Fact label="Expires" value={fmt(whois.expiresAt)} />
            <Fact
              label="Age"
              value={
                whois.ageYears != null ? `${whois.ageYears} years` : "—"
              }
            />
            <Fact label="Registrar" value={whois.registrar ?? "—"} />
            <Fact
              label="Source"
              value={whois.source === "rdap" ? "RDAP (free)" : "Unavailable"}
            />
            <Fact label="Updated" value={fmt(whois.updatedAt)} />
          </dl>
          {whois.nameServers.length ? (
            <div className="border-t border-slate-200 pt-2 dark:border-slate-800">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Name servers
              </p>
              <ul className="mt-1 columns-1 gap-x-6 text-xs text-slate-700 sm:columns-2 dark:text-slate-300">
                {whois.nameServers.map((ns) => (
                  <li key={ns} className="font-mono">
                    {ns}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {sub === "tech" ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">{tech.message}</p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3 lg:grid-cols-4">
            <Fact label="Charset" value={tech.charset ?? "—"} />
            <Fact label="Lang" value={tech.lang ?? "—"} />
            <Fact label="HTTPS" value={tech.hasHttps ? "Yes" : "No"} />
            <Fact
              label="TLS days"
              value={
                extras.ssl.daysRemaining != null
                  ? String(extras.ssl.daysRemaining)
                  : "—"
              }
            />
            <Fact label="TLS issuer" value={extras.ssl.issuer ?? "—"} />
            <Fact label="HTML" value={formatBytes(tech.htmlBytes)} />
            <Fact label="Text/HTML" value={`${extras.textHtmlRatio}%`} />
            <Fact label="Scripts" value={String(tech.scriptCount)} />
            <Fact label="CSS" value={String(tech.stylesheetCount)} />
            <Fact label="Generator" value={tech.generator ?? "—"} />
            <Fact
              label="Sitemap"
              value={tech.sitemapPresent ? "Found" : "Missing"}
            />
            <Fact label="Viewport" value={tech.viewport ? "Set" : "Missing"} />
            <Fact label="Security" value={`${extras.security.score}/100`} />
            <Fact label="Read time" value={`~${extras.readingMinutes} min`} />
            <Fact
              label="Title↔H1"
              value={
                extras.titleH1.score != null
                  ? `${extras.titleH1.score}%`
                  : "—"
              }
            />
            <Fact
              label="PWA"
              value={
                extras.pwa.manifestUrl
                  ? "Manifest"
                  : extras.pwa.appleTouchIcon
                    ? "Icon only"
                    : "None"
              }
            />
            <Fact
              label="Mixed"
              value={
                extras.mixedContent.applicable
                  ? extras.mixedContent.count
                    ? `${extras.mixedContent.count} http`
                    : "Clean"
                  : "n/a"
              }
            />
            <Fact
              label="Redirects"
              value={
                extras.redirectChain.length > 1
                  ? `${extras.redirectChain.length} hops`
                  : "None"
              }
            />
          </dl>

          {extras.ssl.message ? (
            <p className="text-xs text-slate-500">{extras.ssl.message}</p>
          ) : null}

          {extras.stack.length ? (
            <ChipRow label="Stack" items={extras.stack} tone="teal" />
          ) : null}

          {extras.trackers.length ? (
            <ChipRow label="Trackers" items={extras.trackers} tone="amber" />
          ) : null}

          {extras.redirectChain.length > 1 ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900">
                Redirect chain
              </p>
              <ol className="divide-y divide-slate-100 dark:divide-slate-800">
                {extras.redirectChain.map((hop, i) => (
                  <li
                    key={`${hop.url}-${i}`}
                    className="grid grid-cols-[2.5rem_1fr] gap-2 px-2.5 py-1 text-[11px]"
                  >
                    <span className="font-mono text-slate-500">{hop.status}</span>
                    <span className="truncate text-slate-700 dark:text-slate-300">
                      {hop.url}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {tech.sitemapSamples.length ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900">
                Sitemap samples
              </p>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {tech.sitemapSamples.map((u) => (
                  <li key={u} className="px-2.5 py-1 text-[11px]">
                    <a
                      href={u}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-teal-700 hover:underline dark:text-teal-400"
                    >
                      {u}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Security headers
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {extras.security.checks.map((c) => (
                <span
                  key={c.id}
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                    c.present
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-900"
                  )}
                >
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          {extras.mixedContent.applicable && extras.mixedContent.count > 0 ? (
            <div className="overflow-hidden rounded-lg border border-amber-200 dark:border-amber-900/50">
              <p className="bg-amber-50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                Mixed content · {extras.mixedContent.count}
              </p>
              <ul className="divide-y divide-amber-100 dark:divide-amber-900/40">
                {extras.mixedContent.items.map((item) => (
                  <li
                    key={item.url}
                    className="grid grid-cols-[3.5rem_1fr] gap-2 px-2.5 py-1 text-[11px]"
                  >
                    <span className="font-mono uppercase text-amber-700 dark:text-amber-400">
                      {item.kind}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-slate-700 hover:underline dark:text-slate-300"
                    >
                      {item.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {Object.keys(tech.headers).length ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
              {Object.entries(tech.headers).map(([k, v]) => (
                <div
                  key={k}
                  className="grid grid-cols-[7rem_1fr] gap-2 border-b border-slate-100 px-2.5 py-1 text-xs last:border-0 dark:border-slate-800"
                >
                  <span className="truncate font-mono text-slate-500">{k}</span>
                  <span className="truncate text-slate-700 dark:text-slate-300">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {sub === "dns" ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">{extras.dns.message}</p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
            <Fact
              label="A"
              value={extras.dns.a.length ? extras.dns.a.join(", ") : "—"}
            />
            <Fact
              label="AAAA"
              value={extras.dns.aaaa.length ? extras.dns.aaaa.join(", ") : "—"}
            />
            <Fact
              label="MX"
              value={extras.dns.mx.length ? extras.dns.mx.join(", ") : "—"}
            />
            <Fact
              label="NS"
              value={extras.dns.ns.length ? extras.dns.ns.join(", ") : "—"}
            />
            <Fact label="SPF" value={extras.dns.spf ? "Yes" : "Missing"} />
            <Fact label="DMARC" value={extras.dns.dmarc ? "Yes" : "Missing"} />
          </dl>
          {extras.dns.spf ? (
            <pre className="overflow-auto rounded bg-slate-50 p-2 font-mono text-[10px] text-slate-600 dark:bg-slate-950 dark:text-slate-400">
              {extras.dns.spf}
            </pre>
          ) : null}
          {extras.dns.dmarc ? (
            <pre className="overflow-auto rounded bg-slate-50 p-2 font-mono text-[10px] text-slate-600 dark:bg-slate-950 dark:text-slate-400">
              {extras.dns.dmarc}
            </pre>
          ) : null}
        </div>
      ) : null}

      {sub === "files" ? (
        <div className="space-y-3">
          <FileCard title="llms.txt" file={extras.llmsTxt} tip="GEO / AI summary" />
          <FileCard title="ads.txt" file={extras.adsTxt} tip="Ad authorization" />
          <FileCard title="humans.txt" file={extras.humansTxt} tip="Team credits" />
          <FileCard
            title="security.txt"
            file={extras.securityTxt}
            tip="Vulnerability contact"
          />
        </div>
      ) : null}
    </div>
  );
}

function ChipRow({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: "teal" | "amber";
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-1 flex flex-wrap gap-1">
        {items.map((item) => (
          <span
            key={item}
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-semibold",
              tone === "teal"
                ? "bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
                : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function FileCard({
  title,
  file,
  tip,
}: {
  title: string;
  file: TextFileCheck;
  tip: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 px-2.5 py-2 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
            <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">
              {tip}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{file.message}</p>
        </div>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
            file.present
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-slate-100 text-slate-500 dark:bg-slate-900"
          )}
        >
          {file.present ? "Found" : "Missing"}
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-slate-500">
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-700 hover:underline dark:text-teal-400"
        >
          {file.url}
        </a>
        {file.present ? (
          <span>
            {formatBytes(file.bytes)} · {file.lineCount} lines
          </span>
        ) : null}
      </div>
      {file.preview ? (
        <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-2 font-mono text-[10px] leading-relaxed text-slate-600 dark:bg-slate-950 dark:text-slate-400">
          {file.preview}
          {file.bytes > 220 ? "…" : ""}
        </pre>
      ) : null}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-l-2 border-slate-200 pl-2 dark:border-slate-700">
      <dt className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="truncate font-medium text-slate-900 dark:text-white">
        {value}
      </dd>
    </div>
  );
}
