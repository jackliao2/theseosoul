import type { Metadata } from "next";
import Link from "next/link";
import { CanonicalCheckerForm } from "@/components/tools/canonical-checker-form";
import {
  ContentEyebrow,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";

export const metadata: Metadata = {
  title: "Free Canonical Tag Checker",
  description:
    "Free canonical tag checker — see if a page has a canonical URL, whether it is self-referencing, and if it points to another host. No signup.",
  alternates: { canonical: "/tools/canonical-checker" },
  keywords: [
    "canonical tag checker",
    "canonical link checker",
    "check canonical url",
    "canonical url checker",
  ],
};

export default function CanonicalCheckerPage() {
  return (
    <ContentPage>
      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        On-page
      </ContentEyebrow>
      <ContentTitle>Canonical Tag Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Fetch a live URL and inspect{" "}
        <code className="text-[13px]">&lt;link rel=&quot;canonical&quot;&gt;</code>{" "}
        — present or missing, self-referencing, or pointing elsewhere.
      </p>

      <div className="mt-10">
        <CanonicalCheckerForm />
      </div>

      <section className="mt-14 space-y-3 border-t border-slate-300/70 pt-10 text-sm leading-relaxed text-slate-600 dark:border-slate-700 dark:text-slate-300">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
          Why canonicals matter
        </h2>
        <p>
          A clear preferred URL reduces duplicate-content confusion across HTTP
          vs HTTPS, www vs apex, and parameter variants. Pair with the{" "}
          <Link
            href="/tools/redirect-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            Redirect Checker
          </Link>{" "}
          if the hop chain is messy.
        </p>
      </section>
    </ContentPage>
  );
}
