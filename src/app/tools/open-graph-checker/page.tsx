import type { Metadata } from "next";
import Link from "next/link";
import { OpenGraphCheckerForm } from "@/components/tools/open-graph-checker-form";
import {
  ContentEyebrow,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";
import {
  ToolBulletSection,
  ToolFaqJsonLd,
  ToolFaqSection,
  ToolHowItWorks,
  ToolProse,
  ToolRelated,
} from "@/components/tools/tool-page-guide";
import { SITE_NAME, SITE_URL } from "@/lib/audit/types";

const PAGE_PATH = "/tools/open-graph-checker";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "What is an Open Graph checker?",
    a: "It fetches a live URL and reads og:* meta tags (and Twitter Card tags) so you can verify title, description, and image before sharing on social platforms.",
  },
  {
    q: "Which Open Graph tags are required?",
    a: "At minimum set og:title, og:description, and og:image (ideally around 1200×630). og:url and og:type help platforms resolve the preferred share URL and object type.",
  },
  {
    q: "Why doesn’t my share preview update after I change tags?",
    a: "Many platforms cache link previews. After fixing tags with this checker, use each network’s debugger or wait for cache refresh. Our preview shows what the HTML declares now — not a platform’s cached card.",
  },
  {
    q: "Is this Open Graph / Twitter Card checker free?",
    a: `Yes. Free on ${SITE_NAME}, no signup. For Google-style search snippets, use the Meta Tag Checker.`,
  },
];

export const metadata: Metadata = {
  title: "Free Open Graph Checker — OG Tags & Twitter Cards",
  description:
    "Free Open Graph checker: verify og:title, og:description, og:image and Twitter Cards with a live social preview. Fix share snippets before you post — no signup.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "open graph checker",
    "og:image checker",
    "facebook open graph debugger alternative",
    "twitter card checker",
    "og tag checker",
  ],
  openGraph: {
    title: "Free Open Graph Checker",
    description:
      "Validate OG and Twitter Card tags with a live share preview — free.",
    url: PAGE_PATH,
    type: "website",
  },
};

export default function OpenGraphCheckerPage() {
  return (
    <ContentPage>
      <ToolFaqJsonLd
        faqs={faqs}
        pageUrl={PAGE_URL}
        name="Free Open Graph Checker"
      />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        Social
      </ContentEyebrow>
      <ContentTitle>Free Open Graph Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Fetch a live URL and validate core Open Graph tags plus Twitter Cards.
        Preview how the link may look when shared — free og:image and social
        meta checker, no signup.
      </p>

      <div className="mt-10">
        <OpenGraphCheckerForm />
      </div>

      <ToolHowItWorks
        steps={[
          {
            title: "Enter the public URL you will share",
            body: "We fetch the HTML and extract og:* and twitter:* meta properties.",
          },
          {
            title: "Validate the essentials",
            body: "Missing title, description, or image are called out so cards do not fall back to random page text.",
          },
          {
            title: "Preview the share card",
            body: "A simple layout shows how title, description, and image work together before you post.",
          },
        ]}
      />

      <ToolBulletSection
        title="Tags this Open Graph checker looks for"
        items={[
          "og:title, og:description, og:image, og:url, og:type",
          "Twitter Card fields (card, title, description, image)",
          "Whether an image URL is present for rich previews",
          "Gaps that force platforms to invent a weak fallback snippet",
        ]}
      />

      <ToolProse title="Open Graph vs search meta tags">
        <p>
          Open Graph controls social shares;{" "}
          <code className="text-[13px]">&lt;title&gt;</code> and meta
          description primarily influence search snippets. Keep them aligned but
          not identical when social needs a punchier hook. Check search metas
          with the{" "}
          <Link
            href="/tools/meta-tag-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            Meta Tag Checker
          </Link>
          .
        </p>
      </ToolProse>

      <ToolFaqSection faqs={faqs} />

      <ToolRelated
        hint="Social cards should echo the search snippet and the preferred URL."
        tools={[
          { href: "/tools/meta-tag-checker", label: "Meta Tag Checker" },
          {
            href: "/tools/keyword-density-checker",
            label: "Keyword Density Checker",
          },
          { href: "/tools/canonical-checker", label: "Canonical Tag Checker" },
          { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
        ]}
      />
    </ContentPage>
  );
}
