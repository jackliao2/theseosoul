import type { Metadata } from "next";
import Link from "next/link";
import { OpenGraphCheckerForm } from "@/components/tools/open-graph-checker-form";
import {
  ContentEyebrow,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";

export const metadata: Metadata = {
  title: "Free Open Graph Checker",
  description:
    "Free Open Graph checker — verify og:title, og:description, og:image and Twitter Cards with a live social preview. No signup.",
  alternates: { canonical: "/tools/open-graph-checker" },
  keywords: [
    "open graph checker",
    "og:image checker",
    "facebook open graph debugger alternative",
    "twitter card checker",
  ],
};

export default function OpenGraphCheckerPage() {
  return (
    <ContentPage>
      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        Social
      </ContentEyebrow>
      <ContentTitle>Open Graph Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Fetch a live URL and validate core Open Graph tags plus Twitter Cards.
        Preview how the link may look when shared — free, no signup.
      </p>

      <div className="mt-10">
        <OpenGraphCheckerForm />
      </div>

      <section className="mt-14 space-y-3 border-t border-slate-300/70 pt-10 text-sm leading-relaxed text-slate-600 dark:border-slate-700 dark:text-slate-300">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
          Required tags
        </h2>
        <p>
          At minimum set <code className="text-[13px]">og:title</code>,{" "}
          <code className="text-[13px]">og:description</code>, and{" "}
          <code className="text-[13px]">og:image</code> (ideally ~1200×630).
          Pair with the{" "}
          <Link
            href="/tools/meta-tag-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            Meta Tag Checker
          </Link>{" "}
          for search snippets.
        </p>
      </section>
    </ContentPage>
  );
}
