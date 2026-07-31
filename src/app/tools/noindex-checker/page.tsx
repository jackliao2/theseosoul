import type { Metadata } from "next";
import Link from "next/link";
import { NoindexCheckerForm } from "@/components/tools/noindex-checker-form";
import {
  ContentEyebrow,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";

export const metadata: Metadata = {
  title: "Free Noindex Checker",
  description:
    "Check whether a URL is marked noindex via meta robots, googlebot meta, or X-Robots-Tag. Free indexing directive checker — no signup.",
  alternates: { canonical: "/tools/noindex-checker" },
};

export default function NoindexCheckerPage() {
  return (
    <ContentPage>
      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        On-page
      </ContentEyebrow>
      <ContentTitle>Noindex Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Fetch a live URL and read meta robots, googlebot meta, and X-Robots-Tag
        to see if search engines should index the page.
      </p>

      <div className="mt-10">
        <NoindexCheckerForm />
      </div>

      <section className="mt-14 space-y-3 border-t border-slate-300/70 pt-10 text-sm leading-relaxed text-slate-600 dark:border-slate-700 dark:text-slate-300">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
          When to use this
        </h2>
        <p>
          Use after launching staging pages, thank-you URLs, or thin templates
          you meant to keep out of Google. Pair with{" "}
          <Link
            href="/tools/robots-txt-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            robots.txt Checker
          </Link>{" "}
          if crawlers never reach the page at all.
        </p>
      </section>
    </ContentPage>
  );
}
