import * as cheerio from "cheerio";
import { fetchHtml, fetchText } from "@/lib/audit/fetch";
import { checkAdsTxt } from "@/lib/audit/extras";
import { parseLinks } from "@/lib/audit/links";
import { parseRobotsMeta } from "@/lib/audit/parse";
import { analyzeRobots } from "@/lib/audit/robots";
import { sniffTrackers } from "@/lib/audit/sniff";
import type {
  AdsenseCheckGroup,
  AdsenseCheckImpact,
  AdsenseCheckStatus,
  AdsenseFindingReference,
  AdsenseReadinessCheck,
  AdsenseReadinessResult,
  AdsenseSamplePage,
  AdsenseTrustPage,
} from "@/lib/tools/adsense-readiness-types";

const MAX_SAMPLE_PAGES = 8;
const SAMPLE_TIMEOUT_MS = 8_000;

/** Practical readiness bars — not published Google word-count minima. */
const HOME_WORDS_MIN = 300;
const CONTENT_MEDIAN_MIN = 500;
const DEEP_CONTENT_MEDIAN = 800;
const THIN_WORDS = 300;
const MIN_SAMPLE_PAGES = 5;
const MIN_CONTENT_INVENTORY = 12;

const GOOGLE_REFERENCES = {
  siteReady: {
    label: "Google AdSense — Make sure your site's pages are ready",
    url: "https://support.google.com/adsense/answer/7299563?hl=en",
    relation: "Google guidance",
  },
  notReady: {
    label: "Google AdSense — What to do when your site is not ready",
    url: "https://support.google.com/adsense/answer/12176698?hl=en",
    relation: "Google guidance",
  },
  notApproved: {
    label: "Google AdSense — Your account wasn't approved",
    url: "https://support.google.com/adsense/answer/81904?hl=en",
    relation: "Google guidance",
  },
  crawler: {
    label: "Google AdSense — Give access to the AdSense crawler",
    url: "https://support.google.com/adsense/answer/10532?hl=en",
    relation: "Direct requirement",
  },
  privacy: {
    label: "Google AdSense — Required privacy policy content",
    url: "https://support.google.com/adsense/answer/1348695?hl=en",
    relation: "Direct requirement",
  },
  publisherPolicies: {
    label: "Google Publisher Policies",
    url: "https://support.google.com/publisherpolicies/answer/10502938",
    relation: "Direct requirement",
  },
  publisherTransparency: {
    label: "Google Publisher Policies — Misrepresentation",
    url: "https://support.google.com/publisherpolicies/answer/10502938",
    relation: "Supporting signal",
  },
  restrictions: {
    label: "Google Publisher Restrictions",
    url: "https://support.google.com/publisherpolicies/answer/10437795",
    relation: "Direct requirement",
  },
  programPolicies: {
    label: "Google AdSense Program policies",
    url: "https://support.google.com/adsense/answer/48182",
    relation: "Direct requirement",
  },
  programGuidance: {
    label: "Google AdSense Program policies",
    url: "https://support.google.com/adsense/answer/48182",
    relation: "Supporting signal",
  },
  eligibility: {
    label: "Google AdSense — Eligibility requirements",
    url: "https://support.google.com/adsense/answer/9724?hl=en",
    relation: "Direct requirement",
  },
  invalidTraffic: {
    label: "Google AdSense — Invalid traffic",
    url: "https://support.google.com/adsense/answer/16737?hl=en",
    relation: "Direct requirement",
  },
  adsTxt: {
    label: "Google AdSense — Ads.txt guide",
    url: "https://support.google.com/adsense/answer/12171612?hl=en",
    relation: "Google guidance",
  },
  robots: {
    label: "Google Search Central — Introduction to robots.txt",
    url: "https://developers.google.com/search/docs/crawling-indexing/robots/intro",
    relation: "Supporting signal",
  },
  sitemap: {
    label: "Google Search Central — Build and submit a sitemap",
    url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap",
    relation: "Supporting signal",
  },
  https: {
    label: "Google Search Central — Page experience and HTTPS",
    url: "https://developers.google.com/search/docs/appearance/page-experience",
    relation: "Supporting signal",
  },
} as const satisfies Record<string, AdsenseFindingReference>;

function referenceFor(id: string): AdsenseFindingReference {
  if (id === "https") return GOOGLE_REFERENCES.https;
  if (id === "robots-present") return GOOGLE_REFERENCES.robots;
  if (id === "sitemap") return GOOGLE_REFERENCES.sitemap;
  if (id === "crawl-access") return GOOGLE_REFERENCES.robots;
  if (id === "adsense-crawler") return GOOGLE_REFERENCES.crawler;
  if (id === "privacy-disclosure") return GOOGLE_REFERENCES.privacy;
  if (id === "trust-privacy") return GOOGLE_REFERENCES.privacy;
  if (id === "trust-about" || id === "trust-contact") {
    return GOOGLE_REFERENCES.publisherTransparency;
  }
  if (id === "trust-terms") return GOOGLE_REFERENCES.programGuidance;
  if (id === "ad-experience") return GOOGLE_REFERENCES.programPolicies;
  if (id === "ads-txt" || id === "publisher-id") {
    return GOOGLE_REFERENCES.adsTxt;
  }
  if (id === "account-eligibility") return GOOGLE_REFERENCES.eligibility;
  if (id === "content-policy") return GOOGLE_REFERENCES.publisherPolicies;
  if (id === "traffic-quality") return GOOGLE_REFERENCES.invalidTraffic;
  if (
    id === "homepage-content" ||
    id === "site-purpose" ||
    id === "content-depth" ||
    id === "deep-content" ||
    id === "thin-pages" ||
    id === "placeholders" ||
    id === "page-headings" ||
    id === "unique-titles" ||
    id === "content-inventory"
  ) {
    return GOOGLE_REFERENCES.notApproved;
  }
  if (
    id === "homepage-reachable" ||
    id === "redirects" ||
    id === "homepage-indexable" ||
    id === "sample-size" ||
    id === "sample-indexing"
  ) {
    return GOOGLE_REFERENCES.notReady;
  }
  if (id === "navigation" || id === "trust-bundle") {
    return GOOGLE_REFERENCES.siteReady;
  }
  if (id === "adsense-code") return GOOGLE_REFERENCES.notReady;
  return GOOGLE_REFERENCES.publisherPolicies;
}

const TRUST_DEFINITIONS: Array<{
  kind: AdsenseTrustPage["kind"];
  label: string;
  paths: string[];
  match: RegExp;
}> = [
  {
    kind: "privacy",
    label: "Privacy policy",
    paths: ["/privacy", "/privacy-policy"],
    match: /privacy|data[\s-]?protection|隐私|個人情報/i,
  },
  {
    kind: "about",
    label: "About",
    paths: ["/about", "/about-us"],
    match: /about(?:\s+us)?|our[\s-](?:story|team)|关于|關於/i,
  },
  {
    kind: "contact",
    label: "Contact",
    paths: ["/contact", "/contact-us"],
    match: /contact(?:\s+us)?|get[\s-]in[\s-]touch|联系|聯絡/i,
  },
  {
    kind: "terms",
    label: "Terms",
    paths: ["/terms", "/terms-of-service", "/terms-and-conditions"],
    match: /terms|conditions|服务条款|條款/i,
  },
];

type TrustFetch = AdsenseTrustPage & { text: string | null };

function check(
  id: string,
  group: AdsenseCheckGroup,
  title: string,
  status: AdsenseCheckStatus,
  impact: AdsenseCheckImpact,
  evidence: string,
  recommendation: string,
  url?: string
): AdsenseReadinessCheck {
  return {
    id,
    group,
    title,
    status,
    impact,
    evidence,
    recommendation,
    reference: referenceFor(id),
    ...(url ? { url } : {}),
  };
}

function baseHost(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function isSameSite(value: string, origin: string): boolean {
  return baseHost(value) === baseHost(origin);
}

function visibleText($: cheerio.CheerioAPI): string {
  const clone = $.root().clone();
  clone
    .find("script, style, noscript, svg, nav, footer, header, form")
    .remove();
  const focused = clone.find("main, article, [role='main']").first();
  return (focused.length ? focused.text() : clone.find("body").text())
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(text: string): number {
  const cjk = text.match(/[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/g)?.length ?? 0;
  const nonCjk = text
    .replace(/[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/g, " ")
    .match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  return nonCjk + Math.ceil(cjk / 2);
}

function pageIsNoindex(
  $: cheerio.CheerioAPI,
  headers: Record<string, string>
): boolean {
  const robots = parseRobotsMeta($).content ?? "";
  return /noindex|none/i.test(`${robots} ${headers["x-robots-tag"] ?? ""}`);
}

function hasPlaceholder(text: string): boolean {
  return /\blorem ipsum\b|\bcoming soon\b|\bunder construction\b|\bplaceholder\b|\b(?:todo|tbd)\b|建设中|即将上线|準備中/i.test(
    text
  );
}

function robotsBlocksAgent(content: string | null, target: string): boolean {
  if (!content) return false;
  let agents: string[] = [];
  let directivesStarted = false;

  for (const raw of content.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const userAgent = line.match(/^user-agent:\s*(.+)$/i);
    if (userAgent) {
      if (directivesStarted) agents = [];
      directivesStarted = false;
      agents.push(userAgent[1].trim().toLowerCase());
      continue;
    }
    directivesStarted = true;
    const disallow = line.match(/^disallow:\s*(.*)$/i);
    if (
      disallow &&
      (disallow[1].trim() === "/" || disallow[1].trim() === "/*") &&
      agents.some((agent) => agent === target.toLowerCase())
    ) {
      return true;
    }
  }

  return false;
}

function discoverTrustLinks(
  $: cheerio.CheerioAPI,
  pageUrl: string
): Map<AdsenseTrustPage["kind"], string> {
  const discovered = new Map<AdsenseTrustPage["kind"], string>();
  $("a[href]").each((_, element) => {
    const raw = ($(element).attr("href") ?? "").trim();
    if (!raw) return;
    let url: URL;
    try {
      url = new URL(raw, pageUrl);
    } catch {
      return;
    }
    if (!isSameSite(url.toString(), pageUrl)) return;
    const haystack = `${url.pathname} ${$(element).text()}`.replace(/\s+/g, " ");
    const definition = TRUST_DEFINITIONS.find((item) =>
      item.match.test(haystack)
    );
    if (definition && !discovered.has(definition.kind)) {
      url.hash = "";
      discovered.set(definition.kind, url.toString());
    }
  });
  return discovered;
}

async function fetchTrustPage(
  definition: (typeof TRUST_DEFINITIONS)[number],
  origin: string,
  discoveredUrl: string | undefined
): Promise<TrustFetch> {
  const candidates = Array.from(
    new Set([
      ...(discoveredUrl ? [discoveredUrl] : []),
      ...definition.paths.map((path) => new URL(path, origin).toString()),
    ])
  );

  for (const candidate of candidates) {
    try {
      const fetched = await fetchHtml(candidate, 6_000);
      const final = new URL(fetched.finalUrl);
      if (final.pathname === "/" && new URL(candidate).pathname !== "/") {
        continue;
      }
      const $ = cheerio.load(fetched.html);
      const text = visibleText($);
      if (text.length < 40) continue;
      return {
        kind: definition.kind,
        label: definition.label,
        found: true,
        url: fetched.finalUrl,
        text,
      };
    } catch {
      // Try the next public candidate.
    }
  }

  return {
    kind: definition.kind,
    label: definition.label,
    found: false,
    url: null,
    text: null,
  };
}

function extractSitemapLocs(content: string): string[] {
  return Array.from(content.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi))
    .map((match) => match[1].trim())
    .filter(Boolean);
}

async function discoverSitemapPages(
  origin: string,
  directives: string[]
): Promise<{ present: boolean; url: string; pages: string[] }> {
  const resolvedDirectives = directives
    .map((directive) => {
      try {
        return new URL(directive, origin).toString();
      } catch {
        return null;
      }
    })
    .filter((value): value is string => Boolean(value));

  const candidates = Array.from(
    new Set([
      ...resolvedDirectives,
      new URL("/sitemap.xml", origin).toString(),
    ])
  ).slice(0, 3);

  for (const candidate of candidates) {
    const content = await fetchText(candidate, 6_000);
    if (!content || !/<(?:urlset|sitemapindex|url)\b/i.test(content)) continue;
    let locs = extractSitemapLocs(content);
    const nested = locs.filter((url) => /\.xml(?:$|\?)/i.test(url)).slice(0, 2);
    if (nested.length && locs.every((url) => /\.xml(?:$|\?)/i.test(url))) {
      const nestedContents = await Promise.all(
        nested.map((url) => fetchText(url, 6_000))
      );
      locs = nestedContents.flatMap((value) =>
        value ? extractSitemapLocs(value) : []
      );
    }
    return {
      present: true,
      url: candidate,
      pages: Array.from(new Set(locs)).filter((url) =>
        isSameSite(url, origin)
      ),
    };
  }

  return {
    present: false,
    url: new URL("/sitemap.xml", origin).toString(),
    pages: [],
  };
}

function pageKey(value: string, origin: string): string | null {
  try {
    const url = new URL(value, origin);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const path = url.pathname.replace(/\/+$/, "") || "/";
    return `${host}${path}`;
  } catch {
    return null;
  }
}

function contentCandidates(
  sitemapPages: string[],
  homeLinks: ReturnType<typeof parseLinks>["items"],
  origin: string
): string[] {
  const excluded =
    /\/(?:privacy|terms|contact|about|login|sign-?in|sign-?up|account|cart|checkout|search|tag|category|author)(?:\/|$)|\.(?:xml|jpg|jpeg|png|gif|webp|svg|pdf|zip)(?:$|\?)/i;
  const rootPath = new URL(origin).pathname.replace(/\/+$/, "") || "/";
  const candidates = [
    ...sitemapPages,
    ...homeLinks.filter((link) => link.internal).map((link) => link.href),
  ];
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const value of candidates) {
    try {
      const url = new URL(value, origin);
      url.hash = "";
      url.search = "";
      if (!isSameSite(url.toString(), origin)) continue;
      if (url.pathname === rootPath || url.pathname === "/") continue;
      if (excluded.test(url.pathname)) continue;
      const key = pageKey(url.toString(), origin);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      unique.push(url.toString());
    } catch {
      // skip invalid URLs
    }
  }

  return unique;
}

async function samplePage(url: string): Promise<AdsenseSamplePage | null> {
  try {
    const fetched = await fetchHtml(url, SAMPLE_TIMEOUT_MS);
    const $ = cheerio.load(fetched.html);
    const text = visibleText($);
    return {
      url: fetched.finalUrl,
      title: $("title").first().text().replace(/\s+/g, " ").trim() || "Untitled",
      words: countWords(text),
      h1Count: $("h1").length,
      noindex: pageIsNoindex($, fetched.headers),
      placeholder: hasPlaceholder(text),
    };
  } catch {
    return null;
  }
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[midpoint]
    : Math.round((sorted[midpoint - 1] + sorted[midpoint]) / 2);
}

function scoreChecks(checks: AdsenseReadinessCheck[]): number {
  const weights: Record<AdsenseCheckImpact, number> = {
    critical: 4,
    important: 2,
    advisory: 1,
  };
  const measured = checks.filter(
    (item) => item.status === "pass" || item.status === "fix"
  );
  const possible = measured.reduce((sum, item) => sum + weights[item.impact], 0);
  const earned = measured
    .filter((item) => item.status === "pass")
    .reduce((sum, item) => sum + weights[item.impact], 0);
  let score = possible ? Math.round((earned / possible) * 100) : 0;

  const criticalFixes = measured.filter(
    (item) => item.status === "fix" && item.impact === "critical"
  ).length;
  if (criticalFixes >= 3) score = Math.min(score, 34);
  else if (criticalFixes === 2) score = Math.min(score, 44);
  else if (criticalFixes === 1) score = Math.min(score, 58);

  return score;
}

function hasClearSitePurpose(title: string, words: number): boolean {
  const normalized = title.replace(/\s+/g, " ").trim().toLowerCase();
  if (!normalized || normalized === "untitled") return false;
  if (
    /^(home|homepage|welcome|index|website|example domain|domain|my site|site)$/i.test(
      normalized
    )
  ) {
    return false;
  }
  return words >= HOME_WORDS_MIN;
}

export async function checkAdsenseReadiness(
  submittedUrl: string,
  domain: string
): Promise<AdsenseReadinessResult> {
  const submitted = new URL(submittedUrl);
  const requestedOrigin = submitted.origin;
  const homepage = await fetchHtml(requestedOrigin);
  const origin = new URL(homepage.finalUrl).origin;
  const $ = cheerio.load(homepage.html);
  const homeText = visibleText($);
  const homeWords = countWords(homeText);
  const links = parseLinks($, homepage.finalUrl);
  const trustLinks = discoverTrustLinks($, homepage.finalUrl);

  const [robots, adsTxt] = await Promise.all([
    analyzeRobots(origin),
    checkAdsTxt(origin),
  ]);
  const sitemap = await discoverSitemapPages(
    origin,
    robots.sitemapDirectives
  );

  const inventoryUrls = contentCandidates(sitemap.pages, links.items, origin);
  const sampleTargets = inventoryUrls.slice(0, MAX_SAMPLE_PAGES);

  const [trustPages, sampledResults] = await Promise.all([
    Promise.all(
      TRUST_DEFINITIONS.map((definition) =>
        fetchTrustPage(
          definition,
          origin,
          trustLinks.get(definition.kind)
        )
      )
    ),
    Promise.all(sampleTargets.map(samplePage)),
  ]);

  const sampledSeen = new Set<string>();
  const sampledPages = sampledResults.filter(
    (page): page is AdsenseSamplePage => {
      if (!page) return false;
      const key = pageKey(page.url, origin);
      if (!key || sampledSeen.has(key)) return false;
      sampledSeen.add(key);
      return true;
    }
  );
  const checks: AdsenseReadinessCheck[] = [];
  const https = new URL(homepage.finalUrl).protocol === "https:";
  const homepageNoindex = pageIsNoindex($, homepage.headers);
  const mediaPartnersBlocked = robotsBlocksAgent(
    robots.content,
    "Mediapartners-Google"
  );

  checks.push(
    check(
      "homepage-reachable",
      "access",
      "Homepage is publicly reachable",
      "pass",
      "critical",
      `Fetched ${homepage.finalUrl} with HTTP ${homepage.status}.`,
      "Keep the homepage publicly accessible during Google review.",
      homepage.finalUrl
    ),
    check(
      "https",
      "access",
      "HTTPS is active",
      https ? "pass" : "fix",
      "important",
      https ? "The final homepage uses HTTPS." : "The final homepage uses HTTP.",
      "Serve the whole site over HTTPS and redirect HTTP consistently."
    ),
    check(
      "redirects",
      "access",
      "Redirect path is direct",
      homepage.redirectChain.length <= 2 ? "pass" : "fix",
      "advisory",
      `${homepage.redirectChain.length} request hop(s) were needed to reach the homepage.`,
      "Reduce avoidable redirects before the final homepage."
    ),
    check(
      "robots-present",
      "access",
      "robots.txt is available",
      robots.present ? "pass" : "fix",
      "advisory",
      robots.message,
      "Publish a clear robots.txt at the site root.",
      robots.url
    ),
    check(
      "crawl-access",
      "access",
      "General crawlers can access the site",
      robots.allowsIndexing === false ? "fix" : "pass",
      "critical",
      robots.allowsIndexing === false
        ? "User-agent: * is blocked from the whole site."
        : "No site-wide crawl block was detected.",
      "Remove an unintended Disallow: / before requesting review."
    ),
    check(
      "adsense-crawler",
      "access",
      "AdSense crawler is not blocked",
      mediaPartnersBlocked ? "fix" : "pass",
      "critical",
      mediaPartnersBlocked
        ? "An explicit Mediapartners-Google group blocks the whole site."
        : "No explicit full-site block for Mediapartners-Google was detected.",
      "Allow Mediapartners-Google to crawl pages intended for monetization."
    ),
    check(
      "homepage-indexable",
      "access",
      "Homepage is indexable",
      homepageNoindex ? "fix" : "pass",
      "critical",
      homepageNoindex
        ? "A meta robots or X-Robots-Tag noindex directive was detected."
        : "No homepage noindex directive was detected.",
      "Remove noindex only if this public site is intended for search and AdSense review."
    ),
    check(
      "sitemap",
      "access",
      "XML sitemap is available",
      sitemap.present ? "pass" : "fix",
      "advisory",
      sitemap.present
        ? `A sitemap was found with ${sitemap.pages.length} discovered URL(s).`
        : "No readable XML sitemap was found at the declared or default location.",
      "Publish a sitemap containing the canonical public content pages.",
      sitemap.url
    ),
    check(
      "navigation",
      "access",
      "Homepage has useful internal navigation",
      links.internal >= 5 ? "pass" : "fix",
      "important",
      `${links.internal} internal link(s) were found on the homepage.`,
      "Add clear navigation to the main content sections and trust pages."
    )
  );

  const trustByKind = new Map(trustPages.map((page) => [page.kind, page]));
  for (const definition of TRUST_DEFINITIONS) {
    const page = trustByKind.get(definition.kind)!;
    const required = definition.kind !== "terms";
    checks.push(
      check(
        `trust-${definition.kind}`,
        "trust",
        `${definition.label} is accessible`,
        page.found ? "pass" : required ? "fix" : "info",
        required ? "critical" : "advisory",
        page.found
          ? `Found a public ${definition.label.toLowerCase()} page.`
          : `No public ${definition.label.toLowerCase()} page was found from navigation or common paths.`,
        page.found
          ? `Keep the ${definition.label.toLowerCase()} page current and linked from the site.`
          : `Add and visibly link a clear ${definition.label.toLowerCase()} page.`,
        page.url ?? undefined
      )
    );
  }

  const privacy = trustByKind.get("privacy");
  const about = trustByKind.get("about");
  const contact = trustByKind.get("contact");
  const trustBundleReady = Boolean(
    privacy?.found && about?.found && contact?.found
  );
  checks.push(
    check(
      "trust-bundle",
      "trust",
      "Core trust pages are all present",
      trustBundleReady ? "pass" : "fix",
      "critical",
      trustBundleReady
        ? "Privacy, About, and Contact pages were all found."
        : `Missing: ${
            [
              !privacy?.found ? "Privacy" : null,
              !about?.found ? "About" : null,
              !contact?.found ? "Contact" : null,
            ]
              .filter(Boolean)
              .join(", ") || "core trust pages"
          }.`,
      "Publish Privacy, About, and Contact pages and link them from the site footer or navigation."
    )
  );

  const privacyText = privacy?.text?.toLowerCase() ?? "";
  const privacySignals = [
    /cookie/.test(privacyText),
    /google/.test(privacyText),
    /advertis|personalized|personalised|广告|廣告/.test(privacyText),
    /opt[\s-]?out|ads settings|退出|停用/.test(privacyText),
  ];
  const privacySignalCount = privacySignals.filter(Boolean).length;
  checks.push(
    check(
      "privacy-disclosure",
      "trust",
      "Privacy page covers advertising disclosures",
      privacy?.found && privacySignalCount >= 4 ? "pass" : "fix",
      "critical",
      privacy?.found
        ? `${privacySignalCount}/4 disclosure signals found: cookies, Google, advertising, and opt-out guidance.`
        : "The disclosure could not be checked because no privacy page was found.",
      "Before showing ads, disclose Google/third-party cookies, personalized advertising, and opt-out choices. This is a text heuristic, not legal advice.",
      privacy?.url ?? undefined
    )
  );

  const sampleCount = sampledPages.length;
  const sampleMedian = median(sampledPages.map((page) => page.words));
  const thinPages = sampledPages.filter((page) => page.words < THIN_WORDS);
  const placeholderPages = sampledPages.filter((page) => page.placeholder);
  const missingH1 = sampledPages.filter((page) => page.h1Count === 0);
  const indexableSamples = sampledPages.filter((page) => !page.noindex);
  const homeTitle = $("title").first().text().replace(/\s+/g, " ").trim();
  const sitePurposeClear = hasClearSitePurpose(homeTitle, homeWords);
  const titled = sampledPages
    .map((page) => page.title.trim().toLowerCase())
    .filter((title) => title && title !== "untitled");
  const uniqueTitles = new Set(titled).size;

  checks.push(
    check(
      "site-purpose",
      "content",
      "Homepage explains the site’s purpose",
      sitePurposeClear ? "pass" : "fix",
      "critical",
      sitePurposeClear
        ? `Homepage title “${homeTitle}” plus about ${homeWords.toLocaleString()} readable words suggest a clear public purpose.`
        : `Homepage title “${homeTitle || "Untitled"}” and ${homeWords.toLocaleString()} readable words do not clearly explain what the site is for.`,
      "State what the site does, who it serves, and what visitors can find — on the homepage itself."
    ),
    check(
      "homepage-content",
      "content",
      "Homepage has readable substance",
      homeWords >= HOME_WORDS_MIN ? "pass" : "fix",
      "critical",
      `Approximately ${homeWords.toLocaleString()} readable words were found outside navigation and footer chrome (practical bar: ${HOME_WORDS_MIN}+).`,
      "Use the homepage to explain what the site offers and guide visitors to substantive pages."
    ),
    check(
      "content-inventory",
      "content",
      "Enough public content URLs are discoverable",
      inventoryUrls.length >= MIN_CONTENT_INVENTORY ? "pass" : "fix",
      "critical",
      `${inventoryUrls.length} eligible content URL(s) were found via sitemap and homepage links (practical bar: ${MIN_CONTENT_INVENTORY}+).`,
      "Build a real inventory of useful articles or pages before applying — not just a homepage and a few stubs."
    ),
    check(
      "sample-size",
      "content",
      "Multiple content pages are sampleable",
      sampleCount >= MIN_SAMPLE_PAGES ? "pass" : "fix",
      "critical",
      `${sampleCount} unique content page(s) were successfully sampled (target ${MIN_SAMPLE_PAGES}+, maximum ${MAX_SAMPLE_PAGES}).`,
      "Publish and internally link several complete, useful content pages that a crawler can reach."
    ),
    check(
      "content-depth",
      "content",
      "Sample shows meaningful content depth",
      sampleCount > 0 && sampleMedian >= CONTENT_MEDIAN_MIN ? "pass" : "fix",
      "critical",
      sampleCount
        ? `The sampled median is approximately ${sampleMedian.toLocaleString()} words (practical bar: ${CONTENT_MEDIAN_MIN}+).`
        : "No eligible content pages could be sampled.",
      `Expand thin topics. The ${CONTENT_MEDIAN_MIN}-word median marker is a readiness heuristic used by publishers in practice — not a published Google minimum.`
    ),
    check(
      "deep-content",
      "content",
      "Sample approaches in-depth article length",
      sampleCount > 0 && sampleMedian >= DEEP_CONTENT_MEDIAN ? "pass" : "fix",
      "important",
      sampleCount
        ? `Median sample depth is about ${sampleMedian.toLocaleString()} words (stretch bar: ${DEEP_CONTENT_MEDIAN}+).`
        : "No eligible content pages could be sampled.",
      `Many publishers aim for roughly ${DEEP_CONTENT_MEDIAN}–1,500 words on core articles. This is a competitive signal, not an official AdSense rule.`
    ),
    check(
      "thin-pages",
      "content",
      "Sampled pages are not thin",
      sampleCount > 0 && thinPages.length === 0 ? "pass" : "fix",
      "critical",
      `${thinPages.length}/${sampleCount} sampled page(s) contained fewer than approximately ${THIN_WORDS} readable words.`,
      "Improve or remove thin public pages before requesting review. Zero thin pages in the sample is the bar used here."
    ),
    check(
      "placeholders",
      "content",
      "No placeholder content was detected",
      placeholderPages.length === 0 ? "pass" : "fix",
      "critical",
      placeholderPages.length
        ? `${placeholderPages.length} sampled page(s) contained placeholder or under-construction language.`
        : "No common placeholder phrases were detected in the sample.",
      "Finish or remove placeholder pages before submitting the site."
    ),
    check(
      "sample-indexing",
      "content",
      "Sampled content is indexable",
      sampleCount > 0 && indexableSamples.length === sampleCount ? "pass" : "fix",
      "important",
      `${indexableSamples.length}/${sampleCount} sampled page(s) had no noindex signal.`,
      "Review unintended noindex directives on substantive public content."
    ),
    check(
      "page-headings",
      "content",
      "Content pages use a primary heading",
      sampleCount > 0 && missingH1.length === 0 ? "pass" : "fix",
      "important",
      `${missingH1.length}/${sampleCount} sampled page(s) were missing an H1.`,
      "Give each substantive page one clear primary heading."
    ),
    check(
      "unique-titles",
      "content",
      "Sampled pages have distinct titles",
      sampleCount > 0 && uniqueTitles === sampleCount ? "pass" : "fix",
      "important",
      `${uniqueTitles}/${sampleCount} sampled page title(s) were present and unique.`,
      "Use a specific, distinct title for every public content page."
    )
  );

  const trackers = sniffTrackers(homepage.html);
  const adsenseDetected = trackers.includes("Google AdSense");
  const publisherIds = Array.from(
    new Set(homepage.html.match(/ca-pub-\d+/gi) ?? [])
  );
  const adsRecordMatches =
    publisherIds.length > 0 &&
    Boolean(
      adsTxt.preview &&
        publisherIds.some((id) =>
          adsTxt.preview!.toLowerCase().includes(id.replace(/^ca-/, "").toLowerCase())
        )
    );

  checks.push(
    check(
      "ads-txt",
      "monetization",
      "ads.txt status",
      !adsTxt.present ? "info" : adsTxt.status === "pass" ? "pass" : "fix",
      "advisory",
      !adsTxt.present
        ? "No ads.txt file was found. Google recommends it, but it is not mandatory for initial approval."
        : adsTxt.message,
      "Once you have a publisher ID, publish the exact authorized-seller record supplied by AdSense.",
      adsTxt.url
    ),
    check(
      "adsense-code",
      "monetization",
      "AdSense code detection",
      "info",
      "advisory",
      adsenseDetected
        ? `AdSense code was detected${publisherIds.length ? ` for ${publisherIds.join(", ")}` : ""}.`
        : "No AdSense script was detected on the homepage.",
      "This is informational: follow the setup tasks shown in your own AdSense account."
    )
  );

  if (adsenseDetected && publisherIds.length > 0 && adsTxt.present) {
    checks.push(
      check(
        "publisher-id",
        "monetization",
        "Publisher ID agrees with ads.txt",
        adsRecordMatches ? "pass" : "fix",
        "important",
        adsRecordMatches
          ? "A detected page publisher ID also appears in the ads.txt preview."
          : "The detected page publisher ID was not found in the ads.txt preview.",
        "Make sure ads.txt contains the exact publisher ID supplied by your AdSense account."
      )
    );
  }

  checks.push(
    check(
      "account-eligibility",
      "monetization",
      "Account and ownership eligibility",
      "review",
      "critical",
      "Only the applicant can confirm age, account status, site ownership, and access to the HTML source.",
      "Confirm the applicant is eligible, owns or controls the site, and has completed every task in AdSense."
    ),
    check(
      "content-policy",
      "monetization",
      "Publisher policy review",
      "review",
      "critical",
      "A crawler cannot reliably prove originality, copyright rights, or the absence of every prohibited or restricted topic.",
      "Review the entire site against the current Google Publisher Policies and Restrictions."
    ),
    check(
      "traffic-quality",
      "monetization",
      "Traffic source quality",
      "review",
      "critical",
      "Public HTML does not reveal whether impressions and clicks come from valid, organic user interest.",
      "Confirm there is no purchased, incentivized, automated, or self-click traffic."
    ),
    check(
      "ad-experience",
      "monetization",
      "Ad placement and user experience",
      "review",
      "important",
      "Final ad density, consent behavior, and placement can only be reviewed after implementation.",
      "Avoid deceptive placements, obstructive pop-ups, and ads that overwhelm or imitate navigation."
    )
  );

  const score = scoreChecks(checks);
  const fixes = checks.filter((item) => item.status === "fix").length;
  const criticalFixes = checks.filter(
    (item) => item.status === "fix" && item.impact === "critical"
  ).length;
  const reviews = checks.filter((item) => item.status === "review").length;
  const informational = checks.filter((item) => item.status === "info").length;
  const passed = checks.filter((item) => item.status === "pass").length;
  const foundationReady =
    criticalFixes === 0 &&
    checks.some(
      (item) => item.id === "content-depth" && item.status === "pass"
    ) &&
    checks.some(
      (item) => item.id === "privacy-disclosure" && item.status === "pass"
    ) &&
    checks.some((item) => item.id === "trust-bundle" && item.status === "pass");
  const verdict =
    score >= 85 && foundationReady
      ? "Strong foundation"
      : score >= 50 && criticalFixes <= 2
        ? "Some work needed"
        : "Not ready yet";

  return {
    success: true,
    domain,
    origin,
    finalUrl: homepage.finalUrl,
    checkedAt: new Date().toISOString(),
    score,
    verdict,
    summary: { passed, fixes, reviews, informational },
    checks,
    trustPages: trustPages.map((page) => ({
      kind: page.kind,
      label: page.label,
      found: page.found,
      url: page.url,
    })),
    sampledPages,
    note:
      "This is a rules-based pre-check of public signals, not an approval prediction. Google makes the final decision and may review pages or account factors this tool cannot access.",
  };
}
