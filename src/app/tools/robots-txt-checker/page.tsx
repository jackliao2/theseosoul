import type { Metadata } from "next";
import Link from "next/link";
import { RobotsCheckerForm } from "@/components/tools/robots-checker-form";
import {
  ContentEyebrow,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";

export const metadata: Metadata = {
  title: "Free Robots.txt Checker — robots txt checker online",
  description:
    "Free robots txt checker: fetch any domain’s robots.txt, see crawl-all rules, Sitemap directives, and AI crawler blocks (GPTBot, ClaudeBot, and more). No signup.",
  alternates: { canonical: "/tools/robots-txt-checker" },
  keywords: [
    "robots txt checker",
    "robots.txt checker",
    "google robots txt checker",
    "robots txt checker online",
  ],
};

export default function RobotsTxtCheckerPage() {
  return (
    <ContentPage>
      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        Technical
      </ContentEyebrow>
      <ContentTitle>robots.txt Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        See whether a site publishes robots.txt, blocks all crawlers, lists
        sitemaps, and how common AI bots are treated — no signup.
      </p>

      <div className="mt-10">
        <RobotsCheckerForm />
      </div>

      <section className="mt-14 space-y-3 border-t border-slate-300/70 pt-10 text-sm leading-relaxed text-slate-600 dark:border-slate-700 dark:text-slate-300">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
          robots.txt vs noindex
        </h2>
        <p>
          robots.txt controls crawl access at the path level. Indexing of a
          specific URL is also controlled by meta robots / X-Robots-Tag — check
          that with the{" "}
          <Link
            href="/tools/noindex-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            Noindex Checker
          </Link>
          .
        </p>
      </section>
    </ContentPage>
  );
}
