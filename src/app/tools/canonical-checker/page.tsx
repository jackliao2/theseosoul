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
  ToolFaqJsonLd,
  ToolFaqSection,
  ToolHowItWorks,
  ToolProse,
  ToolRelated,
} from "@/components/tools/tool-page-guide";
import { SITE_NAME, SITE_URL } from "@/lib/audit/types";

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
  openGraph: {
    title: "Free Canonical Tag Checker",
    description:
      "Inspect rel=canonical — present, self-ref, or cross-host — free, no signup.",
    url: PAGE_PATH,
    type: "website",
  },
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
          "Whether a canonical link tag is present",
          "Resolved canonical absolute URL when possible",
          "Self-referencing vs points-elsewhere status",
          "Cross-host canonicals that change the preferred domain",
        ]}
      />

      <ToolProse title="Why canonicals matter for duplicate URLs">
        <p>
          Parameterized listings, HTTP vs HTTPS, and www vs apex variants often
          look like the “same” page to users but different URLs to crawlers. A
          clear preferred URL consolidates signals. If the hop chain is messy,
          run the{" "}
          <Link
            href="/tools/redirect-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            Redirect Checker
          </Link>{" "}
          next, then a{" "}
          <Link
            href="/#home-audit-url"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            full technical SEO audit
          </Link>
          .
        </p>
      </ToolProse>

      <ToolFaqSection faqs={faqs} />

      <ToolRelated
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
