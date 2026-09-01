import type { Metadata } from "next";
import Link from "next/link";
import { DensityCheckerForm } from "@/components/tools/density-checker-form";
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

const PAGE_PATH = "/tools/keyword-density-checker";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "What is a keyword density checker?",
    a: "It counts how often words and short phrases appear in page text (or a pasted draft) and shows their share of total words. Use it to see topic focus — not as a magic ranking percentage.",
  },
  {
    q: "What is a good keyword density for SEO?",
    a: "There is no universal “perfect” density. Aim for clear primary topics and natural language (typically 1–2.5% for primary terms). Stuffing the same phrase repeatedly can hurt readability and trigger spam filters. Treat density as a diagnostic, not a score to game.",
  },
  {
    q: "Can I check density from a URL or pasted text?",
    a: "Yes. Fetch a live public page or paste a draft before you publish. Optionally enter a focus keyword to see how often that exact phrase appears.",
  },
  {
    q: "Is this keyword density tool free?",
    a: `Yes — free on ${SITE_NAME} with no signup. For titles, metas, headings, and technical issues on the same URL, run the full website SEO checker.`,
  },
];

export const metadata: Metadata = {
  title: "Free Keyword Density Checker Tool — URL or Paste Text",
  description:
    "Free keyword density checker: analyze 1–3 word phrases from any URL or pasted text, plus optional focus keyword count. On-page SEO diagnostic — no signup.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "keyword density checker",
    "keyword density checker tool",
    "keyword density tool",
    "seo keyword density",
    "free keyword density checker",
  ],
  ...createSocialMetadata({
    title: "Free Keyword Density Checker",
    description:
      "1–3 word phrase frequencies from a URL or draft, plus focus keyword — free.",
    url: PAGE_PATH,
  }),
};

export default function KeywordDensityCheckerPage() {
  return (
    <ContentPage>
      <ToolFaqJsonLd
        faqs={faqs}
        pageUrl={PAGE_URL}
        name="Free Keyword Density Checker"
      />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        On-page
      </ContentEyebrow>
      <ContentTitle>Free Keyword Density Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        See which 1-, 2-, and 3-word phrases dominate a live page — or paste a
        draft before you publish. Optional focus keyword count included. Free
        keyword density checker tool, no signup.
      </p>

      <div className="mt-10">
        <DensityCheckerForm />
      </div>

      <ToolHowItWorks
        steps={[
          {
            title: "Fetch a URL or paste content",
            body: "Live mode strips obvious chrome and counts visible text; paste mode scores your draft as written.",
          },
          {
            title: "Count unigrams, bigrams, and trigrams",
            body: "Common stop words are handled so the list surfaces topical phrases, not only “the” and “and”.",
          },
          {
            title: "Optional focus keyword",
            body: "Enter a target phrase to see exact-match frequency alongside the broader density table.",
          },
        ]}
      />

      <ToolBulletSection
        title="How to use density without keyword stuffing"
        intro="Modern search engines analyze semantic topic clusters rather than rigid keyword percentages."
        items={[
          "Confirm your primary topic appears naturally in the opening paragraph and H2 subheadings",
          "Identify awkward repetition of identical 2-3 word product names or geographical tags",
          "Ensure secondary and LSI (Latent Semantic Indexing) terms are represented across body text",
          "Pair with title and meta description checks to maintain thematic consistency",
        ]}
      />

      <ToolUseCases
        title="On-Page Keyword Optimization Scenarios"
        intro="Auditing keyword frequency reveals why pages get flagged for over-optimization or fail to rank for target phrases:"
        cases={[
          {
            badge: "Over-Optimization",
            scenario: "Accidental Keyword Stuffing Penalty",
            problem:
              "Repeating an exact-match phrase like 'best seo audit tool' 30 times on a 500-word page (6%+ density) triggers algorithmic spam demotions.",
            solution:
              "Keep primary keyword density between 1% and 2.5%, replacing excessive instances with synonyms and related conceptual terms.",
          },
          {
            badge: "Cannibalization",
            scenario: "Internal Keyword Cannibalization",
            problem:
              "Multiple blog posts competing for the same dominant bigram, causing Google to alternate which page ranks in SERPs.",
            solution:
              "Use the density checker to differentiate the focus terms across posts, consolidating duplicate articles where appropriate.",
          },
          {
            badge: "GEO Readiness",
            scenario: "Entity Salience for AI Summarization",
            problem:
              "Content burying key entities and answers inside long fluff intros, making it difficult for LLMs and search engines to extract factual snippets.",
            solution:
              "Structure paragraphs with answer-first sentences featuring clear entity names and definitions.",
          },
        ]}
      />

      <ToolProse title="Semantic Heading & Keyword Structure Example">
        <p>
          Organize on-page content hierarchically to distribute keyword relevance without artificial density stuffing:
        </p>

        <ToolCodeBlock
          title="Semantic On-Page Content Hierarchy"
          language="html"
          code={`<article>
  <!-- Primary Topic in H1 (Once per page) -->
  <h1>Complete Technical SEO Audit Checklist</h1>

  <!-- Direct Answer in First Paragraph -->
  <p>A technical SEO audit evaluates website crawlability, indexation, speed, and mobile architecture...</p>

  <!-- Sub-topic Entities in H2s -->
  <h2>1. Crawlability & Robots.txt Directives</h2>
  <p>Ensure search bots can access key rendering assets without hitting disallow traps...</p>

  <h2>2. Canonicalization & Duplicate Content</h2>
  <p>Consolidate URL variants with self-referencing canonical tags...</p>
</article>`}
        />
      </ToolProse>

      <ToolGuideCard
        href="/blog/geo-llms-txt-practical-guide"
        title="From Keyword Density to AI Answer Optimization"
        description="Learn how modern AI engines (ChatGPT Search, Perplexity, Gemini) extract answers from content structures beyond traditional keyword density."
        cta="Read GEO optimization guide"
      />

      <ToolFaqSection faqs={faqs} />

      <ToolRelated
        hint="Density is only a focus check — titles, GEO shape, and shares still matter."
        tools={[
          { href: "/tools/meta-tag-checker", label: "Meta Tag Checker" },
          { href: "/tools/geo-content-checker", label: "GEO Content Checker" },
          { href: "/tools/open-graph-checker", label: "Open Graph Checker" },
          { href: "/tools/canonical-checker", label: "Canonical Tag Checker" },
        ]}
      />
    </ContentPage>
  );
}
