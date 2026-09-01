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
  title: "Free Robots.txt Checker — Test Crawl Rules Online",
  description:
    "Free robots.txt checker: fetch live crawl rules, flag site-wide blocks, find Sitemap directives, and review common AI crawler policies. No signup.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "robots txt checker",
    "robots.txt checker",
    "google robots txt checker",
    "robots txt checker online",
    "free robots.txt checker",
    "check robots.txt",
  ],
  ...createSocialMetadata({
    title: "Free Robots.txt Checker Online",
    description:
      "Fetch robots.txt, spot Disallow: /, Sitemap lines, and AI bot blocks — free, no signup.",
    url: PAGE_PATH,
  }),
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

      <ToolUseCases
        title="Critical Robots.txt Scenarios & Mistakes"
        intro="Robots.txt syntax errors can invisibly dismantle organic rankings overnight. Common scenarios include:"
        cases={[
          {
            badge: "Crawl Disasters",
            scenario: "Accidental Disallow: / in Production",
            problem:
              "Deploying a staging robots.txt with Disallow: / immediately shuts out Googlebot, wiping the domain from SERPs within days.",
            solution:
              "Always verify production robots.txt explicitly specifies Allow: / for User-agent: * and lists the canonical XML sitemap.",
          },
          {
            badge: "Rendering Issues",
            scenario: "Blocking CSS & JavaScript Assets",
            problem:
              "Disallowing /_next/static/ or /wp-content/ prevents Googlebot from rendering the DOM, failing Mobile-Friendly and Core Web Vitals audits.",
            solution:
              "Never block access to CSS, JS, fonts, or image assets required to render modern client/server applications.",
          },
          {
            badge: "AI Crawler Policy",
            scenario: "Targeted AI Scraper Blocking",
            problem:
              "You want to block automated LLM training scrapers (GPTBot, CCBot) without blocking Google Search or Bing indexation.",
            solution:
              "Target individual bot User-agents (e.g., User-agent: GPTBot Disallow: /) while keeping User-agent: * open for search engines.",
          },
        ]}
      />

      <ToolProse title="Standard Production robots.txt Templates">
        <p>
          A clean robots.txt allows search crawlers full access while keeping internal endpoints and unwanted scrapers out:
        </p>

        <ToolCodeBlock
          title="Production robots.txt Template"
          language="text"
          code={`# Allow all legitimate search engine crawlers
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

# Optional: Block LLM training crawlers
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

# Canonical XML Sitemap
Sitemap: https://example.com/sitemap.xml`}
        />

        <ToolCodeBlock
          title="Next.js App Router (app/robots.ts)"
          language="typescript"
          description="Generate your robots.txt dynamically with type safety in Next.js:"
          code={`import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: 'https://example.com/sitemap.xml',
  };
}`}
        />
      </ToolProse>

      <ToolGuideCard
        href="/blog/free-robots-txt-checker-what-matters"
        title="Turn a robots.txt result into a safe crawl decision"
        description="Learn how to test path rules by user-agent, spot the dangerous Disallow: / case, review AI crawler policy, and verify Sitemap lines without confusing crawl control with noindex."
        cta="Learn how to audit robots.txt"
      />

      <ToolFaqSection faqs={faqs} />

      <ToolRelated
        hint="robots.txt only controls crawl access — check indexing and preferred URLs next."
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
