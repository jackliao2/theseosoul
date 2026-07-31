import type { Metadata } from "next";
import Link from "next/link";
import {
  ContentEyebrow,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";
import { SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/audit/types";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms of use for ${SITE_NAME}. Contact ${SITE_EMAIL}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <ContentPage>
      <ContentEyebrow>Legal</ContentEyebrow>
      <ContentTitle>Terms of Use</ContentTitle>
      <p className="mt-2 text-sm text-slate-500">Last updated: July 31, 2026</p>

      <div className="mt-10 space-y-10 text-base leading-relaxed text-slate-600 dark:text-slate-400">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Acceptance
          </h2>
          <p>
            By using {SITE_NAME} at {SITE_URL}, you agree to these terms. If you
            do not agree, do not use the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Acceptable use
          </h2>
          <p>
            Audits should target websites you own or are authorized to inspect.
            Do not use the service to harass, overload, or circumvent security
            controls on third-party sites. We may rate-limit or block abusive
            patterns.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Informational reports
          </h2>
          <p>
            Reports are generated from publicly reachable HTML and related public
            signals (such as robots.txt, DNS, TLS metadata, and RDAP). Results
            are informational and not a guarantee of rankings, compliance,
            accessibility, security, or completeness.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Service changes
          </h2>
          <p>
            The free product may change, and paid (“Pro”) features may be
            introduced later. We may update these terms; the “Last updated” date
            will change when we do.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Disclaimer & liability
          </h2>
          <p>
            The service is provided “as is” without warranties. To the extent
            permitted by law, {SITE_NAME} is not liable for damages arising from
            use of audit data or reliance on reports.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Contact
          </h2>
          <p>
            Questions about these terms:{" "}
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
          href="/privacy"
          className="text-teal-800 hover:underline dark:text-teal-400"
        >
          Privacy Policy →
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
