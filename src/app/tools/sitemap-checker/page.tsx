import type { Metadata } from "next";
import Link from "next/link";
import { SitemapCheckerForm } from "@/components/tools/sitemap-checker-form";
import {
  ContentEyebrow,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";
import {
  ToolBulletSection,
  ToolFaqJsonLd,
  ToolFaqSection,
  ToolHowItWorks,
  ToolProse,
  ToolRelated,
} from "@/components/tools/tool-page-guide";
import { SITE_NAME, SITE_URL } from "@/lib/audit/types";

const PAGE_PATH = "/tools/sitemap-checker";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "What does a sitemap checker look for?",
    a: "It probes /sitemap.xml plus any Sitemap: URLs declared in robots.txt, then checks whether the response looks like a urlset or sitemap index and samples <loc> entries.",
  },
  {
    q: "Why does robots.txt matter for sitemaps?",
    a: "Search engines often discover sitemaps from robots.txt. A file that exists only at an obscure path may never be fetched unless you submit it manually in Search Console.",
  },
  {
    q: "Does this submit my sitemap to Google?",
    a: "No. We only fetch what you ask us to inspect. Submission still happens in Google Search Console, Bing Webmaster Tools, or IndexNow where supported.",
  },
  {
    q: "Is this free?",
    a: `Yes — free, no registration on ${SITE_NAME}.`,
  },
];

export const metadata: Metadata = {
  title: "Free Sitemap Checker — XML Sitemap & robots.txt Sitemap:",
  description:
    "Free XML sitemap checker: verify /sitemap.xml, robots.txt Sitemap: directives, urlset vs index, and sample URLs. No signup.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "sitemap checker",
    "xml sitemap checker",
    "sitemap.xml checker",
    "robots sitemap directive",
    "sitemap validator",
  ],
  openGraph: {
    title: "Free Sitemap Checker",
    description:
      "Check XML sitemaps and robots.txt Sitemap: discovery — free, no signup.",
    url: PAGE_PATH,
    type: "website",
  },
};

export default function SitemapCheckerPage() {
  return (
    <ContentPage>
      <ToolFaqJsonLd faqs={faqs} pageUrl={PAGE_URL} name="Free Sitemap Checker" />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        Crawl
      </ContentEyebrow>
      <ContentTitle>Free Sitemap Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Verify that crawlers can find a usable XML sitemap. We check{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5 text-sm dark:bg-slate-800">
          /sitemap.xml
        </code>
        , robots.txt <code className="rounded bg-slate-100 px-1 py-0.5 text-sm dark:bg-slate-800">Sitemap:</code>{" "}
        lines, and sample listed URLs — free, no signup.
      </p>

      <div className="mt-10">
        <SitemapCheckerForm />
      </div>

      <ToolHowItWorks
        steps={[
          {
            title: "Read robots.txt Sitemap: lines",
            body: "We fetch robots.txt and collect every Sitemap: directive so discovery matches what crawlers see.",
          },
          {
            title: "Probe candidate sitemap URLs",
            body: "Default /sitemap.xml plus declared URLs are fetched and classified as urlset, sitemap index, HTML misfire, or missing.",
          },
          {
            title: "Sample <loc> entries",
            body: "When XML looks valid, we count locs and show a short sample so you can spot staging hosts or accidental junk URLs.",
          },
        ]}
      />

      <ToolBulletSection
        title="What we check"
        items={[
          "Presence of /sitemap.xml",
          "Sitemap: directives in robots.txt",
          "urlset vs sitemapindex shape",
          "Approximate <loc> count and sample URLs",
        ]}
      />

      <ToolProse title="When to use a sitemap checker">
        <p>
          Run this after a CMS migration, CDN cutover, or when Search Console
          reports sitemap errors. Pair with the{" "}
          <Link
            href="/tools/robots-txt-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            robots.txt Checker
          </Link>{" "}
          if crawl rules look wrong, and a{" "}
          <Link
            href="/#home-audit-url"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            full technical audit
          </Link>{" "}
          for indexability and on-page issues.
        </p>
      </ToolProse>

      <ToolFaqSection faqs={faqs} />

      <ToolRelated
        hint="Sitemaps help discovery — these tools help diagnose what blocks indexing next."
        tools={[
          { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
          { href: "/tools/noindex-checker", label: "Noindex Checker" },
          { href: "/tools/canonical-checker", label: "Canonical Tag Checker" },
          { href: "/tools/redirect-checker", label: "Redirect Checker" },
        ]}
      />
    </ContentPage>
  );
}
