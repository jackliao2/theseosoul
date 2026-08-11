"use client";

import { useState } from "react";
import { ExternalLink, LoaderCircle } from "lucide-react";
import { ToolError } from "@/components/tools/url-tool-form";
import { useUrlQueryPrefill } from "@/components/tools/use-url-query-prefill";
import type {
  DomainHistoryKind,
  DomainHistoryResponse,
  DomainHistoryResult,
  DomainHistoryVerdictId,
} from "@/lib/tools/domain-history-types";
import { cn } from "@/lib/utils";

const kindTone: Record<DomainHistoryKind, string> = {
  content:
    "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  doorway:
    "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  parking: "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
  error: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  redirect:
    "bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
  empty: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  unknown: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const verdictTone: Record<DomainHistoryVerdictId, string> = {
  "no-trail": "text-slate-200",
  "clean-content": "text-emerald-300",
  "mixed-reuse": "text-amber-200",
  "parking-history": "text-amber-200",
  "second-hand": "text-rose-300",
  "risky-signals": "text-rose-300",
};

export function DomainHistoryForm() {
  const [url, setUrl] = useUrlQueryPrefill("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DomainHistoryResponse | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = url.trim();
    if (!value || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(
        `/api/domain-history?url=${encodeURIComponent(value)}`
      );
      const payload = (await response.json()) as DomainHistoryResponse;
      setResult(payload);
    } catch {
      setResult({
        success: false,
        error: "Network error — the archive lookup could not finish.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={onSubmit}
        className="relative overflow-hidden rounded-2xl bg-[#0b1220] p-6 text-white sm:p-8"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 100% at 90% -10%, rgba(45,212,191,.2), transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-300">
            Internet Archive · WHOIS cross-check
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Look up a domain’s past lives
          </h2>
          <label
            htmlFor="domain-history-url"
            className="mt-6 block text-sm font-semibold text-slate-200"
          >
            Domain
          </label>
          <div className="mt-2.5 flex flex-col gap-3 sm:flex-row">
            <input
              id="domain-history-url"
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="theseosoul.com"
              autoComplete="url"
              className="h-14 min-w-0 flex-1 rounded-xl border border-white/15 bg-white px-5 text-lg text-slate-900 outline-none ring-teal-300/50 placeholder:text-slate-400 focus:ring-2"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-400 px-7 text-sm font-bold text-slate-950 hover:bg-teal-300 disabled:cursor-wait disabled:opacity-70 sm:min-w-[10.5rem]"
            >
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Reading…" : "Read history"}
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Free · No login · No AI paywall · Public Wayback + RDAP only
          </p>
        </div>
      </form>

      {loading ? (
        <section className="rounded-2xl border border-slate-200 px-5 py-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <LoaderCircle className="h-5 w-5 animate-spin text-teal-700 dark:text-teal-300" />
            <div>
              <p className="font-display text-base font-bold text-slate-900 dark:text-white">
                Asking the Wayback Machine
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                CDX timeline, representative snapshots, then WHOIS contrast…
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {result && !result.success ? <ToolError>{result.error}</ToolError> : null}
      {result && result.success ? <HistoryReport result={result} /> : null}
    </div>
  );
}

function HistoryReport({ result }: { result: DomainHistoryResult }) {
  const maxMonths = Math.max(1, ...result.years.map((y) => y.monthsActive));

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/30">
      <header className="border-b border-slate-200 bg-[#0b1220] px-5 py-7 text-white sm:px-8 dark:border-slate-800">
        <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-teal-300">
          Domain history · {result.domain}
        </p>
        <h2
          className={cn(
            "mt-2 font-display text-3xl font-bold tracking-tight",
            verdictTone[result.verdict.id]
          )}
        >
          {result.verdict.label}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
          {result.verdict.detail}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 sm:grid-cols-4">
          <Stat label="First capture" value={result.stats.firstLabel ?? "—"} />
          <Stat label="Latest capture" value={result.stats.lastLabel ?? "—"} />
          <Stat
            label="Active months"
            value={String(result.stats.activeMonths)}
          />
          <Stat
            label="Story chapters"
            value={String(result.stats.chapterCount)}
          />
        </dl>
      </header>

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        <section className="px-5 py-7 sm:px-8">
          <StepLabel step="01" title="WHOIS contrast" />
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
            <div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {result.whois.secondHand
                  ? `Archive starts ${result.stats.firstLabel}, but current WHOIS creation is ${result.whois.createdLabel ?? "unknown"}. That usually means the name was used, dropped, and registered again.`
                  : result.whois.createdLabel
                    ? `Current WHOIS creation ${result.whois.createdLabel}${result.whois.registrar ? ` · ${result.whois.registrar}` : ""}. Archive onset and registration look aligned enough that this may be first-life branding — or Archive simply started late.`
                    : result.whois.message}
              </p>
              {result.flags.length ? (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {result.flags.map((flag) => (
                    <li
                      key={flag}
                      className="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-900 dark:bg-amber-950/35 dark:text-amber-200"
                    >
                      {flag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                Registration
              </p>
              <p className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
                {result.whois.createdLabel ?? "Unknown"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {result.whois.ageYears != null
                  ? `${result.whois.ageYears} years on current WHOIS`
                  : "RDAP age unavailable"}
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-7 sm:px-8">
          <StepLabel
            step="02"
            title="Activity by year"
            subtitle="How many months Internet Archive captured the homepage"
          />
          {result.years.length ? (
            <ul className="mt-5 flex items-end gap-1.5 overflow-x-auto pb-1">
              {result.years.map((year) => (
                <li
                  key={year.year}
                  className="flex w-8 shrink-0 flex-col items-center gap-1.5"
                  title={`${year.year}: ${year.monthsActive} months`}
                >
                  <span className="text-[10px] font-semibold tabular-nums text-slate-500">
                    {year.monthsActive || ""}
                  </span>
                  <span
                    className={cn(
                      "w-full rounded-sm",
                      year.monthsActive
                        ? "bg-teal-700 dark:bg-teal-400"
                        : "bg-slate-100 dark:bg-slate-800"
                    )}
                    style={{
                      height: `${Math.max(
                        4,
                        Math.round((year.monthsActive / maxMonths) * 56)
                      )}px`,
                    }}
                  />
                  <span className="font-mono text-[9px] text-slate-400">
                    {String(year.year).slice(2)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No yearly activity.</p>
          )}
        </section>

        <section className="px-5 py-7 sm:px-8">
          <StepLabel
            step="03"
            title="Life chapters"
            subtitle="Grouped by what the homepage was doing — not every pairwise rewrite"
          />
          {result.chapters.length ? (
            <ol className="relative mt-6 space-y-0 border-l border-slate-200 pl-5 dark:border-slate-800 sm:pl-6">
              {result.chapters.map((chapter) => (
                <li key={chapter.id} className="relative pb-8 last:pb-0">
                  <span className="absolute -left-[1.54rem] top-1 flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-600 dark:-left-[1.66rem] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 sm:-left-[1.66rem]">
                    {chapter.index}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                        kindTone[chapter.kind]
                      )}
                    >
                      {chapter.kindLabel}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {chapter.startLabel}
                      {chapter.endLabel !== chapter.startLabel
                        ? ` – ${chapter.endLabel}`
                        : ""}
                    </span>
                    <span className="text-xs text-slate-400">
                      {chapter.durationLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {chapter.summary}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {chapter.snapshots.map((snap) => (
                      <li
                        key={`${snap.timestamp}-${snap.waybackUrl}`}
                        className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/40"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <a
                            href={snap.waybackUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 hover:text-teal-800 dark:text-white dark:hover:text-teal-300"
                          >
                            {snap.dateLabel}
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </a>
                          <span className="text-[11px] text-slate-400">
                            {snap.kindLabel}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                          {snap.title || snap.h1 || "Untitled snapshot"}
                        </p>
                        {snap.excerpt ? (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                            {snap.excerpt}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No homepage chapters could be reconstructed from Archive.
            </p>
          )}
        </section>

        <footer className="px-5 py-5 sm:px-8">
          <p className="text-xs leading-relaxed text-slate-500">{result.note}</p>
          <p className="mt-2 text-xs text-slate-400">
            Sampled {result.stats.sampledPages} representative pages ·{" "}
            {result.stats.uniqueVersions} monthly content digests observed
          </p>
        </footer>
      </div>
    </div>
  );
}

function StepLabel({
  step,
  title,
  subtitle,
}: {
  step: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="font-mono text-[11px] font-semibold tracking-[0.16em] text-teal-700 dark:text-teal-300">
        {step}
      </span>
      <div>
        <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 font-display text-2xl font-bold tabular-nums text-white">
        {value}
      </dd>
    </div>
  );
}
