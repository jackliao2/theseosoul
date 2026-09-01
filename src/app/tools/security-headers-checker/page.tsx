import type { Metadata } from "next";
import Link from "next/link";
import { SecurityHeadersForm } from "@/components/tools/security-headers-form";
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

const PAGE_PATH = "/tools/security-headers-checker";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "Which security headers matter for SEO?",
    a: "HTTPS itself is a ranking and trust baseline. Headers like HSTS, X-Content-Type-Options, and framing policies protect users; broken TLS or mixed content still hurts crawlability and conversions more than a missing CSP.",
  },
  {
    q: "Does a missing CSP tank rankings?",
    a: "Usually no — CSP is primarily a security control. Still, sites with weak TLS or mixed HTTP assets can see crawl and UX issues that indirectly hurt SEO.",
  },
  {
    q: "Do you grade CSP quality?",
    a: "This tool reports presence and the raw header value. Strength reviews (unsafe-inline, report-only, etc.) are still a human / WAF job.",
  },
  {
    q: "Is this free?",
    a: `Yes — free, no registration on ${SITE_NAME}.`,
  },
];

export const metadata: Metadata = {
  title: "Free Security Headers Checker — HSTS, CSP, XFO & More",
  description:
    "Free security headers checker: HSTS, CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and extras. Instant score — no signup.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "security headers checker",
    "hsts checker",
    "csp checker",
    "x-frame-options checker",
    "http security headers",
  ],
  ...createSocialMetadata({
    title: "Free Security Headers Checker",
    description:
      "Check HSTS, CSP, framing, and related HTTP security headers — free.",
    url: PAGE_PATH,
  }),
};

export default function SecurityHeadersCheckerPage() {
  return (
    <ContentPage>
      <ToolFaqJsonLd
        faqs={faqs}
        pageUrl={PAGE_URL}
        name="Free Security Headers Checker"
      />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        Technical
      </ContentEyebrow>
      <ContentTitle>Free Security Headers Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        See which HTTP security headers your live URL returns — HSTS, CSP,
        X-Content-Type-Options, framing, Referrer-Policy, and a few extras.
        Free, no signup, no fake “security grade” theater beyond a clear presence
        score.
      </p>

      <div className="mt-10">
        <SecurityHeadersForm />
      </div>

      <ToolHowItWorks
        steps={[
          {
            title: "Fetch the live URL",
            body: "We follow sensible redirects and read response headers from the final HTML response.",
          },
          {
            title: "Score core headers",
            body: "HSTS, X-Content-Type-Options, CSP, X-Frame-Options, Referrer-Policy, plus HTTPS, form the core score used in our full audit.",
          },
          {
            title: "Surface raw values",
            body: "Present headers show their values so you can paste them into your CDN or server config review.",
          },
        ]}
      />

      <ToolBulletSection
        title="What this security header tool validates"
        items={[
          "Strict-Transport-Security (HSTS) and preload eligibility",
          "Content-Security-Policy (CSP) framing and script controls",
          "X-Content-Type-Options: nosniff for MIME-sniffing protection",
          "X-Frame-Options / frame-ancestors to prevent UI redressing",
          "Referrer-Policy to prevent leaking confidential query parameters",
        ]}
      />

      <ToolUseCases
        title="Security Headers Architecture & Practical Scenarios"
        intro="Deploying modern security headers protects user trust and ensures strict protocol compliance across all browsers:"
        cases={[
          {
            badge: "HSTS Policy",
            scenario: "Enforcing Permanent HTTPS (HSTS)",
            problem:
              "Browsers initially requesting http:// before redirecting to https:// remain vulnerable to SSL stripping attacks on insecure networks.",
            solution:
              "Serve Strict-Transport-Security with max-age=31536000 and includeSubDomains to force browsers to always use HTTPS.",
          },
          {
            badge: "Clickjacking Defense",
            scenario: "Preventing Malicious iFrame Embedding",
            problem:
              "Third-party sites embedding your application inside hidden <iframe> layers to perform clickjacking attacks on authenticated users.",
            solution:
              "Set X-Frame-Options: DENY or Content-Security-Policy: frame-ancestors 'none'.",
          },
          {
            badge: "Referrer Privacy",
            scenario: "Preventing Query String Leakage in Outbound Clicks",
            problem:
              "Default referrer policies leaking internal URLs containing user tokens or private query strings to external domains.",
            solution:
              "Deploy Referrer-Policy: strict-origin-when-cross-origin to send full paths only within the same origin.",
          },
        ]}
      />

      <ToolProse title="Production Security Headers Implementation">
        <p>
          Configure headers in your server or edge framework:
        </p>

        <ToolCodeBlock
          title="Next.js App Router (next.config.ts) Security Headers"
          language="typescript"
          code={`import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;`}
        />

        <ToolCodeBlock
          title="Nginx Security Headers Configuration"
          language="nginx"
          description="Add to your Nginx server block:"
          code={`add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;`}
        />
      </ToolProse>

      <ToolGuideCard
        href="/blog/ssl-and-security-headers-for-seo"
        title="Prioritize HTTPS hygiene before chasing a perfect header score"
        description="Separate ranking-critical availability and TLS basics from defense-in-depth controls, then sequence HSTS, CSP, framing, and referrer policies without security-score theater."
        cta="See what matters for SEO and trust"
      />

      <ToolFaqSection faqs={faqs} />

      <ToolRelated
        hint="Headers protect the browser — these tools check crawl and TLS next."
        tools={[
          { href: "/tools/ssl-checker", label: "SSL Days Checker" },
          { href: "/tools/redirect-checker", label: "Redirect Checker" },
          { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
          { href: "/tools/sitemap-checker", label: "Sitemap Checker" },
        ]}
      />
    </ContentPage>
  );
}
