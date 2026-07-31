"use client";

import { ArrowRight, CheckCircle2, CircleHelp, Sparkles } from "lucide-react";
import {
  getPrimaryAction,
  getSoulProfile,
  SOUL_ARCHETYPES,
} from "@/lib/audit/soul";
import { computeSubScores } from "@/lib/audit/subscores";
import type { AuditResult, AuditTabId } from "@/lib/audit/types";
import { cn } from "@/lib/utils";

const dimensionNotes: Record<string, string> = {
  meta: "How clearly the page introduces itself",
  structure: "How deliberately information is organized",
  technical: "How reliably crawlers can reach and trust it",
  geo: "How ready the content is for generative discovery",
};

export function PanelSoul({
  audit,
  onSelectTab,
}: {
  audit: AuditResult;
  onSelectTab: (id: AuditTabId) => void;
}) {
  const soul = getSoulProfile(audit);
  const action = getPrimaryAction(audit);
  const scores = computeSubScores(audit);
  const ordered = [...scores].sort((a, b) => b.score - a.score);
  const strongest = ordered[0];
  const quietest = ordered[ordered.length - 1];
  const spread = strongest.score - quietest.score;
  const balance =
    spread <= 12 ? "Highly balanced" : spread <= 25 ? "Mostly balanced" : "Distinctly uneven";
  const accessRestricted =
    /noindex|none/i.test(
      `${audit.robotsMeta.content ?? ""} ${audit.tech.xRobotsTag ?? ""}`
    ) || audit.robots.allowsIndexing === false;

  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-4">
      <section className="relative overflow-hidden rounded-2xl bg-[#0b1220] p-5 text-white sm:p-7">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 100% at 95% 0%, rgba(45,212,191,.22), transparent 58%), radial-gradient(ellipse 40% 80% at 0% 100%, rgba(45,212,191,.1), transparent 65%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-grain opacity-20" />

        <div className="relative grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-300">
                <Sparkles className="h-3.5 w-3.5" />
                Site Soul
                <span className="group relative inline-flex">
                  <button
                    type="button"
                    className="rounded text-teal-300/55 outline-none transition-colors hover:text-teal-200 focus-visible:text-teal-200 focus-visible:ring-1 focus-visible:ring-teal-300/50"
                    aria-label="What is Site Soul?"
                  >
                    <CircleHelp className="h-3.5 w-3.5" />
                  </button>
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-left font-sans text-[11px] font-normal normal-case leading-relaxed tracking-normal text-slate-300 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    Scores measure performance. Site Soul names the kind of
                    presence this site has — one of 11 rule-based profiles from
                    Meta, Structure, Technical, and GEO signals.
                  </span>
                </span>
              </p>
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                Rule-based · 11 profiles
              </span>
            </div>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              {soul.name}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300">
              {soul.message}
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-teal-300/80">
              {soul.evidence}
            </p>
          </div>

          <div className="flex gap-5 border-t border-white/10 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <HeroMetric label="SEO" value={audit.score} />
            <HeroMetric label="GEO" value={audit.geo.score} />
            <HeroMetric label="Grade" value={audit.grade} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,.75fr)]">
        <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Soul signature
              </p>
              <h3 className="mt-1 font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Four dimensions, one personality
              </h3>
            </div>
            <p className="text-xs font-semibold text-slate-500">{balance}</p>
          </div>

          <ul className="mt-5 space-y-4">
            {scores.map((dimension) => (
              <li key={dimension.id}>
                <button
                  type="button"
                  onClick={() => onSelectTab(dimension.tab)}
                  className="group w-full text-left"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-display text-sm font-bold text-slate-900 dark:text-white">
                        {dimension.label}
                      </span>
                      <span className="ml-2 text-[11px] text-slate-500">
                        {dimensionNotes[dimension.id]}
                      </span>
                    </div>
                    <span className="font-display text-base font-bold tabular-nums text-slate-900 dark:text-white">
                      {dimension.score}
                    </span>
                  </div>
                  <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <span
                      className={cn(
                        "block h-full rounded-full transition-[width]",
                        dimension.score >= 80
                          ? "bg-emerald-500"
                          : dimension.score >= 55
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      )}
                      style={{ width: `${dimension.score}%` }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-5 grid gap-2 border-t border-slate-200 pt-4 text-sm sm:grid-cols-3 dark:border-slate-800">
            <SignatureFact label="Strongest voice" value={`${strongest.label} ${strongest.score}`} />
            <SignatureFact label="Quietest layer" value={`${quietest.label} ${quietest.score}`} />
            <SignatureFact label="Score spread" value={`${spread} points`} />
          </div>
        </section>

        <div className="space-y-4">
          <section
            className={cn(
              "rounded-xl border p-4",
              action.urgent
                ? "border-amber-300/70 bg-amber-50/55 dark:border-amber-900/60 dark:bg-amber-950/20"
                : "border-emerald-300/70 bg-emerald-50/55 dark:border-emerald-900/60 dark:bg-emerald-950/20"
            )}
          >
            <div className="flex items-center gap-2">
              {action.urgent ? (
                <ArrowRight className="h-4 w-4 text-amber-700 dark:text-amber-300" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
              )}
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                One move forward
              </p>
            </div>
            <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {action.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {action.fix}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {action.why}
            </p>
            <button
              type="button"
              onClick={() => onSelectTab(action.tab)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              Open the evidence
              <ArrowRight className="h-3 w-3" />
            </button>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Why this profile
            </p>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              <Reason>
                {strongest.label} is the strongest dimension at {strongest.score}.
              </Reason>
              <Reason>
                {quietest.label} is the quietest at {quietest.score}, creating a{" "}
                {spread}-point spread.
              </Reason>
              <Reason>
                {audit.density.totalWords.toLocaleString()} words were available
                to the content and GEO checks.
              </Reason>
              <Reason>
                {accessRestricted
                  ? "Crawl or indexing restrictions materially affect the profile."
                  : "No site-wide crawl or indexing restriction determined the profile."}
              </Reason>
            </ul>
          </section>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Soul spectrum
          </p>
          <h3 className="mt-1 font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Eleven ways a site can show up
          </h3>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SOUL_ARCHETYPES.map((archetype) => {
            const current = archetype.id === soul.id;
            return (
              <li
                key={archetype.id}
                className={cn(
                  "rounded-lg border px-3 py-2.5",
                  current
                    ? "border-teal-700/40 bg-teal-800/[0.06] dark:border-teal-400/35 dark:bg-teal-400/[0.07]"
                    : "border-slate-200 dark:border-slate-800"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    {archetype.name}
                  </p>
                  {current ? (
                    <span className="font-mono text-[8px] font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                      This site
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {archetype.essence}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="font-display text-2xl font-bold tabular-nums text-teal-300">
        {value}
      </p>
      <p className="font-mono text-[8px] uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  );
}

function SignatureFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-slate-200 pl-2 dark:border-slate-700">
      <p className="text-[9px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function Reason({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal-700 dark:bg-teal-300" />
      <span>{children}</span>
    </li>
  );
}
