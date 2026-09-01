import type { Metadata } from "next";
import Link from "next/link";
import { SslCheckerForm } from "@/components/tools/ssl-checker-form";
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

const PAGE_PATH = "/tools/ssl-checker";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "What does the SSL days checker show?",
    a: "It opens a TLS connection to the hostname, reads the peer certificate, and reports days remaining, expiry time, and issuer — plus whether HTTPS redirects land on HTTPS.",
  },
  {
    q: "Why do certificate days matter for SEO?",
    a: "Expired certificates trigger browser warnings, kill trust, and can interrupt crawling. Renew before the last 21 days so automation and humans are not surprised.",
  },
  {
    q: "Does this validate the full certificate chain?",
    a: "It reads the presented leaf certificate. Deep chain / CT / pinning audits are out of scope for this free check.",
  },
  {
    q: "Is this free?",
    a: `Yes — free, no registration on ${SITE_NAME}.`,
  },
];

export const metadata: Metadata = {
  title: "Free SSL Checker — Certificate Days Remaining",
  description:
    "Free SSL/TLS checker: see certificate days remaining, expiry date, issuer, and HTTPS redirect outcome. No signup.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "ssl checker",
    "ssl certificate expiry",
    "tls days remaining",
    "https certificate checker",
    "ssl expiration checker",
  ],
  ...createSocialMetadata({
    title: "Free SSL Days Checker",
    description:
      "Check TLS certificate days remaining, issuer, and HTTPS final URL — free.",
    url: PAGE_PATH,
  }),
};

export default function SslCheckerPage() {
  return (
    <ContentPage>
      <ToolFaqJsonLd faqs={faqs} pageUrl={PAGE_URL} name="Free SSL Checker" />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        Technical
      </ContentEyebrow>
      <ContentTitle>Free SSL Days Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        See how many days remain on the site&apos;s TLS certificate, who issued
        it, and whether HTTPS redirects stay on HTTPS — free, no signup.
      </p>

      <div className="mt-10">
        <SslCheckerForm />
      </div>

      <ToolHowItWorks
        steps={[
          {
            title: "Probe TLS on port 443",
            body: "We connect with SNI for the hostname and read the presented certificate’s not-after date.",
          },
          {
            title: "Compute days remaining",
            body: "Expiry under 21 days is flagged as a warning; expired certs fail clearly.",
          },
          {
            title: "Trace HTTPS redirects",
            body: "A short redirect trace confirms the final URL still uses HTTPS after hops.",
          },
        ]}
      />

      <ToolBulletSection
        title="What this TLS / SSL certificate checker inspects"
        items={[
          "Certificate validity window and precise days remaining",
          "Certificate Authority (CA) issuer details and common names",
          "SNI hostname match to prevent certificate name mismatch errors",
          "End-to-end HTTPS enforcement across the full redirect path",
        ]}
      />

      <ToolUseCases
        title="TLS Expiry Pitfalls & HTTPS Scenarios"
        intro="An expired SSL certificate immediately drives away 90%+ of organic traffic due to full-screen browser security warnings:"
        cases={[
          {
            badge: "Certbot Failures",
            scenario: "Silent Let's Encrypt Renewal Breaks",
            problem:
              "Automated Certbot cron jobs failing silently due to HTTP-01 challenge firewall blocks, leading to 90-day certs expiring without notice.",
            solution:
              "Monitor certificate days remaining and set proactive renewal triggers when certificates drop below 30 days.",
          },
          {
            badge: "Mixed Content",
            scenario: "Passive & Active Mixed Content Warnings",
            problem:
              "Loading images or scripts via insecure http:// URLs on an https:// page triggers browser 'Not Secure' warnings and blocks asset execution.",
            solution:
              "Deploy Content-Security-Policy: upgrade-insecure-requests to auto-rewrite all asset requests to HTTPS.",
          },
          {
            badge: "Subdomain Wildcards",
            scenario: "Hostname Mismatch (SSL_ERROR_BAD_CERT_DOMAIN)",
            problem:
              "Using a single-domain certificate for deep subdomains (e.g. app.sub.example.com) that are not covered by a standard wildcard (*.example.com).",
            solution:
              "Verify SAN (Subject Alternative Names) or obtain dedicated multi-domain certificates for multi-tier architectures.",
          },
        ]}
      />

      <ToolProse title="Enforcing HTTPS & Upgrading Mixed Content">
        <p>
          Ensure all visitors and assets communicate strictly over encrypted channels:
        </p>

        <ToolCodeBlock
          title="Nginx HTTP to HTTPS 301 Redirect"
          language="nginx"
          code={`server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://example.com$request_uri;
}`}
        />

        <ToolCodeBlock
          title="CSP Automatic HTTPS Upgrade Header"
          language="text"
          description="Force browsers to upgrade all insecure HTTP image and script links automatically:"
          code={`Content-Security-Policy: upgrade-insecure-requests;`}
        />
      </ToolProse>

      <ToolGuideCard
        href="/blog/ssl-and-security-headers-for-seo"
        title="Put certificate expiry in its proper SEO context"
        description="Prioritize valid HTTPS and reliable renewals first, then understand where HSTS, CSP, mixed content, and other browser protections affect trust and technical hygiene."
        cta="Plan the HTTPS and headers checks"
      />

      <ToolFaqSection faqs={faqs} />

      <ToolRelated
        hint="TLS is table stakes — check headers and crawl discovery next."
        tools={[
          {
            href: "/tools/security-headers-checker",
            label: "Security Headers Checker",
          },
          { href: "/tools/redirect-checker", label: "Redirect Checker" },
          { href: "/tools/sitemap-checker", label: "Sitemap Checker" },
          { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
        ]}
      />
    </ContentPage>
  );
}
