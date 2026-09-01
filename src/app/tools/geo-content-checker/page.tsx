import type { Metadata } from "next";
import Link from "next/link";
import { GeoContentCheckerForm } from "@/components/tools/geo-content-checker-form";
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

const PAGE_PATH = "/tools/geo-content-checker";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "What is a GEO content checker?",
    a: "GEO (Generative Engine Optimization) content checks estimate whether a draft looks citation-friendly — clear structure, factual density, authority cues, and differentiation — for AI answers and overviews.",
  },
  {
    q: "Does this query ChatGPT or Perplexity?",
    a: "No. It is a free, rule-based scorer on text you paste. It does not call generative APIs or track live brand mentions in AI answers.",
  },
  {
    q: "How is this different from keyword density?",
    a: "Density focuses on phrase frequency. GEO scoring looks at structure, facts, clarity, completeness, authority signals, and uniqueness — useful when you care about being quotable, not just repeating a keyword.",
  },
  {
    q: "Is the GEO checker free?",
    a: `Yes — free on ${SITE_NAME}, no signup. For bots, schema, llms.txt, and TLS on a live domain, use the full technical SEO + GEO audit.`,
  },
];

export const metadata: Metadata = {
  title: "Free GEO Content Checker — AI Citation Readiness",
  description:
    "Free GEO content checker: score a draft for clear structure, verifiable facts, authority cues, and AI citation readiness. Rule-based, no API or signup.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "geo content checker",
    "generative engine optimization",
    "ai citation checker",
    "geo seo tool",
  ],
  ...createSocialMetadata({
    title: "Free GEO Content Checker",
    description:
      "Rule-based AI citation readiness score for drafts — free, no API key.",
    url: PAGE_PATH,
  }),
};

export default function GeoContentCheckerPage() {
  return (
    <ContentPage>
      <ToolFaqJsonLd
        faqs={faqs}
        pageUrl={PAGE_URL}
        name="Free GEO Content Checker"
      />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        GEO
      </ContentEyebrow>
      <ContentTitle>Free GEO Content Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Score a draft for AI citation readiness — structure, factual density,
        clarity, completeness, authority, and differentiation. Built into{" "}
        {SITE_NAME} as a free, rule-based checker (no ChatGPT API, no signup).
      </p>

      <div className="mt-10">
        <GeoContentCheckerForm />
      </div>

      <ToolHowItWorks
        steps={[
          {
            title: "Paste the section you want AI engines to quote",
            body: "Working intros, definitions, and how-to blocks are better than dumping an entire site.",
          },
          {
            title: "Get dimension scores",
            body: "We score structure, facts, clarity, completeness, authority cues, and differentiation with transparent rules.",
          },
          {
            title: "Revise, then audit the live URL",
            body: "Improve the draft here, then run a full domain audit for bots, schema, and technical GEO signals.",
          },
        ]}
      />

      <ToolBulletSection
        title="What GEO citation readiness evaluates"
        items={[
          "Direct, answer-first sentence structure that LLMs can quote without heavy summarization",
          "Presence of verifiable data points, tables, and authoritative metrics",
          "Author and organizational attribution signals",
          "Formatting compatibility for AI training feeds (such as llms.txt)",
        ]}
      />

      <ToolUseCases
        title="GEO Optimization Scenarios & Best Practices"
        intro="As search shifts toward AI Overviews, Perplexity, and ChatGPT Search, content must be formatted for direct machine citation:"
        cases={[
          {
            badge: "AI Overviews",
            scenario: "Extractable Direct Answer Snippets",
            problem:
              "Burying key answers under 500 words of conversational preamble causes LLMs to synthesize answers from competitor pages.",
            solution:
              "Provide a concise 1-2 sentence direct answer immediately beneath the primary H2 question heading.",
          },
          {
            badge: "Factual Density",
            scenario: "Tabular & Comparative Data Structuring",
            problem:
              "Presenting benchmarks or feature comparisons in dense unstructured paragraphs, making entity extraction difficult.",
            solution:
              "Format comparisons in semantic HTML <table> or clear definition lists for high-confidence AI extraction.",
          },
          {
            badge: "LLM Feeds",
            scenario: "Publishing Standard llms.txt Feeds",
            problem:
              "AI web crawlers spending tokens parsing bloated navigation HTML rather than your authoritative core documentation.",
            solution:
              "Publish an /llms.txt Markdown index summarizing your core services, tools, and technical documentation.",
          },
        ]}
      />

      <ToolProse title="Standard llms.txt & Structured Data Implementation">
        <p>
          Publish a clean <code>/llms.txt</code> at the root of your domain to guide LLM crawlers:
        </p>

        <ToolCodeBlock
          title="Root /llms.txt Standard Template"
          language="markdown"
          code={`# TheSeoSoul
> Free technical SEO audit and inspection reports for any public domain.

## Core Free Tools
- [Canonical Tag Checker](https://theseosoul.com/tools/canonical-checker): Inspect rel=canonical tags.
- [Robots.txt Checker](https://theseosoul.com/tools/robots-txt-checker): Validate crawl rules and AI bot blocks.
- [Noindex Checker](https://theseosoul.com/tools/noindex-checker): Audit meta robots and X-Robots-Tag headers.

## Technical Guides
- [Robots.txt vs Noindex vs Canonical](https://theseosoul.com/blog/robots-txt-vs-noindex-vs-canonical): Architectural decision guide.`}
        />
      </ToolProse>

      <ToolGuideCard
        href="/blog/geo-llms-txt-practical-guide"
        title="Make content easier to quote without inventing an AI score"
        description="Connect citation-friendly writing with crawl policy, llms.txt, Google-Extended, and evidence that readers can verify—while keeping classic search fundamentals intact."
        cta="Read the practical GEO guide"
      />

      <ToolFaqSection faqs={faqs} />

      <ToolRelated
        hint="Citation-ready prose still needs crawl access and clear search/social snippets."
        tools={[
          {
            href: "/tools/keyword-density-checker",
            label: "Keyword Density Checker",
          },
          { href: "/tools/meta-tag-checker", label: "Meta Tag Checker" },
          { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
          { href: "/tools/open-graph-checker", label: "Open Graph Checker" },
        ]}
      />
    </ContentPage>
  );
}
