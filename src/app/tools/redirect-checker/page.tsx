import type { Metadata } from "next";
import Link from "next/link";
import { RedirectCheckerForm } from "@/components/tools/redirect-checker-form";
import {
  ContentEyebrow,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";

export const metadata: Metadata = {
  title: "Free Redirect Checker",
  description:
    "Trace HTTP redirect chains for any public URL — see each hop, status code, and final destination. Free, no signup.",
  alternates: { canonical: "/tools/redirect-checker" },
};

export default function RedirectCheckerPage() {
  return (
    <ContentPage>
      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        Technical
      </ContentEyebrow>
      <ContentTitle>Redirect Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Follow the hop chain from a start URL to the final landing page. Spot
        HTTP→HTTPS, www flips, and chains that waste crawl budget — no signup.
      </p>

      <div className="mt-10">
        <RedirectCheckerForm />
      </div>

      <section className="mt-14 space-y-3 border-t border-slate-300/70 pt-10 text-sm leading-relaxed text-slate-600 dark:border-slate-700 dark:text-slate-300">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
          Why redirect chains matter
        </h2>
        <p>
          Search engines and AI crawlers prefer short paths to the canonical
          page. One intentional redirect (e.g. apex → www over HTTPS) is normal;
          three or more hops slow users and can dilute signals.
        </p>
      </section>
    </ContentPage>
  );
}
