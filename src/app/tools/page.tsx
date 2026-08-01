import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ContentPage } from "@/components/layout/content-page";
import { ToolFaqJsonLd } from "@/components/tools/tool-page-guide";
import { TOOL_CATALOG } from "@/lib/tools/catalog";
import { SITE_NAME, SITE_URL } from "@/lib/audit/types";

const PAGE_PATH = "/tools";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "Are these SEO tools really free?",
    a: `${SITE_NAME} free tools need no registration. They run on live HTML and public signals we can fetch — not invented Domain Authority or fake traffic charts.`,
  },
  {
    q: "Which free tool should I start with?",
    a: "Start with the full technical SEO audit for a shareable report. Use the SEO site ladder to find your capability stage, domain history before buying a name, AdSense readiness for monetization prep, or the focused robots.txt, meta, canonical, density, Open Graph, noindex, and redirect tools for a specific diagnosis.",
  },
  {
    q: "Do you offer a free robots txt checker and keyword density tool?",
    a: "Yes — both are live: robots.txt checker for crawl rules and AI bot blocks, and keyword density checker for URL or pasted drafts.",
  },
];

export const metadata: Metadata = {
  title: "Free SEO Tools — Audit, AdSense Readiness, Robots & More",
  description:
    "Free SEO tools with no registration: website SEO audit, SEO site ladder, domain history, AdSense readiness checker, robots.txt, meta tags, canonical, keyword density, Open Graph, noindex, redirects, and GEO.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "free seo tools",
    "seo tools free",
    "free seo checker",
    "keyword density checker",
    "robots txt checker",
    "meta tag checker",
    "canonical tag checker",
    "adsense readiness checker",
  ],
  openGraph: {
    title: "Free SEO Tools — No Signup",
    description:
      "Honest free SEO utilities: robots.txt, meta, canonical, density, OG, redirects, GEO.",
    url: PAGE_PATH,
    type: "website",
  },
};

const featured = TOOL_CATALOG.find((t) => t.group === "featured")!;
const growthTools = TOOL_CATALOG.filter((t) => t.group === "growth");
const checkers = TOOL_CATALOG.filter((t) => t.group === "checkers");
const contentTools = TOOL_CATALOG.filter((t) => t.group === "content");

const coming = [
  "Backlink checker (needs paid link indexes)",
  "Rank / AI Overview tracking",
  "TF*IDF / full-site crawl",
] as const;

function ToolTile({
  href,
  title,
  short,
  mark,
}: {
  href: string;
  title: string;
  short: string;
  mark: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full items-start gap-3 rounded-lg border border-slate-300/70 bg-[color:var(--surface)]/60 px-3.5 py-3 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-teal-700/40 hover:bg-teal-800/[0.04] dark:border-slate-700 dark:hover:border-teal-400/35 dark:hover:bg-teal-400/[0.06]"
    >
      <span
        aria-hidden
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#0b1220] font-mono text-xs font-bold tracking-wide text-teal-300 ring-1 ring-teal-900/30 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/25"
      >
        {mark}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-[15px] font-semibold text-slate-900 transition-colors group-hover:text-teal-900 dark:text-slate-50 dark:group-hover:text-teal-200">
          {title}
        </h3>
        <p className="mt-0.5 text-xs leading-snug text-slate-500 dark:text-slate-400">
          {short}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-teal-800 opacity-80 transition-opacity group-hover:opacity-100 dark:text-teal-300">
          Open
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default function ToolsPage() {
  return (
    <ContentPage className="max-w-5xl py-10 sm:py-12">
      <ToolFaqJsonLd
        faqs={faqs}
        pageUrl={PAGE_URL}
        name={`${SITE_NAME} Free SEO Tools`}
      />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Free · no registration
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            Free SEO tools
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Live HTML checks only — no fake DA or traffic. Pick a checker or run
            the full audit.
          </p>
        </div>
        <Link
          href="/audit/theseosoul.com"
          className="shrink-0 text-sm font-semibold text-teal-800 hover:underline dark:text-teal-300"
        >
          See example report →
        </Link>
      </div>

      {/* Primary CTA — one clear entry */}
      <Link
        href={featured.href}
        className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-teal-800/25 bg-gradient-to-br from-teal-800/[0.08] to-transparent px-5 py-4 transition-colors hover:border-teal-800/45 dark:border-teal-400/25 dark:from-teal-400/[0.1] dark:hover:border-teal-400/40"
      >
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-teal-800/80 dark:text-teal-300/80">
            Start here
          </p>
          <h2 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-slate-50">
            {featured.title}
          </h2>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
            {featured.short}
          </p>
        </div>
        <span className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md bg-teal-800 px-4 text-sm font-semibold text-white dark:bg-teal-400 dark:text-slate-950">
          Run audit
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </Link>

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
            Growth & monetization
          </h2>
          <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            New
          </span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {growthTools.map((tool) => (
            <ToolTile key={tool.href} {...tool} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
            Page checkers
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {checkers.length} tools
          </p>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {checkers.map((tool) => (
            <ToolTile key={tool.href} {...tool} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-base font-bold text-slate-900 dark:text-slate-50">
          Content & GEO
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {contentTools.map((tool) => (
            <ToolTile key={tool.href} {...tool} />
          ))}
        </div>
      </section>

      <section className="mt-10 border-t border-slate-300/70 pt-6 dark:border-slate-700">
        <details className="group">
          <summary className="cursor-pointer list-none font-display text-sm font-semibold text-slate-700 marker:content-none dark:text-slate-200 [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              Coming later
              <span className="text-xs font-normal text-slate-400 group-open:hidden">
                (backlinks, ranks…)
              </span>
            </span>
          </summary>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
            {coming.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                {item}
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section className="mt-8 border-t border-slate-300/70 pt-6 dark:border-slate-700">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
          FAQ
        </h2>
        <Accordion type="single" collapsible className="mt-2">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-slate-900 dark:text-slate-50">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </ContentPage>
  );
}
