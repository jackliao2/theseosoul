import type { Metadata } from "next";
import Link from "next/link";
import { MetaTagCheckerForm } from "@/components/tools/meta-tag-checker-form";
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

const PAGE_PATH = "/tools/meta-tag-checker";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "What does a meta tag checker do?",
    a: "It pulls the HTML title and meta description from a live URL (or lets you simulate a snippet), then flags length bands so you can tighten click-worthy search results before publishing.",
  },
  {
    q: "What is a good title and meta description length?",
    a: "Common working ranges are roughly 30–60 characters for titles (under ~580px width) and 120–160 for descriptions. Google may rewrite snippets; this tool shows what you declared, not a guaranteed live SERP.",
  },
  {
    q: "Is this also a SERP preview / simulator?",
    a: "Yes. You can fetch live tags or type title and description to preview a Google-style result layout. Old /tools/serp-preview links redirect here.",
  },
  {
    q: "Do I need an account for this free meta description checker?",
    a: `No. ${SITE_NAME} meta tag checker is free with no registration.`,
  },
];

export const metadata: Metadata = {
  title: "Free Meta Tag Checker — Title, Description & SERP Preview",
  description:
    "Free meta tag checker and SERP preview: pull title & meta description from any URL, check length bands, or simulate a Google-style snippet. No signup.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "meta tag checker",
    "meta description checker",
    "meta title checker",
    "title and meta description checker",
    "seo title checker",
    "serp preview",
  ],
  ...createSocialMetadata({
    title: "Free Meta Tag Checker",
    description:
      "Live title & meta description check plus Google-style SERP preview — free.",
    url: PAGE_PATH,
  }),
};

export default function MetaTagCheckerPage() {
  return (
    <ContentPage>
      <ToolFaqJsonLd
        faqs={faqs}
        pageUrl={PAGE_URL}
        name="Free Meta Title & Description Checker"
      />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        On-page
      </ContentEyebrow>
      <ContentTitle>Free Meta Title &amp; Description Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Check a live page’s title and meta description (length + status), or
        simulate a Google-style SERP snippet before you publish. Free title and
        meta description checker — no signup.
      </p>

      <div className="mt-10">
        <MetaTagCheckerForm />
      </div>

      <ToolHowItWorks
        steps={[
          {
            title: "Fetch a URL or switch to simulator",
            body: "Live mode reads the document title and meta description from HTML. Simulator mode lets you draft without publishing.",
          },
          {
            title: "Review length bands",
            body: "Too short or too long titles and descriptions are flagged so you can edit for clarity and click potential.",
          },
          {
            title: "Preview the snippet layout",
            body: "See how title, URL path, and description sit together in a familiar search-result style block.",
          },
        ]}
      />

      <ToolBulletSection
        title="What this meta title & description checker covers"
        items={[
          "Document <title> presence, truncation limits, and character count",
          "meta name=\"description\" presence, search intent alignment, and length",
          "Character count boundaries: 30–60 for titles, 120–160 for descriptions",
          "Live search snippet simulator for desktop and mobile previewing",
        ]}
      />

      <ToolUseCases
        title="Meta Tag Optimization Scenarios & Fixes"
        intro="Search engines evaluate your title and description for relevance and click-through rate. Here is how to fix common snippet mistakes:"
        cases={[
          {
            badge: "CTR Optimization",
            scenario: "Google SERP Title Rewriting",
            problem:
              "When your <title> is keyword-stuffed, repetitive, or doesn't match the primary H1 heading, Google replaces your title with automated page text.",
            solution:
              "Keep titles under 60 characters, front-load your primary keyword, and ensure the H1 heading naturally mirrors the title tag.",
          },
          {
            badge: "Mobile Usability",
            scenario: "Truncated Mobile SERP Snippets",
            problem:
              "Long meta descriptions (>160 chars) get truncated mid-sentence on mobile displays, cutting off your primary call-to-action.",
            solution:
              "Front-load the core value proposition and call-to-action in the first 120 characters of the meta description.",
          },
          {
            badge: "Architecture",
            scenario: "Duplicate Sitewide Boilerplate Metas",
            problem:
              "Every category or blog post reusing the company slogan as its meta description causes Google to ignore the description entirely.",
            solution:
              "Craft distinct, page-specific descriptions answering the exact searcher intent for every indexable URL.",
          },
        ]}
      />

      <ToolProse title="Production Meta Tags Implementation">
        <p>
          A compliant HTML <code>&lt;head&gt;</code> should provide search engines with concise, unique metadata:
        </p>

        <ToolCodeBlock
          title="Standard HTML5 Head Metadata Boilerplate"
          language="html"
          code={`<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Free Meta Tag Checker — TheSeoSoul</title>
  <meta name="description" content="Inspect your HTML title and meta description for optimal length, SERP display, and click-through rates. Free tool." />
</head>`}
        />

        <ToolCodeBlock
          title="Next.js App Router Dynamic Metadata"
          language="typescript"
          description="Generate dynamic titles and descriptions with template fallbacks in Next.js:"
          code={`import type { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: 'Product Title | BrandName',
    description: 'Detailed product summary for optimal SERP snippet display.',
  };
}`}
        />
      </ToolProse>

      <ToolGuideCard
        href="/blog/free-meta-tag-checker-titles-descriptions"
        title="Write stronger snippets without chasing pixel myths"
        description="Use the checker as editorial QA: align the title with the page, make the description useful to searchers, and understand when Google may choose different snippet text."
        cta="Read the title and description guide"
      />

      <ToolFaqSection faqs={faqs} />

      <ToolRelated
        hint="Snippets are one layer — check social cards, focus phrases, and indexability too."
        tools={[
          { href: "/tools/open-graph-checker", label: "Open Graph Checker" },
          {
            href: "/tools/keyword-density-checker",
            label: "Keyword Density Checker",
          },
          { href: "/tools/canonical-checker", label: "Canonical Tag Checker" },
          { href: "/tools/noindex-checker", label: "Noindex Checker" },
        ]}
      />
    </ContentPage>
  );
}
