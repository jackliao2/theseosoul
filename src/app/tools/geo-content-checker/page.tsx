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
  ToolFaqJsonLd,
  ToolFaqSection,
  ToolGuideCard,
  ToolHowItWorks,
  ToolProse,
  ToolRelated,
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
        title="What this is (and isn’t)"
        items={[
          "A heuristic for citation-friendly writing — not a live ChatGPT mention tracker",
          "No paid generative API required",
          "Does not invent Domain Authority or traffic stats",
          "Complements technical checks (robots, schema, llms.txt) on the full audit",
        ]}
      />

      <ToolProse title="GEO writing vs classic on-page SEO">
        <p>
          Classic SEO still needs clear titles, metas, and crawlability. GEO
          adds: answerable openings, verifiable facts, and distinctive expertise
          that models can attribute. Use the{" "}
          <Link
            href="/tools/keyword-density-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            Keyword Density Checker
          </Link>{" "}
          for phrase focus, then the{" "}
          <Link
            href="/#home-audit-url"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            technical SEO + GEO audit
          </Link>{" "}
          for the live site.
        </p>
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
