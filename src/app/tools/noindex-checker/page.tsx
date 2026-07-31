import type { Metadata } from "next";
import Link from "next/link";
import { NoindexCheckerForm } from "@/components/tools/noindex-checker-form";
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

const PAGE_PATH = "/tools/noindex-checker";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "What does a noindex checker look for?",
    a: "It fetches the live URL and reads HTML meta robots / googlebot tags plus the X-Robots-Tag response header to see whether indexing is discouraged for search engines.",
  },
  {
    q: "Can a page be noindex but still crawlable?",
    a: "Yes. noindex asks engines not to show the URL in results; robots.txt may still allow the fetch. Use both the Noindex Checker and the robots.txt checker when diagnosing why a page is missing from Google.",
  },
  {
    q: "Why check X-Robots-Tag as well as meta robots?",
    a: "Some CDNs, reverse proxies, and PDF/non-HTML responses set indexing rules only in HTTP headers. Checking both avoids false “indexable” conclusions from HTML alone.",
  },
  {
    q: "Is this free? Do I need an account?",
    a: `Yes — free, no registration on ${SITE_NAME}. We only fetch the URL you submit; we do not submit URLs to Google.`,
  },
];

export const metadata: Metadata = {
  title: "Free Noindex Checker — Meta Robots & X-Robots-Tag",
  description:
    "Free noindex checker: see if a URL is marked noindex via meta robots, googlebot meta, or X-Robots-Tag. Instant indexing directive check — no signup.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "noindex checker",
    "meta robots checker",
    "x-robots-tag checker",
    "check if page is noindex",
    "indexing checker",
  ],
  openGraph: {
    title: "Free Noindex Checker",
    description:
      "Read meta robots and X-Robots-Tag to see if a URL should be indexed.",
    url: PAGE_PATH,
    type: "website",
  },
};

export default function NoindexCheckerPage() {
  return (
    <ContentPage>
      <ToolFaqJsonLd faqs={faqs} pageUrl={PAGE_URL} name="Free Noindex Checker" />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        On-page
      </ContentEyebrow>
      <ContentTitle>Free Noindex Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Check whether a live URL tells search engines not to index it. We read
        meta robots, googlebot meta, and the X-Robots-Tag header — free, no
        signup.
      </p>

      <div className="mt-10">
        <NoindexCheckerForm />
      </div>

      <ToolHowItWorks
        steps={[
          {
            title: "Paste any public URL",
            body: "We request the page (following sensible redirects) and capture HTML plus response headers.",
          },
          {
            title: "Extract robots directives",
            body: "Meta robots, googlebot-specific meta, and X-Robots-Tag are parsed for noindex / none and related tokens.",
          },
          {
            title: "See a clear indexability summary",
            body: "Use the result to confirm staging, thank-you, or thin templates stay out of the index — or that production pages are not accidentally blocked.",
          },
        ]}
      />

      <ToolBulletSection
        title="What we check"
        items={[
          "meta name=\"robots\" content (and related robots metas)",
          "googlebot-specific meta when present",
          "X-Robots-Tag HTTP header",
          "Whether the response looks intentionally non-indexable",
        ]}
      />

      <ToolProse title="When to use a noindex checker">
        <p>
          Run this after launching staging domains, filtered e‑commerce URLs,
          account-only pages, or thin thank-you templates. If crawlers never
          reach the URL at all, also verify{" "}
          <Link
            href="/tools/robots-txt-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            robots.txt
          </Link>
          . For title, description, and a SERP-style preview, use the{" "}
          <Link
            href="/tools/meta-tag-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            Meta Tag Checker
          </Link>
          .
        </p>
      </ToolProse>

      <ToolFaqSection faqs={faqs} />

      <ToolRelated
        tools={[
          { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
          { href: "/tools/canonical-checker", label: "Canonical Tag Checker" },
          { href: "/tools/meta-tag-checker", label: "Meta Tag Checker" },
          { href: "/tools/redirect-checker", label: "Redirect Checker" },
        ]}
      />
    </ContentPage>
  );
}
