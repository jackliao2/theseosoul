import type { Metadata } from "next";
import Link from "next/link";
import { CanonicalCheckerForm } from "@/components/tools/canonical-checker-form";
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

const PAGE_PATH = "/tools/canonical-checker";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "What does a canonical tag checker do?",
    a: "It fetches a live URL and inspects link rel=canonical — whether it exists, points to itself (self-referencing), or nominates a different URL/host as the preferred version.",
  },
  {
    q: "Should every page have a self-referencing canonical?",
    a: "For most indexable pages, a clear self-referencing canonical (or a deliberate cross-URL canonical for true duplicates) reduces confusion across HTTP/HTTPS, www/apex, and parameter variants.",
  },
  {
    q: "Canonical points to another domain — is that wrong?",
    a: "Cross-host canonicals are sometimes intentional (syndicated content, migrations). They are a strong signal that this URL is not the preferred index target — confirm that matches your strategy.",
  },
  {
    q: "Is this canonical URL checker free?",
    a: `Yes. Free on ${SITE_NAME}, no signup. Pair with the Redirect Checker when hop chains and preferred URLs disagree.`,
  },
];

export const metadata: Metadata = {
  title: "Free Canonical Tag Checker — Check Canonical URL",
  description:
    "Free canonical tag checker: see if a page has rel=canonical, whether it is self-referencing, and if it points to another host. Instant canonical URL check — no signup.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "canonical tag checker",
    "canonical link checker",
    "check canonical url",
    "canonical url checker",
    "rel canonical checker",
  ],
  ...createSocialMetadata({
    title: "Free Canonical Tag Checker",
    description:
      "Inspect rel=canonical — present, self-ref, or cross-host — free, no signup.",
    url: PAGE_PATH,
  }),
};

export default function CanonicalCheckerPage() {
  return (
    <ContentPage>
      <ToolFaqJsonLd
        faqs={faqs}
        pageUrl={PAGE_URL}
        name="Free Canonical Tag Checker"
      />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        On-page
      </ContentEyebrow>
      <ContentTitle>Free Canonical Tag Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Fetch a live URL and inspect{" "}
        <code className="text-[13px]">&lt;link rel=&quot;canonical&quot;&gt;</code>{" "}
        — present or missing, self-referencing, or pointing elsewhere. Free
        canonical URL checker, no signup.
      </p>

      <div className="mt-10">
        <CanonicalCheckerForm />
      </div>

      <ToolHowItWorks
        steps={[
          {
            title: "Enter the URL you care about indexing",
            body: "We fetch HTML and read the first meaningful rel=canonical declaration.",
          },
          {
            title: "Compare against the requested URL",
            body: "Self-referencing vs cross-URL (and cross-host) is summarized clearly.",
          },
          {
            title: "Align redirects and canonicals",
            body: "If users hop through redirects, the final URL and canonical should usually agree.",
          },
        ]}
      />

      <ToolBulletSection
        title="What this canonical link checker reports"
        items={[
          "Whether a canonical link tag is present in the document <head>",
          "Resolved canonical absolute URL and protocol validity",
          "Self-referencing vs points-elsewhere status",
          "Cross-host canonicals that nominate an external domain as the authoritative source",
        ]}
      />

      <ToolUseCases
        title="Common Canonical Tag Pitfalls & Scenarios"
        intro="Misconfigured canonical tags are among the leading causes of search cannibalization and indexing drops. Here is how to diagnose them."
        cases={[
          {
            badge: "E-Commerce",
            scenario: "Tracking & Filter Parameter Duplication",
            problem:
              "Query parameters like ?sort=price_asc, ?color=blue, or UTM tags create dozens of near-identical URLs competing for the same keywords.",
            solution:
              "Point rel=canonical on all filtered/sorted variations back to the clean, parameterless master category or product URL.",
          },
          {
            badge: "Infrastructure",
            scenario: "Protocol & Subdomain Splitting (HTTP/HTTPS & Apex/WWW)",
            problem:
              "If http://site.com and https://www.site.com both serve 200 OK without self-canonicalization, Google splits ranking signals between 4 distinct URLs.",
            solution:
              "Pair a 301 redirect rule to the primary host with a strict self-referencing canonical URL on every rendered page.",
          },
          {
            badge: "Content Syndication",
            scenario: "Cross-Domain Republishing",
            problem:
              "Publishing an article on Medium, Substack, or LinkedIn before your own site can result in the third-party platform outranking your original domain.",
            solution:
              "Specify a cross-domain rel=canonical pointing to your original canonical post URL on the external platform.",
          },
        ]}
      />

      <ToolProse title="How to Implement Clean Canonical Tags">
        <p>
          Always ensure your canonical URLs are <strong>absolute</strong> (including{" "}
          <code>https://</code> and full hostname) rather than relative paths.
          Relative URLs can be resolved incorrectly by search engines during domain migrations or proxy caching.
        </p>

        <ToolCodeBlock
          title="HTML Canonical Link Tag Boilerplate"
          language="html"
          code={`<!-- Self-referencing canonical on https://example.com/blog/seo-guide -->
<head>
  <link rel="canonical" href="https://example.com/blog/seo-guide" />
</head>`}
        />

        <ToolCodeBlock
          title="Next.js App Router (metadata.alternates.canonical)"
          language="typescript"
          description="In Next.js App Router, specify canonical URLs directly in page metadata:"
          code={`import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SEO Best Practices Guide',
  alternates: {
    canonical: 'https://example.com/blog/seo-guide',
  },
};`}
        />
      </ToolProse>

      <ToolGuideCard
        href="/blog/robots-txt-vs-noindex-vs-canonical"
        title="Robots.txt vs Noindex vs Canonical: The Technical Decision Matrix"
        description="Confused about when to block in robots.txt versus adding a noindex header or canonical tag? Read our comprehensive architectural breakdown."
        cta="Read full guide"
      />

      <ToolFaqSection faqs={faqs} />

      <ToolRelated
        hint="Canonicals and redirects should agree — then confirm the page can be indexed."
        tools={[
          { href: "/tools/redirect-checker", label: "Redirect Checker" },
          { href: "/tools/noindex-checker", label: "Noindex Checker" },
          { href: "/tools/meta-tag-checker", label: "Meta Tag Checker" },
          { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
        ]}
      />
    </ContentPage>
  );
}
