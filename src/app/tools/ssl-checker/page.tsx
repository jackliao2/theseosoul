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
  ToolFaqJsonLd,
  ToolFaqSection,
  ToolHowItWorks,
  ToolProse,
  ToolRelated,
} from "@/components/tools/tool-page-guide";
import { SITE_NAME, SITE_URL } from "@/lib/audit/types";

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
  openGraph: {
    title: "Free SSL Days Checker",
    description:
      "Check TLS certificate days remaining, issuer, and HTTPS final URL — free.",
    url: PAGE_PATH,
    type: "website",
  },
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
        title="What we check"
        items={[
          "Certificate validity window (days remaining)",
          "Issuer organization / CN when available",
          "Whether the final URL after redirects is HTTPS",
          "Redirect hop chain for the HTTPS entry URL",
        ]}
      />

      <ToolProse title="When to use an SSL days checker">
        <p>
          Put this on a calendar before Let’s Encrypt renewals, CDN cutovers, or
          apex/www migrations. Combine with the{" "}
          <Link
            href="/tools/security-headers-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            Security Headers Checker
          </Link>{" "}
          for HSTS after HTTPS is stable.
        </p>
      </ToolProse>

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
