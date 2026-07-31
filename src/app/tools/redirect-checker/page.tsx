import type { Metadata } from "next";
import Link from "next/link";
import { RedirectCheckerForm } from "@/components/tools/redirect-checker-form";
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

const PAGE_PATH = "/tools/redirect-checker";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "What does a redirect checker show?",
    a: "It follows the HTTP redirect chain from your start URL and lists each hop with its status code until the final landing URL — useful for spotting HTTP→HTTPS, www flips, and long chains.",
  },
  {
    q: "Are redirect chains bad for SEO?",
    a: "One intentional hop (e.g. apex to www over HTTPS) is normal. Long chains waste time for users and crawlers and can make migrations harder to reason about. Prefer a single permanent redirect to the canonical URL.",
  },
  {
    q: "301 vs 302 — does this tool judge which I should use?",
    a: "We report the status codes we observe. Choosing 301 vs 302 is a product/SEO decision based on whether the move is permanent. Pair the chain with your canonical tag for a complete picture.",
  },
  {
    q: "Is the redirect checker free?",
    a: `Yes. ${SITE_NAME} redirect checker needs no account. For preferred URL signals, also run the Canonical Tag Checker.`,
  },
];

export const metadata: Metadata = {
  title: "Free Redirect Checker — HTTP Redirect Chain Tool",
  description:
    "Free redirect checker: trace every HTTP hop, status code, and final destination for any public URL. Spot long chains before crawlers do — no signup.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "redirect checker",
    "redirect chain checker",
    "http redirect checker",
    "301 redirect checker",
    "url redirect checker",
  ],
  openGraph: {
    title: "Free Redirect Checker",
    description:
      "Trace redirect hops and status codes to the final URL — free, no signup.",
    url: PAGE_PATH,
    type: "website",
  },
};

export default function RedirectCheckerPage() {
  return (
    <ContentPage>
      <ToolFaqJsonLd
        faqs={faqs}
        pageUrl={PAGE_URL}
        name="Free Redirect Checker"
      />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        Technical
      </ContentEyebrow>
      <ContentTitle>Free Redirect Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Trace the full HTTP redirect chain from a start URL to the final landing
        page. Spot HTTP→HTTPS flips, www vs apex hops, and chains that waste
        crawl budget — free, no signup.
      </p>

      <div className="mt-10">
        <RedirectCheckerForm />
      </div>

      <ToolHowItWorks
        steps={[
          {
            title: "Enter the URL users or crawlers hit first",
            body: "Old campaign links, HTTP variants, and marketing short links are common places chains hide.",
          },
          {
            title: "Follow each Location hop",
            body: "We record status codes and intermediate URLs until a non-redirect response (or a safety hop limit).",
          },
          {
            title: "Compare with your canonical",
            body: "The final URL should usually match the preferred address you declare with rel=canonical.",
          },
        ]}
      />

      <ToolBulletSection
        title="What this redirect chain tool reports"
        items={[
          "Each hop URL in order",
          "HTTP status codes (301, 302, 307, 308, etc.)",
          "Final destination after the chain",
          "Chain length so you can see when hops stack up",
        ]}
      />

      <ToolProse title="Why short redirect chains matter">
        <p>
          Search engines and AI crawlers prefer a short path to the canonical
          page. After a migration, run this free redirect checker on key old
          URLs, then confirm{" "}
          <Link
            href="/tools/canonical-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            canonical tags
          </Link>{" "}
          and a{" "}
          <Link
            href="/#home-audit-url"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            full technical SEO audit
          </Link>{" "}
          on the destination host.
        </p>
      </ToolProse>

      <ToolFaqSection faqs={faqs} />

      <ToolRelated
        tools={[
          { href: "/tools/canonical-checker", label: "Canonical Tag Checker" },
          { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
          { href: "/tools/noindex-checker", label: "Noindex Checker" },
          { href: "/tools/meta-tag-checker", label: "Meta Tag Checker" },
        ]}
      />
    </ContentPage>
  );
}
