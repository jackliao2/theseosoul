/** Capability-first SEO site maturity map (not an income leaderboard). */

export type LadderArcId = "foundation" | "traction" | "monetize" | "systems";

export type LadderLink = { href: string; label: string };

export type LadderStage = {
  id: number;
  /** Short capability name — never a dollar headline */
  name: string;
  arc: LadderArcId;
  /** One-line definition of what “done” means */
  summary: string;
  /** Self-check proofs the reader can verify honestly */
  proofs: string[];
  /** Concrete next move once this stage is mostly true */
  nextMove: string;
  tools: LadderLink[];
  /**
   * Optional side note. Never the stage title.
   * Kept qualitative so we don’t invent a fake income ladder.
   */
  sideSignal?: string;
};

export const LADDER_ARCS: Record<
  LadderArcId,
  { label: string; blurb: string }
> = {
  foundation: {
    label: "Foundation",
    blurb: "Ship something real that crawlers and humans can both use.",
  },
  traction: {
    label: "Traction",
    blurb: "Earn indexation and intentional query demand — not vanity URLs.",
  },
  monetize: {
    label: "Value loop",
    blurb: "Trust + a closed path from visit to value (ads, product, or lead).",
  },
  systems: {
    label: "Systems",
    blurb: "Repeatable publishing, measurement, and resilience under change.",
  },
};

export const SEO_LADDER_STAGES: LadderStage[] = [
  {
    id: 1,
    name: "Live site",
    arc: "foundation",
    summary:
      "A public HTTPS hostname with finished pages — not a registrar parking page or blank deploy.",
    proofs: [
      "Homepage loads over HTTPS without a scary certificate warning",
      "At least a few real pages exist (not “Coming soon” forever)",
      "Navigation makes it obvious what the site is for",
    ],
    nextMove:
      "Fix crawl basics before writing more content: robots, indexability, titles.",
    tools: [
      { href: "/#home-audit-url", label: "Full SEO audit" },
      { href: "/tools/domain-history", label: "Domain history" },
    ],
  },
  {
    id: 2,
    name: "Crawlable",
    arc: "foundation",
    summary:
      "Search engines (and ad crawlers if you care) can fetch the pages you want seen.",
    proofs: [
      "No accidental sitewide noindex or X-Robots-Tag: noindex",
      "robots.txt does not Disallow: / for important bots",
      "A sitemap.xml exists and lists the URLs you actually want indexed",
    ],
    nextMove: "Run a focused crawl-access check, then submit the sitemap in GSC.",
    tools: [
      { href: "/tools/robots-txt-checker", label: "Robots.txt checker" },
      { href: "/tools/noindex-checker", label: "Noindex checker" },
      { href: "/tools/redirect-checker", label: "Redirect checker" },
    ],
  },
  {
    id: 3,
    name: "Page hygiene",
    arc: "foundation",
    summary:
      "Primary templates declare a clear title, description, canonical, and heading story.",
    proofs: [
      "Unique <title> and meta description on key templates",
      "One clear H1 that matches the page’s job",
      "Canonical points at the preferred host/path (no www/non-www chaos)",
    ],
    nextMove:
      "Audit a few money pages end-to-end; fix P0 structure before scaling content.",
    tools: [
      { href: "/#home-audit-url", label: "Full SEO audit" },
      { href: "/tools/meta-tag-checker", label: "Meta tag checker" },
      { href: "/tools/canonical-checker", label: "Canonical checker" },
    ],
  },
  {
    id: 4,
    name: "Indexed",
    arc: "traction",
    summary:
      "Google has accepted important URLs into the index — you verified it, not assumed it.",
    proofs: [
      "Google Search Console (or Bing Webmaster) property is verified",
      "Coverage / Pages report shows indexed URLs you care about",
      "site: queries or URL Inspection don’t contradict what you expect",
    ],
    nextMove:
      "Chase coverage errors and soft 404s before publishing the next batch.",
    tools: [
      { href: "/tools/robots-txt-checker", label: "Robots.txt checker" },
      { href: "/tools/noindex-checker", label: "Noindex checker" },
    ],
    sideSignal:
      "Revenue is optional here. Indexation without demand is still a win.",
  },
  {
    id: 5,
    name: "Query match",
    arc: "traction",
    summary:
      "You earn impressions (and ideally clicks) for queries you deliberately targeted.",
    proofs: [
      "GSC Performance shows queries related to your pages’ topics",
      "At least one page has a non-accidental ranking intent (not brand-only)",
      "Title/H1/body agree on the same primary job for that page",
    ],
    nextMove:
      "Double down on pages with impressions but weak CTR or thin answers.",
    tools: [
      { href: "/tools/meta-tag-checker", label: "Meta / SERP preview" },
      { href: "/tools/keyword-density-checker", label: "Keyword density" },
      { href: "/tools/geo-content-checker", label: "GEO content checker" },
    ],
  },
  {
    id: 6,
    name: "Useful depth",
    arc: "traction",
    summary:
      "The site is more than one lucky URL — topical clusters and internal links exist.",
    proofs: [
      "Multiple indexed URLs cover a coherent topic area",
      "Internal links connect hubs ↔ supporting pages on purpose",
      "You avoided doorway / spun thin pages just to farm keywords",
    ],
    nextMove:
      "Map a small cluster (hub + 5–15 supports) and prune pages that don’t help.",
    tools: [
      { href: "/#home-audit-url", label: "Full SEO audit" },
      { href: "/tools/geo-content-checker", label: "GEO content checker" },
    ],
  },
  {
    id: 7,
    name: "Trust ready",
    arc: "monetize",
    summary:
      "Humans and ad networks can tell who runs the site and what happens to their data.",
    proofs: [
      "About, Contact, and Privacy are real pages and linked in the footer",
      "If you plan ads: disclosures + crawler access pass an AdSense-style check",
      "No obvious policy landmines (scraped thin sites, deceptive UX)",
    ],
    nextMove:
      "Close trust gaps before applying for ads or asking for emails/payments.",
    tools: [
      {
        href: "/tools/adsense-readiness-checker",
        label: "AdSense readiness",
      },
      { href: "/about", label: "How we think about honesty" },
    ],
    sideSignal:
      "Still pre-revenue for many sites — trust first reduces rejection churn.",
  },
  {
    id: 8,
    name: "Value loop",
    arc: "monetize",
    summary:
      "A visitor can become value at least once: ad view, affiliate click, signup, or sale.",
    proofs: [
      "A clear CTA or placement exists on pages that already get traffic",
      "You can name the loop: visit → action → value (even if tiny)",
      "Analytics or payout dashboards show at least one non-zero event",
    ],
    nextMove:
      "Improve the pages that already convert before chasing colder keywords.",
    tools: [
      {
        href: "/tools/adsense-readiness-checker",
        label: "AdSense readiness",
      },
      { href: "/tools/open-graph-checker", label: "Open Graph checker" },
    ],
    sideSignal:
      "First closed loop matters more than any specific dollar headline.",
  },
  {
    id: 9,
    name: "Operating rhythm",
    arc: "systems",
    summary:
      "SEO is a habit: ship, measure in GSC, fix a backlog, repeat — not one-off bursts.",
    proofs: [
      "You have a simple weekly or biweekly review of queries / pages / errors",
      "There is a written backlog (even a notes doc) of fixes ranked by impact",
      "Publishing or refreshing content happens on a cadence you can sustain",
    ],
    nextMove:
      "Protect the rhythm when life gets busy — systems beat heroic sprints.",
    tools: [
      { href: "/#home-audit-url", label: "Re-audit after changes" },
      { href: "/tools/seo-ladder", label: "Re-check this ladder" },
    ],
    sideSignal:
      "Income may still wobble; the milestone is repeatability, not a peak month.",
  },
  {
    id: 10,
    name: "Durable",
    arc: "systems",
    summary:
      "The operation survives algorithm noise: diversified queries, formats, or properties.",
    proofs: [
      "Traffic is not a single keyword or single viral page",
      "You have a plan for GEO / citability or non-Google discovery — not panic",
      "Brand, email, product, or multi-site options reduce single-channel risk",
    ],
    nextMove:
      "Stress-test: if your top URL vanished tomorrow, what still compounds?",
    tools: [
      { href: "/tools/geo-content-checker", label: "GEO content checker" },
      { href: "/tools/domain-history", label: "Domain history" },
      { href: "/about#site-soul", label: "Site Soul archetypes" },
    ],
    sideSignal:
      "“Durable” is resilience — not a promise of elite monthly revenue.",
  },
];

export function stageById(id: number): LadderStage | undefined {
  return SEO_LADDER_STAGES.find((s) => s.id === id);
}

/** Highest stage whose every proof is checked, requiring prior stages complete. */
export function resolveLadderPosition(
  checked: Record<string, boolean>
): {
  completedThrough: number;
  focusStage: number;
  totalProofs: number;
  checkedProofs: number;
} {
  let completedThrough = 0;
  for (const stage of SEO_LADDER_STAGES) {
    const all = stage.proofs.every((_, i) => checked[proofKey(stage.id, i)]);
    if (all) completedThrough = stage.id;
    else break;
  }
  const totalProofs = SEO_LADDER_STAGES.reduce((n, s) => n + s.proofs.length, 0);
  const checkedProofs = Object.values(checked).filter(Boolean).length;
  const focusStage = Math.min(completedThrough + 1, SEO_LADDER_STAGES.length);
  return { completedThrough, focusStage, totalProofs, checkedProofs };
}

export function proofKey(stageId: number, proofIndex: number): string {
  return `${stageId}:${proofIndex}`;
}

export const SEO_LADDER_STORAGE_KEY = "theseosoul:seo-ladder:v1";
