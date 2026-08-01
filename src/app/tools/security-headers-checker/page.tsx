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
  ToolFaqJsonLd,
  ToolFaqSection,
  ToolHowItWorks,
  ToolProse,
  ToolRelated,
} from "@/components/tools/tool-page-guide";
import { SITE_NAME, SITE_URL } from "@/lib/audit/types";

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
  openGraph: {
    title: "Free Security Headers Checker",
    description:
      "Check HSTS, CSP, framing, and related HTTP security headers — free.",
    url: PAGE_PATH,
    type: "website",
  },
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
        title="What we check"
        items={[
          "Strict-Transport-Security (HSTS)",
          "Content-Security-Policy",
          "X-Content-Type-Options",
          "X-Frame-Options",
          "Referrer-Policy",
          "Permissions-Policy / COOP / CORP when present",
        ]}
      />

      <ToolProse title="When to use this checker">
        <p>
          Use it after enabling HTTPS, migrating hosts, or tightening a CDN.
          Pair with the{" "}
          <Link
            href="/tools/ssl-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            SSL days checker
          </Link>{" "}
          so certificates do not expire silently, and a{" "}
          <Link
            href="/#home-audit-url"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            full audit
          </Link>{" "}
          for crawl and on-page issues.
        </p>
      </ToolProse>

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
