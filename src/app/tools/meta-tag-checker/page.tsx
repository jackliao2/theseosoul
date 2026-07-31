import type { Metadata } from "next";
import Link from "next/link";
import { MetaTagCheckerForm } from "@/components/tools/meta-tag-checker-form";
import {
  ContentEyebrow,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";

export const metadata: Metadata = {
  title: "Free Meta Tag Checker — Title & Meta Description",
  description:
    "Free meta tag checker and SERP preview: pull title & meta description from any URL, check length bands, or simulate a Google snippet. No signup.",
  alternates: { canonical: "/tools/meta-tag-checker" },
  keywords: [
    "meta tag checker",
    "meta description checker",
    "meta title checker",
    "title and meta description checker",
    "seo title checker",
    "serp preview",
  ],
};

export default function MetaTagCheckerPage() {
  return (
    <ContentPage>
      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        On-page
      </ContentEyebrow>
      <ContentTitle>Meta Tag Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Check a live page’s title and meta description (length + status), or
        simulate a Google-style SERP snippet before you publish. Free, no
        signup.
      </p>

      <div className="mt-10">
        <MetaTagCheckerForm />
      </div>

      <section className="mt-14 space-y-3 border-t border-slate-300/70 pt-10 text-sm leading-relaxed text-slate-600 dark:border-slate-700 dark:text-slate-300">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
          Length guidelines
        </h2>
        <p>
          Common targets: title ~30–60 characters, meta description ~120–160.
          Google may rewrite snippets — this tool shows what you declared, not
          a live SERP guarantee.
        </p>
      </section>
    </ContentPage>
  );
}
