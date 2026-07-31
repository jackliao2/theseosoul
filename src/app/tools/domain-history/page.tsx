import type { Metadata } from "next";
import Link from "next/link";
import { DomainHistoryForm } from "@/components/tools/domain-history-form";
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

const PAGE_PATH = "/tools/domain-history";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "What is a domain history / Wayback checker?",
    a: "It reconstructs how a domain’s homepage looked over time using Internet Archive snapshots, then contrasts that timeline with public WHOIS/RDAP registration data so you can spot second-hand names, parking eras, and purpose changes before you buy or build.",
  },
  {
    q: "Do you use a paid API or AI for this?",
    a: "No. The free check uses the public Wayback CDX index, a bounded sample of archived HTML, and public RDAP WHOIS. There is no credit wall and no required LLM summary.",
  },
  {
    q: "Why don’t you list every title change as a “major redesign”?",
    a: "Pairwise rewrite lists get noisy when hosts flip between parking pages and errors. We group sampled snapshots into life chapters by role — content, parking, error, doorway — so the story stays readable.",
  },
  {
    q: "If Archive shows nothing, is the domain clean?",
    a: "Often yes for unused names, but not always. Small sites can be missed, and robots rules can block archival crawlers. Treat an empty trail as a soft signal, not proof.",
  },
  {
    q: "Is the domain history tool free?",
    a: `Yes. ${SITE_NAME} domain history needs no account. Pair it with the full technical audit when you want current on-page and crawl signals too.`,
  },
];

export const metadata: Metadata = {
  title: "Free Domain History Checker — Wayback & WHOIS Past Lives",
  description:
    "Free domain history checker: reconstruct Internet Archive chapters, spot parking eras, and contrast WHOIS for second-hand domains. No signup, no AI paywall.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "domain history checker",
    "wayback machine domain history",
    "domain archive checker",
    "second hand domain checker",
    "expired domain history",
    "whois archive check",
  ],
  openGraph: {
    title: "Free Domain History Checker",
    description:
      "Read a domain’s archive chapters and WHOIS contrast before you buy — free, no signup.",
    url: PAGE_PATH,
    type: "website",
  },
};

export default function DomainHistoryPage() {
  return (
    <ContentPage wide className="max-w-6xl py-10 sm:py-12">
      <ToolFaqJsonLd
        faqs={faqs}
        pageUrl={PAGE_URL}
        name="Free Domain History Checker"
      />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        Growth & monetization
      </ContentEyebrow>
      <ContentTitle>Domain history checker</ContentTitle>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Before you buy or brand a name, read its past lives: archive chapters,
        parking eras, and whether WHOIS looks first-hand. Public Wayback + RDAP
        only — no credits, no fake DA.
      </p>

      <div className="mt-8">
        <DomainHistoryForm />
      </div>

      <div className="max-w-4xl">
        <ToolHowItWorks
          steps={[
            {
              title: "Pull the CDX timeline",
              body: "We ask Internet Archive for monthly homepage captures, then count active months and unique content digests.",
            },
            {
              title: "Sample representative snapshots",
              body: "Instead of dumping every capture, we fetch a bounded set of digest-change points and classify each page’s role.",
            },
            {
              title: "Tell the story in chapters",
              body: "Consecutive similar roles become chapters — content, parking, errors, doorway — so the report stays scannable.",
            },
            {
              title: "Contrast with WHOIS",
              body: "If archive activity starts far earlier than the current registration date, we flag a likely second-hand domain.",
            },
          ]}
        />

        <ToolBulletSection
          title="What the report highlights"
          intro="The goal is a buy-side due-diligence story, not an endless redesign changelog."
          items={[
            "Clear verdict: clean trail, mixed reuse, parking history, second-hand, or risky signals",
            "First and latest archive captures plus active-month count",
            "Yearly activity bars for scanability",
            "Life chapters with a few evidence snapshots each",
            "WHOIS creation date and second-hand contrast",
            "Direct links into Wayback for manual review",
          ]}
        />

        <ToolProse title="Honest limits">
          <p>
            Archive coverage is uneven. A quiet domain can still have private or
            robots-blocked history, and a noisy domain can look worse than it is
            if parking providers churn HTML. Use this as evidence, then verify
            with your own judgement — and a current technical audit.
          </p>
        </ToolProse>

        <ToolFaqSection faqs={faqs} />

        <ToolRelated
          hint="History is only half the story — check what the live site looks like now."
          tools={[
            { href: "/#home-audit-url", label: "Full SEO + GEO Audit" },
            {
              href: "/tools/adsense-readiness-checker",
              label: "AdSense Readiness",
            },
            { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
            { href: "/tools/redirect-checker", label: "Redirect Checker" },
          ]}
        />
      </div>
    </ContentPage>
  );
}
