import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ContentEyebrow, ContentPage } from "@/components/layout/content-page";
import { SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/audit/types";
import { createSocialMetadata } from "@/lib/social-metadata";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms governing use of ${SITE_NAME}'s free SEO audits, tools, and shareable reports.`,
  alternates: { canonical: "/terms" },
  ...createSocialMetadata({
    url: "/terms",
    title: `${SITE_NAME} Terms of Use`,
    description: `Rules for using ${SITE_NAME}'s free SEO audits, tools, public-web checks, and shareable reports.`,
  }),
};

const contents = [
  ["agreement", "Agreement"],
  ["service", "The service"],
  ["acceptable-use", "Acceptable use"],
  ["reports", "Shareable reports"],
  ["accuracy", "Accuracy & third parties"],
  ["availability", "Availability"],
  ["ownership", "Ownership"],
  ["disclaimers", "Disclaimers"],
  ["liability", "Liability"],
  ["changes", "Changes & termination"],
  ["contact", "Contact"],
] as const;

export default function TermsPage() {
  return (
    <ContentPage className="max-w-6xl">
      <header className="grid gap-8 border-b border-slate-300/70 pb-10 md:grid-cols-[minmax(0,1fr)_20rem] md:items-end dark:border-slate-700">
        <div>
          <ContentEyebrow>Legal · Terms of Use</ContentEyebrow>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
            Clear rules for a public-web audit tool.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
            These terms explain what {SITE_NAME} does, what we ask of people
            using it, and the limits of an automated technical SEO report.
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            Effective July 31, 2026 · Version 1.0
          </p>
        </div>

        <aside className="rounded-2xl border border-slate-300/70 bg-[color:var(--surface)]/65 p-5 dark:border-slate-700">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-800 dark:text-teal-300">
            The short version
          </p>
          <ul className="mt-3 space-y-3 text-sm leading-snug text-slate-600 dark:text-slate-300">
            <li className="border-l-2 border-teal-700/35 pl-3 dark:border-teal-300/35">
              Audit public pages you own or are allowed to inspect.
            </li>
            <li className="border-l-2 border-teal-700/35 pl-3 dark:border-teal-300/35">
              Reports are informational, automated, and may be incomplete.
            </li>
            <li className="border-l-2 border-teal-700/35 pl-3 dark:border-teal-300/35">
              Report URLs are designed to be shared with clients and teammates.
            </li>
          </ul>
        </aside>
      </header>

      <div className="mt-10 grid gap-10 md:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16">
        <aside className="hidden md:block">
          <nav
            aria-label="Terms sections"
            className="sticky top-24 border-l border-slate-300/70 pl-4 dark:border-slate-700"
          >
            <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              On this page
            </p>
            <ol className="space-y-2">
              {contents.map(([id, label], index) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="group flex gap-2 text-xs text-slate-500 transition-colors hover:text-teal-800 dark:text-slate-400 dark:hover:text-teal-300"
                  >
                    <span className="font-mono text-[9px] text-slate-300 group-hover:text-teal-700 dark:text-slate-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="min-w-0 max-w-3xl">
          <TermsSection number="01" id="agreement" title="Agreement">
            <p>
              By accessing {SITE_NAME} at{" "}
              <a
                href={SITE_URL}
                className="font-medium text-teal-800 underline decoration-teal-700/30 underline-offset-2 dark:text-teal-300"
              >
                {SITE_URL}
              </a>{" "}
              or using any audit or checker, you agree to these Terms of Use and
              our{" "}
              <Link
                href="/privacy"
                className="font-medium text-teal-800 underline decoration-teal-700/30 underline-offset-2 dark:text-teal-300"
              >
                Privacy Policy
              </Link>
              . If you are using the service for an organization, you confirm
              that you can accept these terms on its behalf.
            </p>
          </TermsSection>

          <TermsSection number="02" id="service" title="What the service does">
            <p>
              {SITE_NAME} provides free technical SEO and GEO checks. When a URL
              is submitted, our servers may fetch the public page, follow
              redirects, and inspect related public resources such as
              robots.txt, sitemap.xml, DNS records, TLS certificate metadata,
              and RDAP registration data.
            </p>
            <p>
              The result is an automated snapshot of signals available at the
              time of the request. A free audit is not a full-site crawl,
              penetration test, accessibility certification, legal review, or
              guarantee of search performance.
            </p>
          </TermsSection>

          <TermsSection
            number="03"
            id="acceptable-use"
            title="Use the crawler responsibly"
          >
            <p>
              Submit websites you own, manage, or are authorized to inspect.
              Normal checks make a limited number of HTTP and public-data
              requests. You must not use the service to:
            </p>
            <ul>
              <li>overload, disrupt, or probe a third-party system;</li>
              <li>bypass authentication, access controls, or rate limits;</li>
              <li>collect private data or test non-public endpoints;</li>
              <li>automate requests at a volume that harms the service; or</li>
              <li>use report URLs for spam, deception, or unlawful activity.</li>
            </ul>
            <p>
              We may throttle, block, or remove access when traffic appears
              abusive or threatens service reliability.
            </p>
          </TermsSection>

          <TermsSection
            number="04"
            id="reports"
            title="Shareable audit reports"
          >
            <p>
              Audit results use predictable{" "}
              <code className="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-[12px] text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                /audit/[host/path]
              </code>{" "}
              URLs so they can be sent to clients, colleagues, and developers.
              Do not submit a domain if you do not want its publicly observable
              technical signals summarized on a shareable page.
            </p>
            <p>
              Most newly generated reports are marked{" "}
              <code className="font-mono text-[12px]">noindex,follow</code>.
              Only a small curated set of examples may be included in our
              sitemap. To ask about a report associated with your domain, email
              us from an address that can reasonably demonstrate control of
              that domain.
            </p>
          </TermsSection>

          <TermsSection
            number="05"
            id="accuracy"
            title="Accuracy and third-party data"
          >
            <p>
              Websites change, networks fail, bot protection behaves
              differently by requester, and public registries can return
              incomplete data. Scores and findings may therefore be stale,
              partial, or wrong. Re-run important checks and verify material
              decisions against source code, Search Console, hosting logs, and
              qualified professional advice.
            </p>
            <p>
              Links and data returned by third-party websites, DNS providers,
              certificate authorities, and registries remain under their own
              terms and control. We do not endorse or control those services.
            </p>
          </TermsSection>

          <TermsSection
            number="06"
            id="availability"
            title="Availability, caching, and limits"
          >
            <p>
              The free service is provided without an uptime commitment.
              Results may be cached, upstream checks may be skipped after a
              timeout, and request limits may change to protect the product and
              the websites being checked. We may modify, pause, or discontinue
              a checker without notice.
            </p>
          </TermsSection>

          <TermsSection number="07" id="ownership" title="Ownership">
            <p>
              {SITE_NAME}, its interface, scoring logic, explanatory copy, and
              original software are owned by us or our licensors. You may share
              report links and use report findings for your own work. These
              terms do not give you permission to copy the product, resell the
              service as your own, remove branding, or reproduce it at scale.
            </p>
            <p>
              You retain any rights you already hold in a URL or website you
              submit. Submitting a URL does not transfer ownership of that
              website or its content to {SITE_NAME}.
            </p>
          </TermsSection>

          <TermsSection number="08" id="disclaimers" title="No warranties">
            <p>
              The service is provided “as is” and “as available.” To the fullest
              extent permitted by applicable law, we disclaim warranties of
              accuracy, completeness, merchantability, fitness for a particular
              purpose, non-infringement, and uninterrupted availability.
            </p>
            <p>
              An audit score is not a promise of rankings, traffic, revenue,
              compliance, accessibility, or security.
            </p>
          </TermsSection>

          <TermsSection number="09" id="liability" title="Limit of liability">
            <p>
              To the fullest extent permitted by law, {SITE_NAME} and its
              contributors will not be liable for indirect, incidental,
              special, consequential, or punitive damages; lost profits, data,
              rankings, or business opportunities; or decisions made in
              reliance on an automated report.
            </p>
            <p>
              Where liability cannot be excluded, our aggregate liability
              arising from the free service will not exceed the amount you paid
              us for that service during the preceding twelve months—which is
              ordinarily zero.
            </p>
          </TermsSection>

          <TermsSection
            number="10"
            id="changes"
            title="Changes and termination"
          >
            <p>
              We may revise these terms as the product changes, including if
              accounts or paid features are introduced. The effective date and
              version at the top of this page identify the current terms.
              Continued use after an update means you accept the revised terms.
            </p>
            <p>
              You may stop using the service at any time. We may suspend access
              for violations of these terms, abuse, security risk, or legal
              requirements.
            </p>
          </TermsSection>

          <TermsSection number="11" id="contact" title="Questions or requests">
            <p>
              For terms questions, domain-report concerns, or legal notices,
              email{" "}
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="font-semibold text-teal-800 underline decoration-teal-700/30 underline-offset-2 dark:text-teal-300"
              >
                {SITE_EMAIL}
              </a>
              . Please include the relevant report URL when your request relates
              to an audit.
            </p>
          </TermsSection>

          <footer className="mt-12 flex flex-col gap-4 rounded-2xl bg-[#0b1220] p-5 text-slate-200 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-bold text-white">
                Looking for the data policy?
              </p>
              <p className="mt-1 text-sm text-slate-400">
                See what an audit fetches, stores, and publishes.
              </p>
            </div>
            <Link
              href="/privacy"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-teal-300 hover:text-teal-200"
            >
              Read Privacy Policy
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </footer>
        </article>
      </div>
    </ContentPage>
  );
}

function TermsSection({
  number,
  id,
  title,
  children,
}: {
  number: string;
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-b border-slate-300/70 py-8 first:pt-0 dark:border-slate-700"
    >
      <div className="grid gap-3 sm:grid-cols-[2.5rem_minmax(0,1fr)]">
        <span className="pt-1 font-mono text-[11px] font-semibold text-teal-800 dark:text-teal-300">
          {number}
        </span>
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h2>
          <div className="mt-3 space-y-4 text-[15px] leading-7 text-slate-600 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1.5 dark:text-slate-300">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
