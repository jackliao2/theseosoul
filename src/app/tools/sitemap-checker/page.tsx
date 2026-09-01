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
  ToolCodeBlock,
  ToolFaqJsonLd,
  ToolFaqSection,
  ToolGuideCard,
  ToolHowItWorks,
  ToolProse,
  ToolRelated,
  ToolUseCases,
} from "@/components/tools/tool-page-guide";
import { SITE_NAME, SITE_URL } from "@/lib/audit/types";
import { createSocialMetadata } from "@/lib/social-metadata";

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
  title: "Free Sitemap Checker — Validate XML & Discovery",
  description:
    "Free XML sitemap checker: validate sitemap.xml and sitemap indexes, confirm robots.txt discovery, and sample listed URLs. No signup.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "sitemap checker",
    "xml sitemap checker",
    "sitemap.xml checker",
    "robots sitemap directive",
    "sitemap validator",
  ],
  ...createSocialMetadata({
    title: "Free Sitemap Checker",
    description:
      "Check XML sitemaps and robots.txt Sitemap: discovery — free, no signup.",
    url: PAGE_PATH,
  }),
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
        title="What this sitemap checker validates"
        items={[
          "Presence and HTTP 200 status of /sitemap.xml",
          "Explicit Sitemap: declarations inside robots.txt",
          "XML structure compliance (<urlset> vs nested <sitemapindex>)",
          "Verification that listed <loc> entries are 100% indexable 200 OK canonical URLs",
        ]}
      />

      <ToolUseCases
        title="XML Sitemap Pitfalls & Large Site Architecture"
        intro="Search engines treat XML sitemaps as discovery roadmaps. Common issues that derail indexing include:"
        cases={[
          {
            badge: "Dirty Sitemaps",
            scenario: "Sitemaps Containing 404s or Redirects",
            problem:
              "Listing outdated 404 pages or 301 redirects in your sitemap degrades Googlebot's trust in your sitemap, slowing down crawl discovery.",
            solution:
              "Ensure only 200 OK, self-canonical, indexable URLs are included in XML sitemaps.",
          },
          {
            badge: "Scale Limits",
            scenario: "Exceeding 50,000 URLs / 50MB File Limit",
            problem:
              "Large e-commerce or directory sites attempting to output 100,000 URLs into a single monolithic sitemap get rejected by search crawlers.",
            solution:
              "Split large catalogs into nested sitemaps grouped under a master <sitemapindex> file.",
          },
          {
            badge: "Lastmod Signals",
            scenario: "Artificial or Stale lastmod Timestamps",
            problem:
              "Updating all <lastmod> timestamps to current time on every build causes Googlebot to ignore the lastmod directive completely.",
            solution:
              "Set <lastmod> to true content modification dates to help search engines prioritize re-crawling updated pages.",
          },
        ]}
      />

      <ToolProse title="XML Sitemap Standards & Next.js Implementation">
        <p>
          A clean XML sitemap follows the sitemaps.org schema. For large sites, use a sitemap index file:
        </p>

        <ToolCodeBlock
          title="Standard XML Sitemap Index Format"
          language="xml"
          code={`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-posts.xml</loc>
    <lastmod>2026-09-01T12:00:00Z</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-tools.xml</loc>
    <lastmod>2026-09-01T12:00:00Z</lastmod>
  </sitemap>
</sitemapindex>`}
        />

        <ToolCodeBlock
          title="Next.js App Router (app/sitemap.ts)"
          language="typescript"
          description="Generate dynamic XML sitemaps in Next.js with lastmod dates:"
          code={`import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://example.com/tools',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];
}`}
        />
      </ToolProse>

      <ToolGuideCard
        href="/blog/xml-sitemaps-that-actually-help"
        title="Build a sitemap that helps discovery instead of creating noise"
        description="Decide which canonical URLs belong, keep lastmod honest, validate sitemap indexes, and interpret Search Console errors without treating submission as an indexing guarantee."
        cta="Read the practical sitemap guide"
      />

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
