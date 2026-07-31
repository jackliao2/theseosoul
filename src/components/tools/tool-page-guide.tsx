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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className="group flex h-full flex-col justify-between rounded-xl border border-slate-300/60 px-3.5 py-3 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-teal-700/35 hover:bg-teal-800/[0.04] dark:border-slate-700 dark:hover:border-teal-400/30 dark:hover:bg-teal-400/[0.05]"
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="font-display text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    {title}
                  </span>
                  <span
                    aria-hidden
                    className="mt-0.5 text-sm text-teal-800/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-teal-800 dark:text-teal-300/40 dark:group-hover:text-teal-300"
                  >
                    ↗
                  </span>
                </span>
                {short ? (
                  <span className="mt-1 text-xs leading-snug text-slate-500 dark:text-slate-400">
                    {short}
                  </span>
                ) : null}
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
