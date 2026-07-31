import type { Metadata } from "next";
import Link from "next/link";
import { GeoContentCheckerForm } from "@/components/tools/geo-content-checker-form";
import {
  ContentEyebrow,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";
import { SITE_NAME } from "@/lib/audit/types";

export const metadata: Metadata = {
  title: "Free GEO Content Checker",
  description:
    "Paste content and get a free GEO citation-readiness score across structure, facts, clarity, completeness, authority, and differentiation — no signup.",
  alternates: { canonical: "/tools/geo-content-checker" },
};

export default function GeoContentCheckerPage() {
  return (
    <ContentPage>
        <ContentEyebrow>
          <Link href="/tools" className="hover:underline">
            Free tools
          </Link>
          <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
          GEO
        </ContentEyebrow>
        <ContentTitle>GEO Content Checker</ContentTitle>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
          Score a draft for AI citation readiness — structure, factual density,
          clarity, completeness, authority, and differentiation. Built into{" "}
          {SITE_NAME} as a free, rule-based checker (no ChatGPT API, no signup).
        </p>

        <div className="mt-10">
          <GeoContentCheckerForm />
        </div>

        <section className="mt-14 space-y-4 border-t border-slate-200 pt-10 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-400">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            What this is (and isn’t)
          </h2>
          <p>
            This estimates whether your writing looks citation-friendly to
            generative engines. It does{" "}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">
              not
            </strong>{" "}
            query ChatGPT/Perplexity live or track brand mentions — that needs
            paid APIs. For bots, schema, llms.txt, and TLS, use the full{" "}
            <Link
              href="/#home-audit-url"
              className="font-semibold text-teal-800 hover:underline dark:text-teal-400"
            >
              technical SEO + GEO audit
            </Link>
            .
          </p>
        </section>
    </ContentPage>
  );
}
