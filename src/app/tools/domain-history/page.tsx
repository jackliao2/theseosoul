import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DomainHistoryForm } from "@/components/tools/domain-history-form";
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
import { domainHistoryPathFromInput } from "@/lib/tools/domain-history-url";
import { createSocialMetadata } from "@/lib/social-metadata";

const PAGE_PATH = "/tools/domain-history";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "What is a domain history / Wayback checker?",
    a: "It reconstructs how a domain’s homepage looked over time using Internet Archive snapshots, then contrasts that timeline with public WHOIS/RDAP registration data so you can spot second-hand names, parking eras, and purpose changes before you buy or build.",
  },
  {
    q: "Do you use a paid API or AI for this?",
    a: "No. The free check uses the public Wayback CDX index, a bounded sample of archived HTML, and public RDAP WHOIS. There is no credit wall and no required LLM summary.",
  },
  {
    q: "Why don’t you list every title change as a “major redesign”?",
    a: "Pairwise rewrite lists get noisy when hosts flip between parking pages and errors. We group sampled snapshots into life chapters by role — content, parking, error, doorway — so the story stays readable.",
  },
  {
    q: "If Archive shows nothing, is the domain clean?",
    a: "Often yes for unused names, but not always. Small sites can be missed, and robots rules can block archival crawlers. Treat an empty trail as a soft signal, not proof.",
  },
  {
    q: "Is the domain history tool free?",
    a: `Yes. ${SITE_NAME} domain history needs no account. Each lookup opens a shareable /tools/domain-history/[domain] report. Pair it with the full technical audit when you want current on-page and crawl signals too.`,
  },
];

export const metadata: Metadata = {
  title: "Free Domain History Checker — Wayback & WHOIS Past Lives",
  description:
    "Free domain history checker: reconstruct Internet Archive chapters, spot parking eras, and contrast WHOIS for second-hand domains. Shareable report URL — no signup.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "domain history checker",
    "wayback machine domain history",
    "domain archive checker",
    "second hand domain checker",
    "expired domain history",
    "whois archive check",
  ],
  ...createSocialMetadata({
    title: "Free Domain History Checker",
    description:
      "Read a domain’s archive chapters and WHOIS contrast before you buy — free, no signup.",
    url: PAGE_PATH,
  }),
};

export default async function DomainHistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = typeof sp.url === "string" ? sp.url : Array.isArray(sp.url) ? sp.url[0] : "";
  if (raw?.trim()) {
    let href: string | undefined;
    try {
      href = domainHistoryPathFromInput(raw);
    } catch {
      href = undefined;
    }
    if (href) redirect(href);
  }

  return (
    <ContentPage wide className="max-w-6xl py-10 sm:py-12">
      <ToolFaqJsonLd
        faqs={faqs}
        pageUrl={PAGE_URL}
        name="Free Domain History Checker"
      />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        Growth & monetization
      </ContentEyebrow>
      <ContentTitle>Domain history checker</ContentTitle>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Before you buy or brand a name, read its past lives: archive chapters,
        parking eras, and whether WHOIS looks first-hand. Public Wayback + RDAP
        only — no credits, no fake DA. Each lookup publishes a shareable{" "}
        <code className="text-[13px]">/tools/domain-history/[domain]</code>{" "}
        report.
      </p>
      <p className="mt-3 text-sm text-slate-500">
        Example:{" "}
        <Link
          href="/tools/domain-history/theseosoul.com"
          className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
        >
          theseosoul.com’s own past lives
        </Link>
        .
      </p>

      <div className="mt-8">
        <DomainHistoryForm />
      </div>

      <div className="max-w-4xl">
        <ToolHowItWorks
          steps={[
            {
              title: "Pull the CDX timeline",
              body: "We ask Internet Archive for monthly homepage captures, then count active months and unique content digests.",
            },
            {
              title: "Sample representative snapshots",
              body: "Instead of dumping every capture, we fetch a bounded set of digest-change points and classify each page’s role.",
            },
            {
              title: "Tell the story in chapters",
              body: "Consecutive similar roles become chapters — content, parking, errors, doorway — so the report stays scannable.",
            },
            {
              title: "Contrast with WHOIS",
              body: "If archive activity starts far earlier than the current registration date, we flag a likely second-hand domain.",
            },
          ]}
        />

        <ToolBulletSection
          title="What this domain history report highlights"
          intro="Due diligence before acquiring or building on aged domains:"
          items={[
            "Clear historical verdict: clean brand trail, parking era, dropped domain, or spam signals",
            "First and latest Wayback Archive captures plus active longevity metrics",
            "Timeline role classification: content site, parking farm, doorway redirect, or 404/error state",
            "WHOIS registration date vs Wayback first-seen date contrast",
          ]}
        />

        <ToolUseCases
          title="Expired Domain Due Diligence Scenarios"
          intro="Buying an aged domain can jumpstart SEO or permanently inherit Google algorithmic penalties:"
          cases={[
            {
              badge: "Spam PBNs",
              scenario: "Private Blog Network (PBN) Past Life",
              problem:
                "Acquiring an expired domain that was previously hijacked by casino/crypto PBN link networks with toxic spam links.",
              solution:
                "Inspect historical Wayback captures for unnatural anchor text or foreign language redirects before purchasing.",
            },
            {
              badge: "Brand Reset",
              scenario: "Dropped Domain Registration Gaps",
              problem:
                "Assuming a domain registered in 2012 has 14 years of continuous authority, when it actually expired and sat parked for 8 years.",
              solution:
                "Contrast the WHOIS 'createdDate' against continuous yearly active archive captures to verify true unbroken history.",
            },
            {
              badge: "Rebranding",
              scenario: "Recovering High-Value Historical URLs",
              problem:
                "Launching a new website on an acquired brand domain without recreating top historical URLs that still hold external backlinks.",
              solution:
                "Use archive snapshots to identify previous high-traffic slug structures and establish 301 redirects to new pages.",
            },
          ]}
        />

        <ToolProse title="How to Inspect Domain RDAP & Registration Data">
          <p>
            You can verify domain registration authority and nameserver records directly using RDAP (Registration Data Access Protocol):
          </p>

          <ToolCodeBlock
            title="Terminal RDAP Domain Lookup Example"
            language="bash"
            description="Query the authoritative registry RDAP endpoint for registration lifecycle events:"
            code={`# Query domain registration metadata
curl -s https://rdap.verisign.com/com/v1/domain/example.com | jq '{
  handle: .handle,
  status: .status,
  registrationDate: .events[] | select(.eventAction=="registration") | .eventDate,
  expirationDate: .events[] | select(.eventAction=="expiration") | .eventDate
}'`}
          />
        </ToolProse>

        <ToolGuideCard
          href="/blog/domain-history-before-you-buy"
          title="Buying an aged domain? Investigate the story, not the age"
          description="Use Wayback snapshots and WHOIS/RDAP together to separate a real brand history from parking, spam eras, ownership resets, and archive gaps."
          cta="Follow the due-diligence workflow"
        />

        <ToolFaqSection faqs={faqs} />

        <ToolRelated
          hint="History is only half the story — check what the live site looks like now."
          tools={[
            { href: "/#home-audit-url", label: "Full SEO + GEO Audit" },
            {
              href: "/tools/adsense-readiness-checker",
              label: "AdSense Readiness",
            },
            { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
            { href: "/tools/redirect-checker", label: "Redirect Checker" },
          ]}
        />
      </div>
    </ContentPage>
  );
}
