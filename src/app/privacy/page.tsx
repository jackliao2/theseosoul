import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ContentEyebrow, ContentPage } from "@/components/layout/content-page";
import { SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/audit/types";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles submitted URLs, public website data, shareable audit reports, browser storage, and service logs.`,
  alternates: { canonical: "/privacy" },
};

const contents = [
  ["overview", "Overview"],
  ["data-flow", "Audit data flow"],
  ["reports", "Public reports"],
  ["browser", "Browser storage"],
  ["logs", "Service logs"],
  ["cookies", "Cookies & analytics"],
  ["providers", "Service providers"],
  ["retention", "Retention"],
  ["choices", "Your choices"],
  ["changes", "Policy changes"],
  ["contact", "Contact"],
] as const;

const dataRows = [
  {
    data: "Submitted URL or domain",
    purpose: "Start the requested audit and build its report URL.",
    visibility: "Appears in the shareable report.",
  },
  {
    data: "Public page HTML",
    purpose: "Read titles, headings, links, images, schema, and GEO signals.",
    visibility: "Summarized as findings; not republished as full HTML.",
  },
  {
    data: "Public technical signals",
    purpose: "Check redirects, robots.txt, sitemap, DNS, TLS, and RDAP.",
    visibility: "Selected results appear in the report.",
  },
  {
    data: "Request metadata",
    purpose: "Operate rate limits, security, troubleshooting, and reliability.",
    visibility: "Not displayed in public reports.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <ContentPage className="max-w-6xl">
      <header className="border-b border-slate-300/70 pb-10 dark:border-slate-700">
        <ContentEyebrow>Legal · Privacy Policy</ContentEyebrow>
        <div className="mt-3 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <h1 className="max-w-3xl font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
              What happens when you paste a URL.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {SITE_NAME} audits publicly reachable websites without requiring
              an account. This policy describes the data needed to run those
              checks and publish a shareable report.
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            Updated July 31, 2026 · v1.0
          </p>
        </div>

        <ol className="mt-8 grid overflow-hidden rounded-2xl border border-slate-300/70 bg-[color:var(--surface)]/60 sm:grid-cols-3 dark:border-slate-700">
          {[
            {
              n: "01",
              title: "You submit a URL",
              body: "No account, name, or email required.",
            },
            {
              n: "02",
              title: "We inspect public signals",
              body: "Page HTML, crawl files, DNS, TLS, and RDAP.",
            },
            {
              n: "03",
              title: "A report is published",
              body: "Shareable by URL; usually marked noindex.",
            },
          ].map((step) => (
            <li
              key={step.n}
              className="relative border-b border-slate-300/70 p-4 last:border-0 sm:border-b-0 sm:border-r sm:last:border-r-0 dark:border-slate-700"
            >
              <span className="font-mono text-[10px] font-semibold text-teal-800 dark:text-teal-300">
                {step.n}
              </span>
              <h2 className="mt-2 font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">
                {step.title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </header>

      <div className="mt-10 grid gap-10 md:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16">
        <aside className="hidden md:block">
          <nav
            aria-label="Privacy policy sections"
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
          <PrivacySection number="01" id="overview" title="Privacy at a glance">
            <div className="grid gap-2 sm:grid-cols-2">
              <PolicyFact label="Accounts" value="Not required for free audits" />
              <PolicyFact label="Personal data sales" value="We do not sell it" />
              <PolicyFact label="Advertising" value="Not currently embedded" />
              <PolicyFact
                label="Report indexing"
                value="Most reports are noindex"
              />
            </div>
            <p>
              We process enough information to deliver the audit, prevent abuse,
              and keep the service reliable. We do not ask for a profile,
              billing details, or access to Search Console for the current free
              product.
            </p>
          </PrivacySection>

          <PrivacySection
            number="02"
            id="data-flow"
            title="Data used for an audit"
          >
            <p>
              A submitted domain tells our servers what to fetch. Checks are
              limited to publicly reachable pages and public infrastructure
              records; we do not sign in to the target website.
            </p>

            <div className="overflow-hidden rounded-xl border border-slate-300/70 dark:border-slate-700">
              <div className="hidden grid-cols-[1fr_1.35fr_1.15fr] gap-4 bg-slate-100/70 px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-slate-500 sm:grid dark:bg-slate-900/70">
                <span>Data</span>
                <span>Why we use it</span>
                <span>Report visibility</span>
              </div>
              <dl className="divide-y divide-slate-300/60 dark:divide-slate-700">
                {dataRows.map((row) => (
                  <div
                    key={row.data}
                    className="grid gap-2 px-3 py-3 text-sm sm:grid-cols-[1fr_1.35fr_1.15fr] sm:gap-4"
                  >
                    <dt className="font-semibold text-slate-900 dark:text-white">
                      {row.data}
                    </dt>
                    <dd className="text-slate-600 dark:text-slate-300">
                      {row.purpose}
                    </dd>
                    <dd className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {row.visibility}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </PrivacySection>

          <PrivacySection
            number="03"
            id="reports"
            title="Shareable reports are public by design"
          >
            <p>
              Audit results are published at predictable{" "}
              <code className="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-[12px] text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                /audit/[domain]
              </code>{" "}
              URLs. Anyone with the link can open the report. Treat it as public
              and do not submit a domain if you do not want its publicly
              observable technical signals summarized this way.
            </p>
            <p>
              A shareable URL is not the same as broad search distribution.
              Newly generated and random reports default to{" "}
              <code className="font-mono text-[12px]">noindex,follow</code>, and
              our sitemap includes only a small curated set of example domains.
              Search engines and third parties ultimately control their own
              crawling and caches.
            </p>
          </PrivacySection>

          <PrivacySection
            number="04"
            id="browser"
            title="Data kept in your browser"
          >
            <p>
              The “Recent audits” convenience list is stored in your browser
              using local storage. It helps you return to domains you checked
              without creating an account. This list stays on that browser and
              can be removed with the Clear action or by clearing site data in
              your browser settings.
            </p>
            <p>
              Theme preference may also be stored locally so dark or light mode
              persists between visits.
            </p>
          </PrivacySection>

          <PrivacySection
            number="05"
            id="logs"
            title="Operational logs and abuse prevention"
          >
            <p>
              Like most hosted web services, our infrastructure may record IP
              address, user agent, timestamps, requested paths, submitted
              domains, response codes, and diagnostic errors. We use these
              records to apply rate limits, investigate failures, prevent abuse,
              and maintain security.
            </p>
            <p>
              Do not place passwords, API keys, personal messages, or other
              secrets in a URL submitted for audit. URLs can be included in
              request logs and the resulting report.
            </p>
          </PrivacySection>

          <PrivacySection
            number="06"
            id="cookies"
            title="Cookies, analytics, and advertising"
          >
            <p>
              The current free product does not embed third-party advertising
              and does not sell personal information. We may use technically
              necessary storage for product behavior and security.
            </p>
            <p>
              If we add audience analytics, accounts, advertising, or paid
              features that materially change this data use, this policy will
              be updated before those practices are described as current.
            </p>
          </PrivacySection>

          <PrivacySection
            number="07"
            id="providers"
            title="Infrastructure and public-data providers"
          >
            <p>
              Hosting, networking, DNS resolution, certificate inspection, and
              public RDAP services help us deliver an audit. Those providers may
              process request metadata under their own privacy terms and
              security practices. We disclose only what is reasonably needed to
              make the requested check operate.
            </p>
            <p>
              Fetching a target website also reveals our server request to that
              website and its hosting or security providers, just as any web
              crawler request would.
            </p>
          </PrivacySection>

          <PrivacySection number="08" id="retention" title="How long data stays">
            <p>
              Audit results may be cached to make repeated checks faster and
              protect free upstream services. Shareable report routes can
              continue to regenerate a current public-data snapshot when
              visited.
            </p>
            <p>
              Operational logs are kept only as long as reasonably needed for
              security, abuse prevention, debugging, and infrastructure
              requirements. Backups and provider logs may expire on separate
              schedules.
            </p>
          </PrivacySection>

          <PrivacySection
            number="09"
            id="choices"
            title="Your choices and requests"
          >
            <ul>
              <li>Do not submit a URL you do not want summarized.</li>
              <li>Clear recent audits from the homepage or browser storage.</li>
              <li>
                Use your site’s robots.txt and access controls to express
                crawler policy.
              </li>
              <li>
                Contact us about a report, log, correction, or deletion request.
              </li>
            </ul>
            <p>
              For a request involving a domain report, include its full URL and
              be prepared to demonstrate reasonable control of the domain.
              Legal privacy rights vary by location; we will assess applicable
              requests based on the information involved.
            </p>
          </PrivacySection>

          <PrivacySection number="10" id="changes" title="Policy changes">
            <p>
              This page will change as the product evolves. The date and version
              at the top identify the current policy. Material changes will be
              reflected here, especially before introducing accounts, payments,
              or materially different tracking.
            </p>
          </PrivacySection>

          <PrivacySection number="11" id="contact" title="Privacy contact">
            <p>
              Email{" "}
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="font-semibold text-teal-800 underline decoration-teal-700/30 underline-offset-2 dark:text-teal-300"
              >
                {SITE_EMAIL}
              </a>{" "}
              with privacy questions or requests. Include the report URL or
              domain when relevant, but do not send passwords or identity
              documents unless we specifically request a safe verification
              method.
            </p>
          </PrivacySection>

          <footer className="mt-12 flex flex-col gap-4 rounded-2xl border border-slate-300/70 bg-[color:var(--surface)]/65 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
            <div>
              <p className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Rules for using the service
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Read the terms for audits, reports, and acceptable use.
              </p>
            </div>
            <Link
              href="/terms"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-teal-800 hover:text-teal-700 dark:text-teal-300 dark:hover:text-teal-200"
            >
              Read Terms of Use
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </footer>

          <p className="mt-8 text-xs text-slate-400">
            {SITE_NAME} · {SITE_URL}
          </p>
        </article>
      </div>
    </ContentPage>
  );
}

function PrivacySection({
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

function PolicyFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-300/70 bg-[color:var(--surface)]/55 px-3 py-3 dark:border-slate-700">
      <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
