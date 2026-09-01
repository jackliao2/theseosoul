import type { ReactNode } from "react";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/audit/types";
import { getToolByHref } from "@/lib/tools/catalog";

export type ToolFaq = { q: string; a: string };

export type RelatedTool = { href: string; label: string };

export function ToolFaqJsonLd({
  faqs,
  pageUrl,
  name,
}: {
  faqs: ToolFaq[];
  pageUrl: string;
  name: string;
}) {
  const normalized = pageUrl.replace(/\/$/, "");
  const isHub = normalized === `${SITE_URL}/tools`;
  const breadcrumbItems = isHub
    ? [
        { name: "Home", item: SITE_URL },
        { name: "Free tools", item: `${SITE_URL}/tools` },
      ]
    : [
        { name: "Home", item: SITE_URL },
        { name: "Free tools", item: `${SITE_URL}/tools` },
        { name, item: pageUrl },
      ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name,
        url: pageUrl,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbItems.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: crumb.item,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function ToolHowItWorks({
  steps,
}: {
  steps: Array<{ title: string; body: string }>;
}) {
  return (
    <section className="mt-16 border-t border-slate-300/70 pt-12 dark:border-slate-700">
      <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
        How it works
      </h2>
      <ol className="mt-6 space-y-5">
        {steps.map((s, i) => (
          <li key={s.title} className="grid gap-1 sm:grid-cols-[3rem_1fr]">
            <span className="font-mono text-sm text-teal-800 dark:text-teal-300">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                {s.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ToolBulletSection({
  title,
  intro,
  items,
}: {
  title: string;
  intro?: string;
  items: string[];
}) {
  return (
    <section className="mt-14 border-t border-slate-300/70 pt-12 dark:border-slate-700">
      <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
        {title}
      </h2>
      {intro ? (
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {intro}
        </p>
      ) : null}
      <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal-700 dark:bg-teal-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ToolFaqSection({ faqs }: { faqs: ToolFaq[] }) {
  return (
    <section className="mt-14 border-t border-slate-300/70 pt-12 dark:border-slate-700">
      <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
        Frequently asked questions
      </h2>
      <dl className="mt-6 space-y-6">
        {faqs.map((f) => (
          <div key={f.q}>
            <dt className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
              {f.q}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {f.a}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ToolGuideCard({
  href,
  title,
  description,
  cta,
}: {
  href: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <aside
      aria-label="Related practical guide"
      className="mt-14 overflow-hidden rounded-2xl border border-teal-800/20 bg-teal-950/[0.035] p-5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-6 dark:border-teal-300/20 dark:bg-teal-300/[0.045]"
    >
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800 dark:text-teal-300">
          Practical guide
        </p>
        <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {description}
        </p>
      </div>
      <Link
        href={href}
        className="group mt-5 inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 dark:bg-teal-300 dark:text-slate-950 dark:hover:bg-teal-200 dark:focus-visible:ring-teal-300 dark:focus-visible:ring-offset-slate-950 sm:mt-0"
      >
        {cta}
        <span
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5"
        >
          &rarr;
        </span>
      </Link>
    </aside>
  );
}

export function ToolRelated({
  tools,
  hint = "Same diagnosis, different angle — these usually come next.",
}: {
  tools: RelatedTool[];
  hint?: string;
}) {
  return (
    <section className="mt-14 border-t border-slate-300/70 pt-10 dark:border-slate-700">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
        Keep going
      </p>
      <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        What to check next
      </h2>
      <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {hint}
      </p>

      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {tools.map((t) => {
          const catalog = getToolByHref(t.href);
          const title = catalog?.nav ?? t.label.replace(/ Checker$/, "");
          const short = catalog?.short;
          const mark = catalog?.mark;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className="group flex h-full items-start gap-3 rounded-xl border border-slate-300/60 px-3.5 py-3 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-teal-700/35 hover:bg-teal-800/[0.04] dark:border-slate-700 dark:hover:border-teal-400/30 dark:hover:bg-teal-400/[0.05]"
              >
                {mark ? (
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#0b1220] font-mono text-xs font-bold tracking-wide text-teal-300 ring-1 ring-teal-900/30 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/25"
                  >
                    {mark}
                  </span>
                ) : null}
                <span className="min-w-0">
                  <span className="block font-display text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    {title}
                  </span>
                  {short ? (
                    <span className="mt-0.5 block text-xs leading-snug text-slate-500 dark:text-slate-400">
                      {short}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
        Need the whole picture?{" "}
        <Link
          href="/#home-audit-url"
          className="font-semibold text-slate-800 underline decoration-teal-700/40 underline-offset-2 hover:decoration-teal-700 dark:text-slate-200 dark:decoration-teal-300/40 dark:hover:decoration-teal-300"
        >
          Run a full audit
        </Link>
        {" · "}
        <Link
          href="/tools"
          className="font-semibold text-slate-800 underline decoration-teal-700/40 underline-offset-2 hover:decoration-teal-700 dark:text-slate-200 dark:decoration-teal-300/40 dark:hover:decoration-teal-300"
        >
          browse every tool
        </Link>
        .
      </p>
    </section>
  );
}

export function ToolProse({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-14 border-t border-slate-300/70 pt-12 dark:border-slate-700">
      <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
}

export function ToolCodeBlock({
  title,
  description,
  language = "html",
  code,
}: {
  title: string;
  description?: string;
  language?: string;
  code: string;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-300/80 bg-slate-950 text-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs">
        <span className="font-mono font-medium text-slate-300">{title}</span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-teal-400">
          {language}
        </span>
      </div>
      {description ? (
        <p className="border-b border-slate-800 bg-slate-900/40 px-4 py-2 text-xs text-slate-400">
          {description}
        </p>
      ) : null}
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-200">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

export type UseCaseItem = {
  badge?: string;
  scenario: string;
  problem: string;
  solution: string;
};

export function ToolUseCases({
  title = "Real-world engineering scenarios & use cases",
  intro,
  cases,
}: {
  title?: string;
  intro?: string;
  cases: UseCaseItem[];
}) {
  return (
    <section className="mt-14 border-t border-slate-300/70 pt-12 dark:border-slate-700">
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800 dark:text-teal-300">
          Scenarios
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </h2>
        {intro ? (
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {intro}
          </p>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-xl border border-slate-300/70 bg-[color:var(--surface)]/50 p-4.5 transition-colors dark:border-slate-800 dark:bg-slate-900/30"
          >
            <div>
              {c.badge ? (
                <span className="inline-block rounded bg-teal-800/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-teal-800 dark:bg-teal-400/10 dark:text-teal-300">
                  {c.badge}
                </span>
              ) : null}
              <h3 className="mt-2 font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                {c.scenario}
              </h3>
              <div className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <p>
                  <strong className="text-slate-900 dark:text-slate-200">The Problem:</strong>{" "}
                  {c.problem}
                </p>
                <p>
                  <strong className="text-teal-800 dark:text-teal-300">The Fix:</strong>{" "}
                  {c.solution}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

