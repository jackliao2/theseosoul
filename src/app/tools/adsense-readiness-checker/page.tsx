import type { Metadata } from "next";
import Link from "next/link";
import { AdsenseReadinessForm } from "@/components/tools/adsense-readiness-form";
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

const PAGE_PATH = "/tools/adsense-readiness-checker";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "Does a passing result guarantee Google AdSense approval?",
    a: "No. This is a rules-based pre-check of public website signals. Google makes the final decision and can consider account history, site ownership, traffic quality, originality, policy context, and pages that were not included in our bounded sample.",
  },
  {
    q: "Is ads.txt required before applying for AdSense?",
    a: "No. Google says ads.txt is not mandatory, although it is highly recommended once you have a publisher ID because it identifies the sellers authorized to sell your inventory. This checker treats a missing ads.txt file as informational rather than an automatic failure.",
  },
  {
    q: "How many pages does the checker inspect?",
    a: "It fetches the homepage, public support files, common trust pages, and up to five content pages discovered through the XML sitemap or homepage links. It is a bounded sample, not a full-site crawl.",
  },
  {
    q: "Does Google require a minimum article word count?",
    a: "Google does not publish a universal minimum word count for AdSense approval. The content-depth markers in this report are review heuristics designed to surface unusually thin pages, not official thresholds.",
  },
  {
    q: "Does the tool use AI to judge originality or prohibited content?",
    a: "No. The free check uses transparent rules and does not pretend it can prove originality, copyright ownership, or every policy category from a small crawl. Those items are marked Review so the site owner can verify them against current Google Publisher Policies.",
  },
  {
    q: "What information is sent to the checker?",
    a: `Only the public domain or URL you submit. ${SITE_NAME} fetches publicly accessible pages and files from its servers. It does not request your AdSense login, analytics account, Search Console, or private traffic data.`,
  },
];

export const metadata: Metadata = {
  title: "Free AdSense Readiness Checker — Website Approval Pre-Check",
  description:
    "Free AdSense readiness checker: inspect crawl access, privacy/About/Contact pages, ads.txt, sitemap, and a bounded content sample before requesting Google review. No signup.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "AdSense readiness checker",
    "AdSense approval checker",
    "AdSense eligibility checker",
    "AdSense website requirements",
    "Google AdSense pre check",
    "AdSense privacy policy checker",
    "ads txt checker",
  ],
  openGraph: {
    title: "Free AdSense Readiness Checker",
    description:
      "Check public crawl, trust, content, and monetization signals before requesting Google AdSense review.",
    url: PAGE_PATH,
    type: "website",
  },
};

export default function AdsenseReadinessCheckerPage() {
  return (
    <ContentPage>
      <ToolFaqJsonLd
        faqs={faqs}
        pageUrl={PAGE_URL}
        name="Free AdSense Readiness Checker"
      />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        Growth & monetization
      </ContentEyebrow>
      <ContentTitle>Free AdSense Readiness Checker</ContentTitle>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Check whether the public parts of a website have a solid foundation for
        Google AdSense review. We inspect crawl access, publisher trust pages,
        privacy disclosures, ads.txt, navigation, and a bounded content sample
        — then separate observable fixes from items only the owner can confirm.
      </p>

      <div className="mt-8">
        <AdsenseReadinessForm />
      </div>

      <ToolHowItWorks
        steps={[
          {
            title: "Return to the site homepage",
            body: "An inner page URL is reduced to its site origin because AdSense reviews the website, not just one submitted article.",
          },
          {
            title: "Inspect public trust and crawl signals",
            body: "We check robots.txt, sitemap, ads.txt, indexability, navigation, and discoverable Privacy, About, Contact, and Terms pages.",
          },
          {
            title: "Sample content without crawling the whole web",
            body: "Up to five same-site pages are selected from the sitemap or homepage links and checked for readable depth, headings, indexing, titles, and placeholder language.",
          },
          {
            title: "Separate fixes from owner-only review",
            body: "Public technical findings become a prioritized repair list. Account eligibility, traffic quality, copyright, and policy context remain explicit owner checks.",
          },
        ]}
      />

      <ToolBulletSection
        title="What the AdSense readiness report checks"
        intro="The report focuses on publicly verifiable evidence instead of presenting a fake approval probability."
        items={[
          "Homepage reachability, HTTPS, redirect path, robots.txt, and indexability",
          "Whether a full-site rule blocks Google’s Mediapartners crawler",
          "XML sitemap and useful internal navigation",
          "Public Privacy, About, Contact, and Terms pages",
          "Advertising and cookie disclosure signals in the privacy page",
          "A maximum five-page sample for thin, placeholder, noindex, untitled, or poorly structured content",
          "ads.txt format and detected AdSense publisher ID alignment when available",
          "Owner-only confirmations for account eligibility, traffic, rights, policy, and ad experience",
        ]}
      />

      <ToolProse title="What this score means — and what it does not">
        <p>
          The readiness score summarizes measurable public checks. It is not the
          percentage chance that Google will approve an application. Google can
          review the entire site and account, while this free tool deliberately
          limits its crawl and has no access to private AdSense or traffic data.
        </p>
        <p>
          Content word counts are used only to locate pages worth reviewing.
          Google does not publish a universal 800-word, 1,000-word, or any other
          fixed AdSense minimum. A shorter page can still be useful; a longer
          page can still be repetitive or unoriginal.
        </p>
      </ToolProse>

      <ToolProse title="Official policy still comes first">
        <p>
          Before requesting review, read Google’s current{" "}
          <a
            href="https://support.google.com/adsense/answer/7299563?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            site readiness guidance
          </a>
          ,{" "}
          <a
            href="https://support.google.com/publisherpolicies/answer/10502938"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            Publisher Policies
          </a>
          , and{" "}
          <a
            href="https://support.google.com/publisherpolicies/answer/10437795"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            Publisher Restrictions
          </a>
          . Policies change, and the publisher remains responsible for the
          complete site.
        </p>
      </ToolProse>

      <ToolFaqSection faqs={faqs} />

      <ToolRelated
        hint="Use the readiness report for monetization prep, then inspect the overlapping technical signals in more detail."
        tools={[
          { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
          { href: "/tools/noindex-checker", label: "Noindex Checker" },
          { href: "/tools/redirect-checker", label: "Redirect Checker" },
          { href: "/#home-audit-url", label: "Full SEO + GEO Audit" },
        ]}
      />
    </ContentPage>
  );
}
