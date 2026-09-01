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
  ...createSocialMetadata({
    title: "Free Redirect Checker",
    description:
      "Trace redirect hops and status codes to the final URL — free, no signup.",
    url: PAGE_PATH,
  }),
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
          "Sequential listing of every intermediate URL hop",
          "HTTP response status codes (301 Permanent, 302 Temporary, 307/308)",
          "Final landing destination and canonical alignment",
          "Chain latency and crawl budget waste warnings",
        ]}
      />

      <ToolUseCases
        title="Common Redirect Pitfalls & Architecture Scenarios"
        intro="Inefficient redirect chains delay page load times and dilute ranking signals during site migrations:"
        cases={[
          {
            badge: "Multi-Hop Chains",
            scenario: "Accidental 4-Hop Redirect Chains",
            problem:
              "Visiting http://example.com/blog/ redirects to http://www.example.com/blog/ -> https://www.example.com/blog/ -> https://example.com/blog, adding hundreds of milliseconds of TTFB latency.",
            solution:
              "Consolidate edge rules into a single redirect that immediately points directly to the canonical HTTPS apex/www URL.",
          },
          {
            badge: "PageRank Loss",
            scenario: "302 Temporary vs 301 Permanent Redirects",
            problem:
              "Using 302 or JavaScript/meta refresh redirects during permanent domain or URL migrations prevents search engines from transferring historical ranking equity.",
            solution:
              "Always use server-level 301 (Moved Permanently) or 308 (Permanent Redirect) status codes for permanent content relocation.",
          },
          {
            badge: "Infinite Loops",
            scenario: "Redirect Loops on Trailing Slashes",
            problem:
              "Conflicting rules between CDN edges (stripping trailing slash) and application origin servers (enforcing trailing slash) generate 301 redirect loops (ERR_TOO_MANY_REDIRECTS).",
            solution:
              "Align trailing slash configuration between CDN (Cloudflare/CloudFront) and your backend framework.",
          },
        ]}
      />

      <ToolProse title="How to Configure Single-Hop 301 Redirects">
        <p>
          Configure redirects at the edge or server level to ensure maximum crawl efficiency:
        </p>

        <ToolCodeBlock
          title="Nginx Single-Hop HTTPS & Apex Canonicalization"
          language="nginx"
          code={`# Force HTTP to HTTPS and non-www in a single hop
server {
    listen 80;
    listen 443 ssl;
    server_name www.example.com;
    return 301 https://example.com$request_uri;
}`}
        />

        <ToolCodeBlock
          title="Next.js (next.config.ts) Permanent Redirects"
          language="typescript"
          description="Enforce clean permanent redirects in Next.js configuration:"
          code={`import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/old-seo-guide',
        destination: '/tools/meta-tag-checker',
        permanent: true, // Emits 308 Permanent Redirect
      },
    ];
  },
};

export default nextConfig;`}
        />
      </ToolProse>

      <ToolGuideCard
        href="/blog/robots-txt-vs-noindex-vs-canonical"
        title="Robots.txt vs Noindex vs Canonical & Redirects"
        description="Learn how search engines process redirect chains alongside canonical tags and robots indexing directives."
        cta="Read full guide"
      />

      <ToolFaqSection faqs={faqs} />

      <ToolRelated
        hint="After the hop chain, confirm the landing URL is the one you want indexed."
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
