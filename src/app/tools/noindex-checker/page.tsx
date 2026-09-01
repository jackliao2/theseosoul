import type { Metadata } from "next";
import Link from "next/link";
import { NoindexCheckerForm } from "@/components/tools/noindex-checker-form";
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

const PAGE_PATH = "/tools/noindex-checker";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "What does a noindex checker look for?",
    a: "It fetches the live URL and reads HTML meta robots / googlebot tags plus the X-Robots-Tag response header to see whether indexing is discouraged for search engines.",
  },
  {
    q: "Can a page be noindex but still crawlable?",
    a: "Yes. noindex asks engines not to show the URL in results; robots.txt may still allow the fetch. Use both the Noindex Checker and the robots.txt checker when diagnosing why a page is missing from Google.",
  },
  {
    q: "Is “Crawled – currently not indexed” the same as noindex?",
    a: "No. That Search Console status means Google fetched the URL and chose not to index it. A noindex is an explicit publisher signal. If this checker shows the page is allowed to be indexed, read the crawled-currently-not-indexed guide instead of hunting a missing tag.",
  },
  {
    q: "Why check X-Robots-Tag as well as meta robots?",
    a: "Some CDNs, reverse proxies, and PDF/non-HTML responses set indexing rules only in HTTP headers. Checking both avoids false “indexable” conclusions from HTML alone.",
  },
  {
    q: "Is this free? Do I need an account?",
    a: `Yes — free, no registration on ${SITE_NAME}. We only fetch the URL you submit; we do not submit URLs to Google.`,
  },
];

export const metadata: Metadata = {
  title: "Free Noindex Checker — Meta Robots & X-Robots-Tag",
  description:
    "Free noindex checker: see if a URL is marked noindex via meta robots, googlebot meta, or X-Robots-Tag. Instant indexing directive check — no signup.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "noindex checker",
    "meta robots checker",
    "x-robots-tag checker",
    "check if page is noindex",
    "indexing checker",
  ],
  ...createSocialMetadata({
    title: "Free Noindex Checker",
    description:
      "Read meta robots and X-Robots-Tag to see if a URL should be indexed.",
    url: PAGE_PATH,
  }),
};

export default function NoindexCheckerPage() {
  return (
    <ContentPage>
      <ToolFaqJsonLd
        faqs={faqs}
        pageUrl={PAGE_URL}
        name="Free Noindex & X-Robots-Tag Checker"
      />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        On-page
      </ContentEyebrow>
      <ContentTitle>Free Noindex &amp; X-Robots-Tag Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Check whether a live URL tells search engines not to index it. We read
        meta robots, googlebot meta, and the X-Robots-Tag header — free, no
        signup.
      </p>

      <div className="mt-10">
        <NoindexCheckerForm />
      </div>

      <ToolHowItWorks
        steps={[
          {
            title: "Paste any public URL",
            body: "We request the page (following sensible redirects) and capture HTML plus response headers.",
          },
          {
            title: "Extract robots directives",
            body: "Meta robots, googlebot-specific meta, and X-Robots-Tag are parsed for noindex / none and related tokens.",
          },
          {
            title: "See a clear indexability summary",
            body: "Use the result to confirm staging, thank-you, or thin templates stay out of the index — or that production pages are not accidentally blocked.",
          },
        ]}
      />

      <ToolBulletSection
        title="What this noindex checker inspects"
        items={[
          "HTML <meta name=\"robots\" content=\"noindex\"> declarations",
          "Engine-specific directives such as <meta name=\"googlebot\" content=\"noindex\">",
          "HTTP response headers for X-Robots-Tag: noindex, nofollow, or none",
          "The critical robots.txt trap: ensure noindex pages are NOT blocked in robots.txt so Google can fetch the directive",
        ]}
      />

      <ToolUseCases
        title="Real-World Noindex Scenarios & Debugging"
        intro="Accidental noindex tags cause sudden, catastrophic de-indexing in Google Search. Here are the most frequent causes we observe:"
        cases={[
          {
            badge: "Staging Leaks",
            scenario: "Deploying Staging Metadata to Production",
            problem:
              "CI/CD pipelines deploying environment variables or header configs intended for dev.example.com into production, immediately de-indexing core pages.",
            solution:
              "Audit production headers for X-Robots-Tag and enforce environment-aware robots metadata in your build step.",
          },
          {
            badge: "CMS Setting",
            scenario: "WordPress 'Discourage Search Engines' Toggled",
            problem:
              "The 'Discourage search engines from indexing this site' option remains checked after launching a new WordPress site, outputting noindex sitewide.",
            solution:
              "Uncheck the setting in Settings > Reading, and inspect with this tool to confirm all meta robots tags are clear.",
          },
          {
            badge: "Static / PDF Assets",
            scenario: "Hidden X-Robots-Tag on CDN Assets",
            problem:
              "Cloudflare Transform Rules or Nginx configs injecting X-Robots-Tag on entire MIME types or subdirectories inadvertently.",
            solution:
              "Check raw HTTP response headers on PDF documentation, public landing pages, and APIs to isolate header-level blocks.",
          },
        ]}
      />

      <ToolProse title="How to Implement or Remove Noindex Correctly">
        <p>
          To prevent a page from appearing in search results while still allowing search engines to follow its links, use the standard HTML meta robots tag:
        </p>

        <ToolCodeBlock
          title="Standard HTML Meta Robots (Noindex, Follow)"
          language="html"
          code={`<!-- Tells Google not to index this page, but still follow outbound links -->
<head>
  <meta name="robots" content="noindex, follow" />
</head>`}
        />

        <ToolCodeBlock
          title="Next.js App Router (metadata.robots)"
          language="typescript"
          description="In Next.js, declare indexing rules per page or layout:"
          code={`import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};`}
        />

        <ToolCodeBlock
          title="Nginx HTTP Header (X-Robots-Tag)"
          language="nginx"
          description="For non-HTML files (e.g., internal PDF reports, staging subpaths):"
          code={`location /staging/ {
    add_header X-Robots-Tag "noindex, nofollow" always;
}`}
        />
      </ToolProse>

      <ToolGuideCard
        href="/blog/find-and-fix-accidental-noindex"
        title="Found an accidental noindex? Trace it to the source"
        description="Work through meta robots, X-Robots-Tag, CMS defaults, staging leftovers, and the robots.txt trap—then verify that the production URL is genuinely eligible for indexing."
        cta="Use the noindex recovery checklist"
      />

      <ToolGuideCard
        href="/blog/crawled-currently-not-indexed"
        title="Crawled – currently not indexed is not a noindex"
        description="Google already fetched the URL and declined to show it. Separate that from a robots/noindex mistake before you request indexing again."
        cta="Read the crawled-not-indexed checklist"
      />

      <ToolFaqSection faqs={faqs} />

      <ToolRelated
        hint="If the page never gets fetched, or signals disagree, check these next."
        tools={[
          { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
          { href: "/tools/canonical-checker", label: "Canonical Tag Checker" },
          { href: "/tools/meta-tag-checker", label: "Meta Tag Checker" },
          { href: "/tools/redirect-checker", label: "Redirect Checker" },
        ]}
      />
    </ContentPage>
  );
}
