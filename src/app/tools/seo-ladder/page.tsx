import type { Metadata } from "next";
import Link from "next/link";
import { SeoLadder } from "@/components/tools/seo-ladder";
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
import { SEO_LADDER_STAGES } from "@/lib/tools/seo-ladder";
import { SITE_NAME, SITE_URL } from "@/lib/audit/types";

const PAGE_PATH = "/tools/seo-ladder";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const faqs = [
  {
    q: "Is this an SEO income level chart?",
    a: "No. Stages are defined by capability proofs — live site, crawl access, indexation, query match, trust, a value loop, and operating rhythm. Dollar headlines are intentionally not the ladder. Optional side notes never rename a stage.",
  },
  {
    q: "How do I know which stage I’m on?",
    a: "Check every proof you can honestly verify. Your position is the highest stage where all proofs (and every prior stage) are cleared. Progress saves in this browser only — nothing is uploaded.",
  },
  {
    q: "Why ten stages instead of a simple beginner / advanced split?",
    a: "SEO progress is uneven. A site can rank before it’s monetized, or have ads before it has systems. Ten stages keep the next move concrete without pretending every publisher follows the same revenue curve.",
  },
  {
    q: "Do you verify my GSC data or earnings?",
    a: `No. ${SITE_NAME} does not connect to Search Console or payment accounts for this map. You self-attest. Use our free checkers for technical proofs you can fetch from public HTML.`,
  },
  {
    q: "Is the SEO site ladder free?",
    a: "Yes. No account, no credits. Pair it with the full technical audit, AdSense readiness, and crawl checkers when a stage points you there.",
  },
];

export const metadata: Metadata = {
  title: "SEO Site Ladder — 10 Capability Stages (Not an Income Chart)",
  description:
    "Free SEO maturity map: 10 honest stages from live site to durable systems. Self-check proofs, next moves, and tool links — not a dollar leaderboard or community hype.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "seo levels",
    "seo maturity",
    "seo growth stages",
    "seo checklist",
    "seo roadmap",
    "site maturity ladder",
    "seo beginner to advanced",
  ],
  openGraph: {
    title: "SEO Site Ladder — Capability Stages 1–10",
    description:
      "Find your stage with honest proofs: crawlable → indexed → query match → trust → value loop → durable systems.",
    url: PAGE_PATH,
    type: "website",
  },
};

export default function SeoLadderPage() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SEO Site Ladder — 10 capability stages",
    itemListElement: SEO_LADDER_STAGES.map((stage) => ({
      "@type": "ListItem",
      position: stage.id,
      name: `Stage ${stage.id}: ${stage.name}`,
      description: stage.summary,
      url: `${PAGE_URL}#stage-${stage.id}`,
    })),
  };

  return (
    <ContentPage wide className="max-w-6xl py-10 sm:py-12">
      <ToolFaqJsonLd
        faqs={faqs}
        pageUrl={PAGE_URL}
        name="SEO Site Ladder"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        Growth & monetization
      </ContentEyebrow>
      <ContentTitle>SEO site ladder</ContentTitle>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Ten capability stages from a live hostname to a durable search
        operation. Tick proofs you can verify. This is a diagnostic map — not a
        dollar leaderboard, not a promise, not someone else’s community flex.
      </p>

      <SeoLadder />

      <div className="max-w-4xl">
        <ToolHowItWorks
          steps={[
            {
              title: "Read the four arcs",
              body: "Foundation → Traction → Value loop → Systems. Each arc is a different job; skipping crawl basics to chase “scale” usually wastes months.",
            },
            {
              title: "Self-check proofs",
              body: "Every stage has concrete yes/no proofs. Your focus stage is the first incomplete one after a clean streak from Stage 1.",
            },
            {
              title: "Do the next move",
              body: "Each stage links to a free checker or audit on this site. Fix the proof, then tick it — progress stays in your browser.",
            },
            {
              title: "Ignore vanity ladders",
              body: "We don’t define stages by daily revenue tiers. A closed value loop and an operating rhythm matter more than a screenshot of a peak month.",
            },
          ]}
        />

        <ToolBulletSection
          title="How this differs from income charts"
          intro="Same “1–10” shape people search for — different definition of progress."
          items={[
            "Stage titles are capabilities (Live, Crawlable, Indexed…), not day-rate brackets",
            "Proofs are things you can verify in GSC, AdSense prep, or public HTML",
            "Revenue appears only as muted side notes after trust and traction exist",
            "No “everyone in our group hit L10” marketing — just an honest map",
            "Each stage routes into a real free tool, not a paywalled API fantasy",
          ]}
        />

        <ToolProse title="Honest limits">
          <p>
            Self-checks can be optimistic. Search Console access, policy risk,
            and market competition are outside what a static ladder can prove.
            Use the stages to pick the next technical or content job — then
            verify with live tools and your own analytics.
          </p>
        </ToolProse>

        <ToolFaqSection faqs={faqs} />

        <ToolRelated
          hint="Pick a tool that matches your focus stage."
          tools={[
            { href: "/#home-audit-url", label: "Full SEO + GEO Audit" },
            {
              href: "/tools/adsense-readiness-checker",
              label: "AdSense Readiness",
            },
            { href: "/tools/robots-txt-checker", label: "Robots.txt Checker" },
            { href: "/tools/domain-history", label: "Domain History" },
          ]}
        />
      </div>
    </ContentPage>
  );
}
