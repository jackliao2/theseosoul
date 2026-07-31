import type { Metadata } from "next";
import Link from "next/link";
import { AdsenseReadinessForm } from "@/components/tools/adsense-readiness-form";
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

const PAGE_PATH = "/tools/adsense-readiness-checker";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const googleExpectations = [
  {
    title: "Site readiness",
    summary:
      "Google reviews the whole site, not one article. Pages should be finished, navigable, and useful — not stubs, placeholders, or a homepage with nowhere to go.",
    points: [
      "Publish real content visitors can browse and understand",
      "Make Privacy, About, and Contact easy to find",
      "Keep the site publicly reachable during review",
    ],
    href: "https://support.google.com/adsense/answer/7299563?hl=en",
    source: "AdSense Help — site readiness",
  },
  {
    title: "Eligibility & ownership",
    summary:
      "Approval also depends on the account and who controls the site. Public HTML cannot prove these — you still have to confirm them yourself.",
    points: [
      "Applicant meets Google’s age and country eligibility rules",
      "You own or fully control the site and can edit its HTML",
      "The account is in good standing and tasks in AdSense are complete",
    ],
    href: "https://support.google.com/adsense/answer/9724?hl=en",
    source: "AdSense Help — eligibility",
  },
  {
    title: "Privacy & ad disclosures",
    summary:
      "If you show ads, visitors need a clear privacy policy that covers cookies, advertising partners (including Google), and how to opt out of personalized ads.",
    points: [
      "A linked privacy policy page on the site",
      "Cookie / personalized advertising language",
      "Opt-out guidance (for example Ads Settings)",
    ],
    href: "https://support.google.com/adsense/answer/1348695?hl=en",
    source: "AdSense Help — privacy content",
  },
  {
    title: "Publisher policies",
    summary:
      "Content must be valuable and policy-safe. Google can reject sites for prohibited topics, scraped or thin pages, deceptive UX, or invalid traffic — even when crawl checks look fine.",
    points: [
      "Original, useful content you have rights to publish",
      "No prohibited or restricted categories without compliance",
      "No purchased, incentivized, or self-click traffic",
    ],
    href: "https://support.google.com/publisherpolicies/answer/10502938",
    source: "Google Publisher Policies",
  },
  {
    title: "AdSense crawler access",
    summary:
      "Google’s ad crawler (Mediapartners-Google) must be able to reach pages you want to monetize. A sitewide block in robots.txt is a hard stop.",
    points: [
      "Do not Disallow: / for Mediapartners-Google",
      "Avoid blocking the whole site for User-agent: *",
      "Keep monetized pages indexable unless you have a reason not to",
    ],
    href: "https://support.google.com/adsense/answer/10532?hl=en",
    source: "AdSense Help — crawler access",
  },
] as const;

const faqs = [
  {
    q: "Does a passing result guarantee Google AdSense approval?",
    a: "No. This is a rules-based pre-check of public website signals. Google makes the final decision and can consider account history, site ownership, traffic quality, originality, policy context, and pages that were not included in our bounded sample.",
  },
  {
    q: "Is ads.txt required before applying for AdSense?",
    a: "No. Google says ads.txt is not mandatory, although it is highly recommended once you have a publisher ID because it identifies the sellers authorized to sell your inventory. This checker treats a missing ads.txt file as informational rather than an automatic failure.",
  },
  {
    q: "How many pages does the checker inspect?",
    a: "It fetches the homepage, public support files, common trust pages, and up to eight unique content pages discovered through the XML sitemap or homepage links. Inventory size is counted from discoverable URLs; the body sample stays bounded — not a full-site crawl.",
  },
  {
    q: "Does Google require a minimum article word count?",
    a: "Google does not publish a universal minimum word count for AdSense approval. This report still uses stricter practical bars (roughly 300+ homepage words, 500+ median sample depth, zero thin pages under ~300 words, and a stretch bar near 800+) because thin sites often look “fine” on crawl checks alone. Those markers are readiness heuristics, not official Google thresholds.",
  },
  {
    q: "Does the tool use AI to judge originality or prohibited content?",
    a: "No. The free check uses transparent rules and does not pretend it can prove originality, copyright ownership, or every policy category from a small crawl. Those items are marked Review so the site owner can verify them against current Google Publisher Policies.",
  },
  {
    q: "What information is sent to the checker?",
    a: `Only the public domain or URL you submit. ${SITE_NAME} fetches publicly accessible pages and files from its servers. It does not request your AdSense login, analytics account, Search Console, or private traffic data.`,
  },
];

export const metadata: Metadata = {
  title: "Free AdSense Readiness Checker — Website Approval Pre-Check",
  description:
    "Free AdSense readiness checker: inspect crawl access, privacy/About/Contact pages, ads.txt, sitemap, and a bounded content sample before requesting Google review. No signup.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "AdSense readiness checker",
    "AdSense approval checker",
    "AdSense eligibility checker",
    "AdSense website requirements",
    "Google AdSense pre check",
    "AdSense privacy policy checker",
    "ads txt checker",
  ],
  openGraph: {
    title: "Free AdSense Readiness Checker",
    description:
      "Check public crawl, trust, content, and monetization signals before requesting Google AdSense review.",
    url: PAGE_PATH,
    type: "website",
  },
};

export default function AdsenseReadinessCheckerPage() {
  return (
    <ContentPage wide className="max-w-6xl py-10 sm:py-12">
      <ToolFaqJsonLd
        faqs={faqs}
        pageUrl={PAGE_URL}
        name="Free AdSense Readiness Checker"
      />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        Growth & monetization
      </ContentEyebrow>
      <ContentTitle>AdSense readiness checker</ContentTitle>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Public-site pre-check before you request Google review — crawl access,
        trust pages, disclosures, and a bounded content sample. Not an approval
        guarantee.
      </p>

      <div className="mt-8">
        <AdsenseReadinessForm />
      </div>

      <section className="mt-14">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            What Google expects — in plain language
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Criteria from official docs, summarized here
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Distilled from AdSense Help and Google Publisher Policies so you do
            not need to open five tabs. Source links stay available if you want
            the full wording.
          </p>
        </div>

        <ol className="mt-8 space-y-0 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {googleExpectations.map((item, index) => (
            <li
              key={item.href}
              className="grid gap-4 py-6 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-6"
            >
              <span className="font-display text-2xl font-bold tabular-nums text-teal-800/70 dark:text-teal-300/70">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {item.summary}
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                  {item.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal-700 dark:bg-teal-300"
                        aria-hidden
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs font-medium text-slate-400 underline-offset-2 hover:text-teal-700 hover:underline dark:hover:text-teal-300"
                >
                  Full Google document: {item.source}
                </a>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="max-w-4xl">
        <ToolHowItWorks
          steps={[
            {
              title: "Return to the site homepage",
              body: "An inner page URL is reduced to its site origin because AdSense reviews the website, not just one submitted article.",
            },
            {
              title: "Inspect public trust and crawl signals",
              body: "We check robots.txt, sitemap, ads.txt, indexability, navigation, and discoverable Privacy, About, Contact, and Terms pages.",
            },
            {
              title: "Sample content without crawling the whole web",
              body: "Up to eight unique same-site pages are selected from the sitemap or homepage links and checked for readable depth, headings, indexing, titles, and placeholder language.",
            },
            {
              title: "Separate fixes from owner-only review",
              body: "Public technical findings become a prioritized repair list. Account eligibility, traffic quality, copyright, and policy context remain explicit owner checks.",
            },
          ]}
        />

        <ToolBulletSection
          title="What the AdSense readiness report checks"
          intro="The report focuses on publicly verifiable evidence instead of presenting a fake approval probability."
          items={[
            "Homepage reachability, HTTPS, redirect path, robots.txt, and indexability",
            "Whether a full-site rule blocks Google’s Mediapartners crawler",
            "XML sitemap, content inventory size, and useful internal navigation",
            "Public Privacy, About, Contact, and Terms pages",
            "Advertising and cookie disclosure signals in the privacy page",
            "A bounded content sample for thin, placeholder, noindex, untitled, or poorly structured pages",
            "ads.txt format and detected AdSense publisher ID alignment when available",
            "Owner-only confirmations for account eligibility, traffic, rights, policy, and ad experience",
          ]}
        />

        <ToolProse title="What this score means — and what it does not">
          <p>
            The readiness score summarizes measurable public checks. It is not the
            percentage chance that Google will approve an application. Google can
            review the entire site and account, while this free tool deliberately
            limits its crawl and has no access to private AdSense or traffic data.
          </p>
          <p>
            Content word counts are used only to locate pages worth reviewing.
            Google does not publish a universal 800-word, 1,000-word, or any other
            fixed AdSense minimum. A shorter page can still be useful; a longer
            page can still be repetitive or unoriginal.
          </p>
        </ToolProse>

        <ToolProse title="Official policy still comes first">
          <p>
            Before requesting review, read Google’s current{" "}
            <a
              href="https://support.google.com/adsense/answer/7299563?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              site readiness guidance
            </a>
            ,{" "}
            <a
              href="https://support.google.com/publisherpolicies/answer/10502938"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              Publisher Policies
            </a>
            , and{" "}
            <a
              href="https://support.google.com/publisherpolicies/answer/10437795"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              Publisher Restrictions
            </a>
            . Policies change, and the publisher remains responsible for the
            complete site.
          </p>
        </ToolProse>

        <ToolFaqSection faqs={faqs} />

        <ToolRelated
          hint="Use the readiness report for monetization prep, then inspect the overlapping technical signals in more detail."
          tools={[
            { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
            { href: "/tools/noindex-checker", label: "Noindex Checker" },
            { href: "/tools/redirect-checker", label: "Redirect Checker" },
            { href: "/#home-audit-url", label: "Full SEO + GEO Audit" },
          ]}
        />
      </div>
    </ContentPage>
  );
}
