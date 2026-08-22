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
  ToolFaqJsonLd,
  ToolFaqSection,
  ToolHowItWorks,
  ToolProse,
  ToolRelated,
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
    a: "There is no universal “perfect” density. Aim for clear primary topics and natural language. Stuffing the same phrase repeatedly can hurt readability and trust. Treat density as a diagnostic, not a score to game.",
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
        title="How to use density without stuffing"
        intro="Density is a lens on focus and repetition — not a ranking guarantee."
        items={[
          "Confirm your primary topic appears naturally in the opening and headings",
          "Watch for accidental overuse of the same 2–3 word brand or product phrase",
          "Compare a competitor URL only as inspiration, not a percentage to copy",
          "Pair with meta title/description checks so snippets match the page topic",
        ]}
      />

      <ToolProse title="Keyword density and modern SEO">
        <p>
          Search engines care about relevance, usefulness, and clear structure
          far more than hitting a fixed density number. Use this free SEO keyword
          density tool to catch under-covered topics or clumsy repetition, then
          fix titles and metas with the{" "}
          <Link
            href="/tools/meta-tag-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            Meta Tag Checker
          </Link>{" "}
          and run a{" "}
          <Link
            href="/#home-audit-url"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            full SEO checker
          </Link>{" "}
          for structure and technical issues.
        </p>
      </ToolProse>

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
