import type { Metadata } from "next";
import Image from "next/image";
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
import { HOME_FAQS } from "@/lib/home-faqs";
import { HOME_SEO_DESCRIPTION, HOME_SEO_TITLE } from "@/lib/home-seo";
import { getAllPosts } from "@/lib/blog";
import { TOOL_CATALOG } from "@/lib/tools/catalog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    absolute: HOME_SEO_TITLE,
  },
  description: HOME_SEO_DESCRIPTION,
  alternates: { canonical: "/" },
};

/** Example inputs only — clicking one fills the form without starting an audit. */
const examples = ["stripe.com", "github.com", "cloudflare.com"] as const;

const featuredToolHrefs = [
  "/tools/adsense-readiness-checker",
  "/tools/domain-history",
  "/tools/meta-tag-checker",
  "/tools/robots-txt-checker",
  "/tools/noindex-checker",
  "/tools/geo-content-checker",
] as const;

const featuredTools = featuredToolHrefs.map((href) => {
  const tool = TOOL_CATALOG.find((t) => t.href === href)!;
  return {
    href: tool.href,
    title: tool.nav,
    short: tool.short,
    mark: tool.mark,
  };
});

export default function HomePage() {
  const guides = getAllPosts().slice(0, 6);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="pointer-events-none absolute inset-0 bg-grain" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col justify-center px-4 pb-0 pt-14 sm:px-6 sm:pt-16">
          <p className="animate-fade-up text-center">
            <SiteWordmark size="hero" withDomain className="justify-center" />
          </p>
          <h1 className="animate-fade-up-delay mx-auto mt-5 max-w-3xl text-center font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Free Website SEO Audit &amp; Report Generator
          </h1>
          <p className="animate-fade-up-delay-2 mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
            Use the free technical SEO checker on any public URL and get a
            shareable report with scores and prioritized fixes. Print or save as
            PDF, download JSON, or send the live link — no signup.
          </p>

          <div className="animate-fade-up-delay-2 mt-7 w-full">
            <HeroSearch
              anchorTarget
              size="lg"
              examples={examples}
              className="mx-auto max-w-2xl"
            />
          </div>

          <nav
            aria-label="High-intent tools"
            className="mt-5 flex flex-wrap justify-center gap-2"
          >
            {[
              {
                href: "/tools/adsense-readiness-checker",
                label: "AdSense eligibility",
              },
              { href: "/tools/domain-history", label: "Domain history" },
              {
                href: "/tools/meta-tag-checker",
                label: "Title & SERP preview",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-slate-300/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-teal-700/40 hover:text-teal-900 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-teal-400/40 dark:hover:text-teal-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

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
              One URL. A focused technical SEO report.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              We inspect the submitted page plus site-level signals — not every
              URL on the domain — then publish a report you can share or export.
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
                body: "Open a shareable /audit report, print or save it as PDF, or download the audit data as JSON.",
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
        id="free-tools"
        className="border-t border-slate-300/70 dark:border-slate-700"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">
                Free tools
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
                Useful pages, not just a homepage form
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Each tool has its own URL, explanation, and FAQ — the full audit
                is still the fastest path when you want the whole picture.
              </p>
            </div>
            <Link
              href="/tools"
              className="text-sm font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              All tools →
            </Link>
          </div>
          <ul className="mt-8 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map((tool) => (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className="group flex h-full items-start gap-3 rounded-lg border border-slate-300/70 bg-[color:var(--surface)]/50 px-3.5 py-3 transition-colors hover:border-teal-700/40 dark:border-slate-700 dark:hover:border-teal-400/35"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold tracking-wide",
                      "bg-[#0b1220] text-teal-300 ring-1 ring-teal-900/30 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/25"
                    )}
                  >
                    {tool.mark}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[15px] font-semibold text-slate-900 group-hover:text-teal-900 dark:text-slate-50 dark:group-hover:text-teal-200">
                      {tool.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-slate-500">
                      {tool.short}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-slate-500">
            Questions?{" "}
            <Link
              href="/contact"
              className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              Contact us
            </Link>
            {" · "}
            <Link
              href="/tools/domain-history/theseosoul.com"
              className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              This domain’s history
            </Link>
            {" · "}
            <Link
              href="/audit/theseosoul.com"
              className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              Our audit report
            </Link>
            {" · "}
            <Link
              href="/blog"
              className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              Read guides
            </Link>
            .
          </p>
        </div>
      </section>

      <section
        id="guides"
        className="border-t border-slate-300/70 bg-[color:var(--surface)] dark:border-slate-700"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">
                Guides
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
                Practical SEO & GEO reading
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Short guides that pair with the free tools — robots vs noindex,
                sitemaps, SSL headers, domain history, and AdSense prep.
              </p>
            </div>
            <Link
              href="/blog"
              className="text-sm font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              All guides →
            </Link>
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-300/70 bg-white/60 transition-colors hover:border-teal-700/40 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-teal-400/35"
                >
                  {post.cover ? (
                    <Image
                      src={post.cover}
                      alt={post.coverAlt ?? post.title}
                      width={640}
                      height={360}
                      className="aspect-video h-auto w-full object-cover"
                      sizes="(max-width: 1024px) 50vw, 360px"
                    />
                  ) : null}
                  <span className="flex flex-1 flex-col px-4 py-3.5">
                    <span className="font-display text-[15px] font-semibold text-slate-900 group-hover:text-teal-900 dark:text-slate-50 dark:group-hover:text-teal-200">
                      {post.title}
                    </span>
                    <span className="mt-1.5 line-clamp-2 text-xs leading-snug text-slate-500 dark:text-slate-400">
                      {post.excerpt ?? post.description}
                    </span>
                    <span className="mt-3 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                      {post.readingMinutes} min read
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="why"
        className="border-t border-slate-300/70 dark:border-slate-700"
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
              per audit — on-page, GEO/AI crawlers, TLS, DNS, and WHOIS — that you
              can share, print, save as PDF, or download as JSON. No credit card
              and no fake traffic numbers.
            </p>
          </div>
          <dl className="mt-10 grid gap-8 border-t border-slate-300/70 pt-8 sm:grid-cols-3 dark:border-slate-700">
            {[
              {
                t: "Report pages, not popups",
                d: "Every audit lives at /audit/[host/path] — share the live link, print or save a PDF, or download JSON.",
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
