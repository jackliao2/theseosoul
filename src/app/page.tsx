import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteWordmark } from "@/components/brand/site-mark";
import { FaqSection } from "@/components/home/faq-section";
import { FeaturesSection } from "@/components/home/features-section";
import { RecentAudits } from "@/components/home/recent-audits";
import { HeroSearch } from "@/components/home/hero-search";
import { HeroVisual } from "@/components/home/hero-visual";
import { SiteSoulSection } from "@/components/home/site-soul-section";
import { AuditCtaLink } from "@/components/layout/audit-cta-link";

const examples = [
  "shopify.com",
  "stripe.com",
  "vercel.com",
  "github.com",
  "notion.so",
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="pointer-events-none absolute inset-0 bg-grain" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col justify-center px-4 pb-0 pt-14 sm:px-6 sm:pt-16">
          <p className="animate-fade-up text-center">
            <SiteWordmark size="hero" withDomain className="justify-center" />
          </p>
          <h1 className="animate-fade-up-delay mx-auto mt-4 max-w-xl text-center text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            Free website SEO checker — paste a URL, get a shareable audit report.
          </h1>

          <div className="animate-fade-up-delay-2 mt-8 w-full">
            <HeroSearch
              anchorTarget
              size="lg"
              className="mx-auto max-w-2xl"
            />
          </div>

          <p className="animate-fade-up-delay-2 mt-4 text-center text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Free · No signup · Shareable /audit/[domain] reports
          </p>

          <div className="animate-fade-up-delay-2 mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            {examples.map((domain) => (
              <Link
                key={domain}
                href={`/audit/${domain}`}
                className="rounded-md border border-slate-300/80 bg-white/80 px-2.5 py-1 font-medium text-slate-700 transition-colors hover:border-teal-700 hover:text-teal-800 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
              >
                {domain}
              </Link>
            ))}
          </div>

          <div className="mt-5 flex justify-center">
            <RecentAudits />
          </div>

          <HeroVisual />
        </div>
      </section>

      <SiteSoulSection />

      <section
        id="how-it-works"
        className="border-t border-slate-300/70 bg-[color:var(--surface)] dark:border-slate-700"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-xl">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">
              Process
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
              One fetch. Full technical picture.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Unlike browser-only checkers, every audit becomes a public URL you
              can share with clients or teammates.
            </p>
          </div>

          <ol className="mt-10 divide-y divide-slate-300/70 border-y border-slate-300/70 dark:divide-slate-700 dark:border-slate-700">
            {[
              {
                step: "01",
                title: "Normalize & fetch",
                body: "Clean the URL, try apex + www, follow the redirect chain over HTTP/1.1.",
              },
              {
                step: "02",
                title: "Parse, probe & score",
                body: "On-page signals, density, schema, robots, TLS/DNS, RDAP age — in parallel.",
              },
              {
                step: "03",
                title: "Publish the report",
                body: "Dashboard live at /audit/[domain] — shareable with Why + Fix issues.",
              },
            ].map((item) => (
              <li
                key={item.step}
                className="grid gap-2 py-6 md:grid-cols-[4rem_12rem_1fr] md:items-baseline"
              >
                <p className="font-mono text-sm text-teal-800 dark:text-teal-300">
                  {item.step}
                </p>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <FeaturesSection />

      <section
        id="why"
        className="border-t border-slate-300/70 bg-[color:var(--surface)] dark:border-slate-700"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">
              Why TheSeoSoul
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
              Built for shareable technical truth
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Most SEO tools bury free checks behind signup walls, or dump results
              into a private popup. TheSeoSoul ships a clean technical report URL
              per domain — on-page, GEO/AI crawlers, TLS, DNS, and WHOIS — with no
              credit card and no fake traffic numbers.
            </p>
          </div>
          <dl className="mt-10 grid gap-8 border-t border-slate-300/70 pt-8 sm:grid-cols-3 dark:border-slate-700">
            {[
              {
                t: "Report pages, not popups",
                d: "Every audit lives at /audit/[domain] — shareable with clients; only curated examples are pushed to search.",
              },
              {
                t: "GEO + classic SEO",
                d: "AI bots, llms.txt, answer-first & freshness checks — plus a free GEO content scorer.",
              },
              {
                t: "Honest free tier",
                d: "No invented traffic or backlink graphs. Paid link/SERP data later; technical foundation today.",
              },
            ].map((item) => (
              <div key={item.t}>
                <dt className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                  {item.t}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {item.d}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <FaqSection />

      <section
        id="pro"
        className="border-t border-slate-700 bg-[#15202b] text-slate-50"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="max-w-xl">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-teal-300">
              Coming later · Pro
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Backlinks, traffic & SERP
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Competitors (e.g. Seobility’s backlink checker) run on paid link
              indexes and daily query caps. We will not fake referring domains or
              Domain Authority on the free tier. When Pro lands, it will use real
              third-party data — start with the free technical audit today.
            </p>
          </div>
          <AuditCtaLink className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-teal-400 px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-300">
            Start free audit
            <ArrowUpRight className="h-4 w-4" />
          </AuditCtaLink>
        </div>
      </section>
    </div>
  );
}
