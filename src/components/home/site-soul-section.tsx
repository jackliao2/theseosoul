import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { AuditCtaLink } from "@/components/layout/audit-cta-link";
import { SOUL_ARCHETYPES } from "@/lib/audit/soul";

export function SiteSoulSection() {
  return (
    <section
      id="site-soul"
      className="relative overflow-hidden border-t border-slate-700 bg-[#0b1220] text-white"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 90% at 85% 35%, rgba(45,212,191,.16), transparent 60%), radial-gradient(ellipse 35% 70% at 5% 100%, rgba(45,212,191,.08), transparent 65%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-20" />

      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,.9fr)_minmax(22rem,1.1fr)] md:items-center">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-300">
            <Sparkles className="h-3.5 w-3.5" />
            Beyond the score
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Every website has a Site Soul.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
            A score tells you how the page performed. Site Soul explains what
            kind of presence it has: a precise Architect, a clear Beacon, a
            hidden gem waiting to be found—or something still finding its voice.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Chosen from 11 profiles using Meta, Structure, Technical, GEO,
            content depth, crawl, and indexing signals. Rule-based, transparent,
            and included in every free report.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <AuditCtaLink className="inline-flex h-10 items-center gap-2 rounded-md bg-teal-400 px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-300">
              Discover your Site Soul
              <ArrowUpRight className="h-3.5 w-3.5" />
            </AuditCtaLink>
            <Link
              href="/audit/stripe.com?tab=soul"
              className="text-sm font-semibold text-slate-300 transition-colors hover:text-white"
            >
              See Stripe’s Site Soul →
            </Link>
          </div>
        </div>

        <div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-5 shadow-[0_24px_70px_-38px_rgba(45,212,191,.45)] backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-300">
                Site Soul · Example
              </p>
              <span className="rounded-full border border-white/10 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                Rule-based
              </span>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="font-display text-3xl font-bold tracking-tight text-white">
                  The Hidden Gem
                </p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-300">
                  Real substance is already here. A few technical signals are
                  keeping it quieter than it should be.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-2 border-l border-white/10 pl-5">
                <SoulMetric label="Content" value="78" />
                <SoulMetric label="Technical" value="49" />
                <SoulMetric label="Meta" value="74" />
                <SoulMetric label="GEO" value="69" />
              </div>
            </div>

            <div className="mt-6 h-px bg-gradient-to-r from-teal-300/50 via-white/10 to-transparent" />
            <p className="mt-3 text-xs text-slate-400">
              First move: make the preferred URL and indexing signals
              unmistakable.
            </p>
          </div>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {SOUL_ARCHETYPES.map((archetype) => (
              <li
                key={archetype.id}
                className="rounded-full border border-white/[0.08] px-2.5 py-1 font-mono text-[9px] text-slate-500"
              >
                {archetype.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SoulMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-lg font-bold tabular-nums text-teal-300">
        {value}
      </p>
      <p className="font-mono text-[8px] uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  );
}
