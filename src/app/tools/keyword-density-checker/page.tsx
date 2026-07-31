import type { Metadata } from "next";
import Link from "next/link";
import { DensityCheckerForm } from "@/components/tools/density-checker-form";
import {
  ContentEyebrow,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";

export const metadata: Metadata = {
  title: "Free Keyword Density Checker",
  description:
    "Free keyword density checker tool — analyze 1–3 word phrases from any URL or pasted text. Optional focus keyword. No signup.",
  alternates: { canonical: "/tools/keyword-density-checker" },
  keywords: [
    "keyword density checker",
    "keyword density checker tool",
    "keyword density tool",
    "seo keyword density",
  ],
};

export default function KeywordDensityCheckerPage() {
  return (
    <ContentPage>
      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        On-page
      </ContentEyebrow>
      <ContentTitle>Keyword Density Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        See which 1-, 2-, and 3-word phrases dominate a page — or paste a draft
        before you publish. Optional focus keyword count included. Free, no
        signup.
      </p>

      <div className="mt-10">
        <DensityCheckerForm />
      </div>

      <section className="mt-14 space-y-3 border-t border-slate-300/70 pt-10 text-sm leading-relaxed text-slate-600 dark:border-slate-700 dark:text-slate-300">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
          How to read density
        </h2>
        <p>
          Density is a diagnostic, not a ranking score. Aim for natural language:
          a clear primary topic, supportive phrases, and no stuffing. For titles,
          metas, and structure, run a{" "}
          <Link
            href="/#home-audit-url"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            full SEO checker
          </Link>
          .
        </p>
      </section>
    </ContentPage>
  );
}
