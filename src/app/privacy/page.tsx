import type { Metadata } from "next";
import Link from "next/link";
import {
  ContentEyebrow,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";
import { SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/audit/types";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE_NAME}. Contact ${SITE_EMAIL}.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <ContentPage>
      <ContentEyebrow>Legal</ContentEyebrow>
      <ContentTitle>Privacy Policy</ContentTitle>
      <p className="mt-2 text-sm text-slate-500">Last updated: July 31, 2026</p>

      <div className="mt-10 space-y-10 text-base leading-relaxed text-slate-600 dark:text-slate-400">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Who we are
          </h2>
          <p>
            {SITE_NAME} ({SITE_URL}) provides free technical SEO audit reports
            and related free tools. Contact:{" "}
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="font-medium text-teal-800 hover:underline dark:text-teal-400"
            >
              {SITE_EMAIL}
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            What we process
          </h2>
          <p>
            When you submit a URL, we fetch that public page and related public
            resources (for example robots.txt, sitemap.xml, DNS, TLS certificate
            metadata, and RDAP/WHOIS) from our servers to generate the report.
            Free audits do not require an account.
          </p>
          <p>
            Server logs may include IP address, user agent, timestamps, and the
            requested audit URL for rate-limiting, abuse prevention, and
            reliability.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Reports & search engines
          </h2>
          <p>
            Audit reports are shareable URLs so you can send them to clients or
            teammates. Most report pages are not submitted for broad search
            indexing; only a small curated set of example reports is listed in
            our sitemap.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Cookies & analytics
          </h2>
          <p>
            We may use essential storage (for example recent audits in your
            browser) to improve the product. We do not currently embed
            third-party advertising or sell personal data. If analytics are
            added later, this policy will be updated.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Your requests
          </h2>
          <p>
            For privacy questions or deletion requests related to logs or stored
            domain history, email{" "}
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="font-medium text-teal-800 hover:underline dark:text-teal-400"
            >
              {SITE_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-12 flex flex-wrap gap-4 border-t border-slate-300/70 pt-8 text-sm font-semibold dark:border-slate-800">
        <Link
          href="/terms"
          className="text-teal-800 hover:underline dark:text-teal-400"
        >
          Terms of Use →
        </Link>
        <Link
          href="/contact"
          className="text-teal-800 hover:underline dark:text-teal-400"
        >
          Contact →
        </Link>
      </div>
    </ContentPage>
  );
}
