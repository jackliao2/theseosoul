import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ContentPage } from "@/components/layout/content-page";
import {
  ToolFaqJsonLd,
  ToolFaqSection,
} from "@/components/tools/tool-page-guide";
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
    a: "Start with the full technical SEO audit for a shareable report. Use robots.txt, meta, canonical, density, Open Graph, noindex, and redirect checkers when you need a focused diagnosis.",
  },
  {
    q: "Do you offer a free robots txt checker and keyword density tool?",
    a: "Yes — both are live: robots.txt checker for crawl rules and AI bot blocks, and keyword density checker for URL or pasted drafts.",
  },
];

export const metadata: Metadata = {
  title: "Free SEO Tools — No Signup | Robots, Meta, Density & More",
  description:
    "Free SEO tools with no registration: website SEO checker, robots txt checker, meta tag checker, canonical checker, keyword density, Open Graph, noindex, redirects, and GEO content checker.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "free seo tools",
    "seo tools free",
    "free seo checker",
    "keyword density checker",
    "robots txt checker",
    "meta tag checker",
    "canonical tag checker",
  ],
  openGraph: {
    title: "Free SEO Tools — No Signup",
    description:
      "Honest free SEO utilities: robots.txt, meta, canonical, density, OG, redirects, GEO.",
    url: PAGE_PATH,
    type: "website",
  },
};

const groups = [
  {
    name: "On-page & technical",
    blurb: "What we can prove from a live fetch — no signup.",
    tools: [
      {
        href: "/#home-audit-url",
        title: "Technical SEO Audit",
        blurb:
          "Shareable /audit report: Meta, Structure, Technical, GEO subscores + Why/Fix issues.",
        cta: "Run free audit",
      },
      {
        href: "/tools/robots-txt-checker",
        title: "Robots.txt Checker",
        blurb:
          "Free robots txt checker — crawl-all rules, Sitemap lines, AI bot blocks (GPTBot, ClaudeBot, more).",
        cta: "Check robots.txt",
      },
      {
        href: "/tools/meta-tag-checker",
        title: "Meta Tag Checker",
        blurb:
          "Title & meta description from a live URL (length status) plus Google-style SERP preview / simulator.",
        cta: "Check meta tags",
      },
      {
        href: "/tools/canonical-checker",
        title: "Canonical Tag Checker",
        blurb:
          "See if canonical is present, self-referencing, or pointing to another host/URL.",
        cta: "Check canonical",
      },
      {
        href: "/tools/keyword-density-checker",
        title: "Keyword Density Checker",
        blurb:
          "1–3 word phrase frequencies from a URL or pasted draft, plus optional focus keyword.",
        cta: "Check density",
      },
      {
        href: "/tools/open-graph-checker",
        title: "Open Graph Checker",
        blurb:
          "Validate og:title / description / image and Twitter Cards with a live share preview.",
        cta: "Check Open Graph",
      },
      {
        href: "/tools/noindex-checker",
        title: "Noindex Checker",
        blurb:
          "Read meta robots, googlebot meta, and X-Robots-Tag to see if a URL is indexable.",
        cta: "Check noindex",
      },
      {
        href: "/tools/redirect-checker",
        title: "Redirect Checker",
        blurb:
          "Trace every hop and status code to the final URL — catch long chains before crawlers do.",
        cta: "Check redirects",
      },
    ],
  },
  {
    name: "Content & GEO",
    blurb: "Citation-friendly writing and AI crawler readiness.",
    tools: [
      {
        href: "/tools/geo-content-checker",
        title: "GEO Content Checker",
        blurb:
          "Rule-based citation readiness: structure, facts, clarity, authority — no ChatGPT API.",
        cta: "Score content",
      },
      {
        href: "/audit/stripe.com",
        title: "Example audit report",
        blurb:
          "Live dashboard for a public domain — Overview through Domain tabs.",
        cta: "View example",
      },
    ],
  },
] as const;

const coming = [
  {
    title: "Backlink checker / monitor",
    blurb:
      "Needs paid link indexes. Pro later — not inventing referring domains free.",
  },
  {
    title: "Rank / AI Overview tracking",
    blurb: "SERP scraping and AI Overview presence need paid crawl infra.",
  },
  {
    title: "TF*IDF / full-site crawl",
    blurb: "Semantic content tooling and multi-URL crawls are heavier products.",
  },
] as const;

export default function ToolsPage() {
  return (
    <ContentPage className="max-w-6xl">
      <ToolFaqJsonLd
        faqs={faqs}
        pageUrl={PAGE_URL}
        name={`${SITE_NAME} Free SEO Tools`}
      />
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        Free tools · no registration
      </p>
      <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
        Free SEO tools — no signup
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
        {SITE_NAME} ships honest free SEO utilities from live HTML and public
        signals: robots txt checker, meta tag checker, canonical, keyword
        density, Open Graph, noindex, redirects, and GEO. No invented Domain
        Authority. No fake traffic charts.
      </p>

      <div className="mt-12 space-y-14">
        {groups.map((group) => (
          <section key={group.name}>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
              {group.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {group.blurb}
            </p>
            <ol className="mt-4 divide-y divide-slate-300/70 border-y border-slate-300/70 dark:divide-slate-700 dark:border-slate-700">
              {group.tools.map((tool, i) => (
                <li
                  key={tool.href}
                  className="grid gap-3 py-6 md:grid-cols-[2.5rem_1fr_auto] md:items-center md:gap-6"
                >
                  <p className="font-mono text-sm text-teal-800 dark:text-teal-300">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {tool.title}
                    </h3>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {tool.blurb}
                    </p>
                  </div>
                  <Link
                    href={tool.href}
                    className="inline-flex h-10 items-center justify-center gap-1.5 self-start rounded-md bg-teal-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-700 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300 md:self-center"
                  >
                    {tool.cta}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <section className="mt-14 max-w-2xl">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
          How to use this free SEO tools hub
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Run the full audit when you want a shareable Overview with Meta,
          Structure, Technical, and GEO subscores. Drop into a single checker
          when you already know the failure mode — for example robots.txt after
          a deploy, canonicals after a migration, or density while editing a
          draft. Every tool links back to related checks so you can finish the
          diagnosis without leaving {SITE_NAME}.
        </p>
      </section>

      <ToolFaqSection faqs={faqs} />

      <section className="mt-14">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
          Off-page · coming later
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
          Worth building — with real data
        </h2>
        <ul className="mt-6 divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-700 dark:border-slate-700">
          {coming.map((item) => (
            <li
              key={item.title}
              className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6"
            >
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {item.title}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {item.blurb}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </ContentPage>
  );
}
