import type { Metadata } from "next";
import Link from "next/link";
import {
  ContentEyebrow,
  ContentLead,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";
import { SiteWordmark } from "@/components/brand/site-mark";
import { SOUL_ARCHETYPES } from "@/lib/audit/soul";
import { SITE_EMAIL, SITE_NAME } from "@/lib/audit/types";

export const metadata: Metadata = {
  title: "About TheSeoSoul — Free SEO Audits & Site Soul",
  description: `What ${SITE_NAME} is: free technical SEO + GEO audits, shareable reports, Site Soul profiles, and an honest free tier without fake traffic charts.`,
  alternates: { canonical: "/about" },
};

const covered = [
  {
    title: "On-page basics",
    items: [
      "Title & meta description length and presence",
      "Canonical URL",
      "Open Graph / social tags",
      "Viewport & HTTPS",
    ],
  },
  {
    title: "Structure",
    items: [
      "H1–H3 tree and title↔H1 overlap",
      "Image alt coverage",
      "Internal vs external links",
      "Text-to-HTML ratio & content length",
    ],
  },
  {
    title: "Crawl & tech",
    items: [
      "robots.txt + AI crawler directives",
      "sitemap.xml presence",
      "TLS certificate & redirect chain",
      "DNS / SPF / DMARC signals",
      "Security headers, mixed content",
    ],
  },
  {
    title: "GEO readiness",
    items: [
      "llms.txt, FAQ / HowTo schema",
      "Answer-first & citability signals",
      "Structured data presence",
      "AI bot allow / block overview",
    ],
  },
];

const notCovered = [
  {
    title: "Domain Authority / traffic charts",
    body: "Those need paid third-party databases. We won’t invent fake scores on the free tier.",
  },
  {
    title: "Full-site crawl of every URL",
    body: "Free audits analyze the URL you submit plus key public files — not a Seobility-scale sitewide crawl.",
  },
  {
    title: "Live AI brand-mention tracking",
    body: "Checking ChatGPT / Perplexity in real time needs model APIs — planned later, not in the free layer.",
  },
];

const steps = [
  {
    n: "01",
    title: "Paste a public URL",
    body: "We fetch live HTML over HTTP/1.1, follow redirects, and probe related public resources.",
  },
  {
    n: "02",
    title: "Score what we can prove",
    body: "Checks become pass / warn / fail with Why + Fix guidance — Meta, Structure, Technical, and GEO sub-scores.",
  },
  {
    n: "03",
    title: "Share the report URL",
    body: "Every run lands at /audit/[domain] so you can send it to a client or teammate — not a private popup.",
  },
];

const freeTools = [
  { href: "/tools/domain-history", label: "Domain history" },
  { href: "/tools/seo-ladder", label: "SEO site ladder" },
  { href: "/tools/adsense-readiness-checker", label: "AdSense readiness" },
  { href: "/tools/robots-txt-checker", label: "Robots.txt" },
  { href: "/tools/meta-tag-checker", label: "Meta tags" },
  { href: "/tools/geo-content-checker", label: "GEO content" },
];

export default function AboutPage() {
  return (
    <ContentPage wide>
      <ContentEyebrow>
        <SiteWordmark size="sm" className="justify-start" />
      </ContentEyebrow>
      <ContentTitle>About TheSeoSoul</ContentTitle>
      <ContentLead>
        A free technical SEO checker that publishes a real report URL — not a
        locked popup. Paste any public domain, get on-page + GEO signals, a Site
        Soul profile, and something you can actually send to a client.
      </ContentLead>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/#home-audit-url"
          className="inline-flex h-11 items-center justify-center rounded-md bg-teal-800 px-5 text-sm font-semibold text-white hover:bg-teal-700 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
        >
          Run a free audit
        </Link>
        <Link
          href="/tools"
          className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300/90 bg-[color:var(--surface)] px-5 text-sm font-semibold text-slate-800 hover:bg-white dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          Browse tools
        </Link>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Why this exists
        </h2>
        <div className="mt-4 max-w-3xl space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          <p>
            Most free SEO checkers bury the result behind signup walls, or dump
            everything into a private modal you can’t share. Agencies and
            freelancers still need a clean link: “here’s what we found on your
            site.”
          </p>
          <p>
            {SITE_NAME} is built around that link. We fetch public HTML and
            related public files, score what we can prove, and publish a
            dashboard at{" "}
            <code className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[13px] dark:bg-slate-800">
              /audit/[domain]
            </code>
            . The free tier stays honest: no invented Domain Authority, no fake
            traffic graphs.
          </p>
          <p>
            The name is literal. “Seo” is the craft. “Soul” is the part a bare
            score misses — what kind of presence the site has when Meta,
            Structure, Technical, and GEO are read together.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          How it works
        </h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n}>
              <p className="font-mono text-[11px] font-medium tracking-wider text-teal-700 dark:text-teal-400">
                {s.n}
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="site-soul"
        className="mt-16 border-t border-slate-300/70 pt-12 dark:border-slate-800"
      >
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800 dark:text-teal-300">
          Site Soul
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white">
          Beyond the score
        </h2>
        <div className="mt-4 max-w-3xl space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          <p>
            A 72/100 tells you the page performed okay. It does not tell you
            whether the site feels like a precise Architect, a clear Beacon, a
            Hidden Gem buried by crawl issues, or a Rising Voice still finding
            its shape.
          </p>
          <p>
            Site Soul is a rule-based profile included in every free report. We
            look at Meta, Structure, Technical, and GEO subscores plus content
            depth, crawl, and indexing signals — then map the pattern to one of
            11 archetypes. No LLM improvisation; the same inputs produce the
            same soul.
          </p>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {SOUL_ARCHETYPES.map((soul) => (
            <li
              key={soul.id}
              className="rounded-lg border border-slate-200/90 px-3.5 py-3 dark:border-slate-800"
            >
              <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                {soul.name}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {soul.essence}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm text-slate-500">
          See it on a live report:{" "}
          <Link
            href="/audit/theseosoul.com?tab=soul"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-400"
          >
            theseosoul.com Site Soul →
          </Link>
        </p>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          What a free audit covers
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Everything below is measured from publicly reachable HTML and related
          public signals — no login, no browser extension required.
        </p>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {covered.map((group) => (
            <div key={group.title}>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                {group.title}
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal-700 dark:bg-teal-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 border-t border-slate-300/70 pt-12 dark:border-slate-800">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          What we leave out (on purpose)
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Honest free tier beats fake charts. If a signal needs paid APIs or
          would spam search with thin URLs, we skip it — and say so.
        </p>
        <ul className="mt-8 space-y-6">
          {notCovered.map((item) => (
            <li key={item.title}>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 border-t border-slate-300/70 pt-12 dark:border-slate-800">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Free tools around the audit
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          When you only need one answer, use a focused checker. Each has its own
          page, explanation, and FAQ — the full audit is still fastest when you
          want the whole picture.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {freeTools.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="inline-flex rounded-md border border-slate-300/80 px-3 py-1.5 text-sm font-semibold text-slate-800 hover:border-teal-700/40 hover:text-teal-900 dark:border-slate-700 dark:text-slate-100 dark:hover:border-teal-400/40 dark:hover:text-teal-200"
              >
                {tool.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/tools"
              className="inline-flex rounded-md bg-teal-800/10 px-3 py-1.5 text-sm font-semibold text-teal-900 hover:bg-teal-800/15 dark:bg-teal-400/10 dark:text-teal-200"
            >
              All tools →
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-16 border-t border-slate-300/70 pt-12 dark:border-slate-800">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Shareable reports ≠ mass indexing
        </h2>
        <div className="mt-4 max-w-3xl space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          <p>
            A report URL is a product feature so you can send{" "}
            <code className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[13px] dark:bg-slate-800">
              /audit/yourdomain.com
            </code>{" "}
            to a client. Pushing thousands of thin audit pages into Google is
            not.
          </p>
          <p>
            Most reports use{" "}
            <code className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[13px] dark:bg-slate-800">
              noindex,follow
            </code>
            . Only a small curated set of example domains appears in our
            sitemap — including our own site and a couple of demos.
          </p>
        </div>
      </section>

      <section className="mt-16 rounded-xl border border-slate-300/70 bg-[color:var(--surface)] px-5 py-6 dark:border-slate-800">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          Contact
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Product feedback, partnerships, abuse, or privacy requests — email{" "}
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="font-semibold text-teal-800 hover:underline dark:text-teal-400"
          >
            {SITE_EMAIL}
          </a>
          .
        </p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
          <Link
            href="/contact"
            className="text-teal-800 hover:underline dark:text-teal-400"
          >
            Contact page →
          </Link>
          <Link
            href="/privacy"
            className="text-teal-800 hover:underline dark:text-teal-400"
          >
            Privacy →
          </Link>
          <Link
            href="/terms"
            className="text-teal-800 hover:underline dark:text-teal-400"
          >
            Terms →
          </Link>
        </div>
      </section>
    </ContentPage>
  );
}
