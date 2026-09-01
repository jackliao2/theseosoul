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
  ToolCodeBlock,
  ToolFaqJsonLd,
  ToolFaqSection,
  ToolGuideCard,
  ToolHowItWorks,
  ToolProse,
  ToolRelated,
  ToolUseCases,
} from "@/components/tools/tool-page-guide";
import { SITE_NAME, SITE_URL } from "@/lib/audit/types";
import { createSocialMetadata } from "@/lib/social-metadata";

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
  ...createSocialMetadata({
    title: "Free Open Graph Checker",
    description:
      "Validate OG and Twitter Card tags with a live share preview — free.",
    url: PAGE_PATH,
  }),
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
          "Optimal 1.91:1 aspect ratio (1200x630px) for social cards",
          "Missing fallbacks that cause social networks to scrape random page images",
        ]}
      />

      <ToolUseCases
        title="Social Sharing Pitfalls & Real-World Fixes"
        intro="Rich social cards drive referral clicks and brand recognition. Here are the most common Open Graph bugs:"
        cases={[
          {
            badge: "Image Cropping",
            scenario: "Tiny Thumbnail vs Large Hero Card",
            problem:
              "Images under 300x200px or missing twitter:card summary_large_image trigger a tiny square thumbnail instead of a prominent full-width card.",
            solution:
              "Supply an og:image of exactly 1200x630px and set twitter:card to summary_large_image.",
          },
          {
            badge: "Cache Invalidation",
            scenario: "Stale Social Previews After Updates",
            problem:
              "Facebook, LinkedIn, and Discord cache OG images indefinitely. Editing your HTML doesn't update existing shared previews.",
            solution:
              "Append a version query parameter (e.g. ?v=2) to your og:image URL or use each platform's post-inspector to purge cache.",
          },
          {
            badge: "Dynamic Social Cards",
            scenario: "Headless & Dynamic Blog Sharing",
            problem:
              "Sharing blog articles with generic homepage OG banners dilutes click-through rates across social channels.",
            solution:
              "Use dynamic server-side image generation (e.g., Next.js ImageResponse) to generate custom titles and author badges per post.",
          },
        ]}
      />

      <ToolProse title="Complete Open Graph & Twitter Card Boilerplate">
        <p>
          Include standard Open Graph tags alongside Twitter Card directives in your document <code>&lt;head&gt;</code>:
        </p>

        <ToolCodeBlock
          title="HTML Open Graph & Twitter Cards Standard"
          language="html"
          code={`<head>
  <!-- Open Graph / Facebook / LinkedIn -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://example.com/article" />
  <meta property="og:title" content="How to Audit Technical SEO Like a Pro" />
  <meta property="og:description" content="Step-by-step checklist to find and fix crawl blockers, canonical loops, and index drops." />
  <meta property="og:image" content="https://example.com/images/og-banner.webp" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="How to Audit Technical SEO Like a Pro" />
  <meta name="twitter:description" content="Step-by-step checklist to find and fix crawl blockers, canonical loops, and index drops." />
  <meta name="twitter:image" content="https://example.com/images/og-banner.webp" />
</head>`}
        />

        <ToolCodeBlock
          title="Next.js App Router (opengraph-image.tsx)"
          language="typescript"
          description="Generate dynamic 1200x630 share banners natively in Next.js:"
          code={`import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0b1220', color: '#fff', padding: 60 }}>
        <h1 style={{ fontSize: 60, fontWeight: 'bold' }}>TheSeoSoul Technical Audit</h1>
      </div>
    ),
    { ...size }
  );
}`}
        />
      </ToolProse>

      <ToolGuideCard
        href="/blog/free-meta-tag-checker-titles-descriptions"
        title="Meta Tags, Social Shares & Search Engine Snippets"
        description="Understand the interplay between document title, meta descriptions, and Open Graph share previews across search and social."
        cta="Read full guide"
      />

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
