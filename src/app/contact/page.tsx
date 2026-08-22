import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import {
  ContentEyebrow,
  ContentLead,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";
import { SiteWordmark } from "@/components/brand/site-mark";
import { SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/audit/types";
import { createSocialMetadata } from "@/lib/social-metadata";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${SITE_NAME} at ${SITE_EMAIL} for product questions, privacy requests, report corrections, or partnership inquiries.`,
  alternates: { canonical: "/contact" },
  ...createSocialMetadata({
    url: "/contact",
    title: `Contact ${SITE_NAME}`,
    description: `Email ${SITE_NAME} about product feedback, audit reports, privacy requests, corrections, partnerships, or press.`,
  }),
};

const topics = [
  {
    title: "Product feedback",
    body: "Missing checks, confusing scores, or ideas for the free tools hub — we read these carefully.",
  },
  {
    title: "Partnerships & press",
    body: "Agency workflows, guest posts, or coverage of shareable technical SEO reports.",
  },
  {
    title: "Abuse & rate limits",
    body: "If something looks automated against your site from our crawler, tell us with the target URL.",
  },
  {
    title: "Privacy requests",
    body: "Questions about logs, cookies, or deletion related to audit history — see Privacy for detail.",
  },
];

export default function ContactPage() {
  return (
    <ContentPage>
      <ContentEyebrow>Contact</ContentEyebrow>
      <ContentTitle>Get in touch</ContentTitle>
      <ContentLead>
        Questions about <SiteWordmark size="sm" className="align-baseline" />{" "}
        audits, partnerships, or privacy — email us. We aim to reply within a
        few business days.
      </ContentLead>

      <div className="mt-10 rounded-xl border border-slate-300/70 bg-[color:var(--surface)] px-5 py-6 dark:border-slate-800">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Email
        </p>
        <a
          href={`mailto:${SITE_EMAIL}?subject=${encodeURIComponent("TheSeoSoul inquiry")}`}
          className="mt-2 inline-flex items-center gap-2.5 font-display text-2xl font-bold text-teal-800 hover:underline dark:text-teal-400 sm:text-3xl"
        >
          <Mail className="h-6 w-6 shrink-0" />
          {SITE_EMAIL}
        </a>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-500">
          Include the domain you audited when relevant — it helps us reproduce
          the report.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          What to write about
        </h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2">
          {topics.map((t) => (
            <li key={t.title}>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                {t.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {t.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <dl className="mt-12 grid gap-6 border-t border-slate-300/70 pt-10 text-sm dark:border-slate-800 sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-slate-900 dark:text-white">Site</dt>
          <dd className="mt-1 text-slate-600 dark:text-slate-400">
            <a
              href={SITE_URL}
              className="text-teal-800 hover:underline dark:text-teal-400"
            >
              {SITE_URL}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900 dark:text-white">
            Response time
          </dt>
          <dd className="mt-1 text-slate-600 dark:text-slate-400">
            Usually within a few business days. Urgent abuse reports get priority.
          </dd>
        </div>
      </dl>

      <div className="mt-10 flex flex-wrap gap-4 text-sm font-semibold">
        <Link
          href="/about"
          className="text-teal-800 hover:underline dark:text-teal-400"
        >
          About →
        </Link>
        <Link
          href="/privacy"
          className="text-teal-800 hover:underline dark:text-teal-400"
        >
          Privacy Policy →
        </Link>
        <Link
          href="/terms"
          className="text-teal-800 hover:underline dark:text-teal-400"
        >
          Terms of Use →
        </Link>
      </div>
    </ContentPage>
  );
}
