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
  ToolFaqJsonLd,
  ToolFaqSection,
  ToolGuideCard,
  ToolHowItWorks,
  ToolProse,
  ToolRelated,
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
    a: "Common working ranges are roughly 30–60 characters for titles and 120–160 for descriptions. Google may rewrite snippets; this tool shows what you declared, not a guaranteed live SERP.",
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
          "Document <title> presence and character length",
          "meta name=\"description\" presence and length",
          "Quick status for empty, short, OK, or long fields",
          "SERP-style preview for drafting or QA",
        ]}
      />

      <ToolProse title="Length guidelines (and caveats)">
        <p>
          Pixel width varies by device and query, so character counts are
          guidelines — not hard limits. Google may rewrite titles and
          descriptions using on-page content. Still, clear unique metas help
          humans and reduce weak automatic snippets. For social shares, use the{" "}
          <Link
            href="/tools/open-graph-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            Open Graph Checker
          </Link>
          ; for full-page SEO, run the{" "}
          <Link
            href="/#home-audit-url"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            website SEO checker
          </Link>
          .
        </p>
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
