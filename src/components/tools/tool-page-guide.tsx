import type { ReactNode } from "react";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/audit/types";

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

export function ToolRelated({ tools }: { tools: RelatedTool[] }) {
  return (
    <section className="mt-14 border-t border-slate-300/70 pt-12 dark:border-slate-700">
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
        Related free tools
      </h2>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
        {tools.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="text-teal-800 hover:underline dark:text-teal-300"
            >
              {t.label} →
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/tools"
            className="text-teal-800 hover:underline dark:text-teal-300"
          >
            All free SEO tools →
          </Link>
        </li>
        <li>
          <Link
            href="/#home-audit-url"
            className="text-teal-800 hover:underline dark:text-teal-300"
          >
            Full website SEO checker →
          </Link>
        </li>
      </ul>
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
