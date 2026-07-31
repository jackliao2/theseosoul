import type { Metadata } from "next";
import Link from "next/link";
import { RobotsCheckerForm } from "@/components/tools/robots-checker-form";
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

const PAGE_PATH = "/tools/robots-txt-checker";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "What does a free robots.txt checker do?",
    a: "It fetches the public robots.txt for a domain (usually https://example.com/robots.txt), shows whether the file exists, and highlights high-impact rules such as Disallow: / for all user-agents, Sitemap lines, and blocks aimed at AI crawlers like GPTBot or ClaudeBot.",
  },
  {
    q: "Is robots.txt the same as noindex?",
    a: "No. robots.txt tells crawlers which paths they may fetch. Indexing of a URL is also controlled by meta robots and the X-Robots-Tag HTTP header. A page can be crawlable but still noindex — check both.",
  },
  {
    q: "Why check AI crawler rules in robots.txt?",
    a: "Many generative engines honor robots.txt for training and browsing bots. Blocking GPTBot, ClaudeBot, or similar agents is a deliberate policy choice. This checker surfaces those user-agent blocks so you can confirm what you intended to publish.",
  },
  {
    q: "Does this tool submit my site to Google?",
    a: "No. It only performs a live HTTP fetch of robots.txt from our servers and displays the result. Nothing is submitted to Search Console or any search engine.",
  },
  {
    q: "Do I need an account?",
    a: `No. ${SITE_NAME} robots txt checker is free with no registration. For a full Meta / Structure / Technical / GEO audit of the same domain, use the website SEO checker on the homepage.`,
  },
];

export const metadata: Metadata = {
  title: "Free Robots.txt Checker Online — robots txt checker",
  description:
    "Free robots txt checker online: fetch any domain’s robots.txt, see crawl-all Disallow rules, Sitemap directives, and AI crawler blocks (GPTBot, ClaudeBot, and more). No signup. Instant technical SEO check.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "robots txt checker",
    "robots.txt checker",
    "google robots txt checker",
    "robots txt checker online",
    "free robots.txt checker",
    "check robots.txt",
  ],
  openGraph: {
    title: "Free Robots.txt Checker Online",
    description:
      "Fetch robots.txt, spot Disallow: /, Sitemap lines, and AI bot blocks — free, no signup.",
    url: PAGE_PATH,
    type: "website",
  },
};

export default function RobotsTxtCheckerPage() {
  return (
    <ContentPage>
      <ToolFaqJsonLd
        faqs={faqs}
        pageUrl={PAGE_URL}
        name="Free Robots.txt Checker"
      />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        Technical
      </ContentEyebrow>
      <ContentTitle>Free Robots.txt Checker</ContentTitle>
      <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Instant online robots txt checker for any public domain. See whether the
        file exists, if crawlers are blocked site-wide, which Sitemap URLs are
        declared, and how common AI bots are treated — free, no signup.
      </p>

      <div className="mt-10">
        <RobotsCheckerForm />
      </div>

      <ToolHowItWorks
        steps={[
          {
            title: "Enter a domain or full URL",
            body: "We resolve the host and request /robots.txt over HTTPS when available (with a sensible fallback).",
          },
          {
            title: "Parse crawl rules and Sitemap lines",
            body: "The response body is scanned for User-agent groups, Disallow / Allow directives, and Sitemap: URLs.",
          },
          {
            title: "Flag high-impact and AI-bot policy",
            body: "We highlight crawl-all blocks and known generative crawler user-agents so you can verify intent at a glance.",
          },
        ]}
      />

      <ToolBulletSection
        title="What this robots.txt checker reports"
        intro="Built for technical SEO reviews and quick pre-launch checks — not a full Search Console crawl report."
        items={[
          "HTTP status and whether robots.txt was found",
          "Site-wide Disallow patterns that block all crawlers",
          "Sitemap directives listed in the file",
          "Presence of rules for popular AI crawlers (e.g. GPTBot, ClaudeBot)",
          "Raw file preview so you can audit the exact text crawlers see",
        ]}
      />

      <ToolProse title="robots.txt vs noindex (common mix-up)">
        <p>
          robots.txt controls <em>crawl access</em> at the path level. A{" "}
          <code className="text-[13px]">Disallow</code> can stop a bot from
          downloading a URL, but it is not a substitute for telling Google not
          to index a URL that was already discovered. Indexing directives live
          in meta robots and <code className="text-[13px]">X-Robots-Tag</code>.
        </p>
        <p>
          After you confirm robots.txt, run the{" "}
          <Link
            href="/tools/noindex-checker"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            Noindex Checker
          </Link>{" "}
          on key templates (staging, thank-you pages, filtered listings) and the{" "}
          <Link
            href="/#home-audit-url"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            full website SEO checker
          </Link>{" "}
          for Meta, Structure, Technical, and GEO together.
        </p>
      </ToolProse>

      <ToolProse title="When to run a robots txt checker">
        <p>
          Use this free robots.txt checker after CMS or CDN changes, before a
          migration, when organic traffic drops after a deploy, or when you
          intentionally block AI training bots and need proof the public file
          matches policy. Always keep a Sitemap line pointing at your current
          XML sitemap when you want discovery help.
        </p>
      </ToolProse>

      <ToolFaqSection faqs={faqs} />

      <ToolRelated
        tools={[
          { href: "/tools/noindex-checker", label: "Noindex Checker" },
          { href: "/tools/redirect-checker", label: "Redirect Checker" },
          { href: "/tools/canonical-checker", label: "Canonical Tag Checker" },
          { href: "/tools/meta-tag-checker", label: "Meta Tag Checker" },
        ]}
      />
    </ContentPage>
  );
}
