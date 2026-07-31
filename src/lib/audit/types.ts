export type CheckStatus = "pass" | "fail" | "warn" | "info";

export type SeoGrade = "A" | "B" | "C" | "D" | "F";

/** Primary dashboard tabs (merged groups — not a 1:1 AITDK clone). */
export type AuditTabId =
  | "overview"
  | "soul"
  | "issues"
  | "structure"
  | "keywords"
  | "signals"
  | "geo"
  | "domain"
  | "insights";

/** Legacy ?tab= values still accepted and remapped. */
export type LegacyAuditTabId =
  | "traffic"
  | "backlinks"
  | "serp"
  | "density"
  | "headings"
  | "images"
  | "links"
  | "social"
  | "hreflangs"
  | "structured"
  | "tech"
  | "whois"
  | "settings";

export interface MetaTitleResult {
  content: string | null;
  length: number;
  idealMax: number;
  status: CheckStatus;
  message: string;
}

export interface MetaDescriptionResult {
  content: string | null;
  length: number;
  idealMax: number;
  status: CheckStatus;
  message: string;
}

export interface CanonicalResult {
  href: string | null;
  present: boolean;
  matchesRequest: boolean | null;
  status: CheckStatus;
  message: string;
}

export interface HeadingItem {
  level: 1 | 2 | 3;
  text: string;
}

export interface HeadingsResult {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  items: HeadingItem[];
  status: CheckStatus;
  message: string;
  h1Status: CheckStatus;
  h1Message: string;
  h2Status: CheckStatus;
  h2Message: string;
  h3Status: CheckStatus;
  h3Message: string;
}

export interface ImageItem {
  src: string;
  alt: string | null;
  title?: string | null;
  missingAlt: boolean;
}

export interface ImagesResult {
  total: number;
  unique?: number;
  missingAlt: number;
  missingTitle?: number;
  withAlt: number;
  items: ImageItem[];
  status: CheckStatus;
  message: string;
}

export interface OpenGraphResult {
  present: boolean;
  tags: Record<string, string>;
  status: CheckStatus;
  message: string;
}

export interface TwitterCardResult {
  present: boolean;
  tags: Record<string, string>;
  status: CheckStatus;
  message: string;
}

export interface SocialResult {
  openGraph: OpenGraphResult;
  twitter: TwitterCardResult;
  status: CheckStatus;
  message: string;
}

export interface AiCrawlerCheck {
  name: string;
  userAgent: string;
  mentioned: boolean;
  blocked: boolean;
  status: CheckStatus;
  message: string;
}

export interface RobotsResult {
  present: boolean;
  url: string;
  content: string | null;
  allowsIndexing: boolean | null;
  sitemapDirectives: string[];
  aiCrawlers: AiCrawlerCheck[];
  status: CheckStatus;
  message: string;
}

export interface KeywordsResult {
  content: string | null;
  status: CheckStatus;
  message: string;
}

export interface FaviconResult {
  href: string | null;
  status: CheckStatus;
  message: string;
}

export interface RobotsMetaResult {
  content: string | null;
  status: CheckStatus;
  message: string;
}

export interface LinkItem {
  href: string;
  text: string;
  internal: boolean;
  nofollow: boolean;
}

export interface LinksResult {
  total: number;
  unique?: number;
  internal: number;
  external: number;
  nofollow: number;
  items: LinkItem[];
  status: CheckStatus;
  message: string;
}

export interface HreflangItem {
  lang: string;
  href: string;
}

export interface HreflangsResult {
  total: number;
  items: HreflangItem[];
  status: CheckStatus;
  message: string;
}

export interface StructuredDataResult {
  jsonLdCount: number;
  types: string[];
  hasMicrodata: boolean;
  snippets: string[];
  status: CheckStatus;
  message: string;
}

export interface DensityKeyword {
  keyword: string;
  count: number;
  total: number;
  density: number;
}

export interface DensityResult {
  totalWords: number;
  byNgram: Record<1 | 2 | 3 | 4 | 5, DensityKeyword[]>;
  status: CheckStatus;
  message: string;
}

export interface GeoCategoryScore {
  id: string;
  label: string;
  score: number;
  status: CheckStatus;
  checks: Array<{
    id: string;
    title: string;
    message: string;
    status: CheckStatus;
  }>;
}

export interface GeoScoreResult {
  score: number;
  grade: SeoGrade;
  label: string;
  passed: number;
  warnings: number;
  failed: number;
  categories: GeoCategoryScore[];
  status: CheckStatus;
  message: string;
}

export interface PageTechResult {
  charset: string | null;
  viewport: string | null;
  lang: string | null;
  generator: string | null;
  htmlBytes: number;
  scriptCount: number;
  stylesheetCount: number;
  hasHttps: boolean;
  sitemapUrl: string;
  sitemapPresent: boolean;
  sitemapSamples: string[];
  headers: Record<string, string>;
  xRobotsTag: string | null;
  status: CheckStatus;
  message: string;
}

export interface RedirectHop {
  url: string;
  status: number;
}

export interface SslProbe {
  available: boolean;
  validTo: string | null;
  daysRemaining: number | null;
  issuer: string | null;
  status: CheckStatus;
  message: string;
}

export interface DnsProbe {
  available: boolean;
  a: string[];
  aaaa: string[];
  mx: string[];
  ns: string[];
  spf: string | null;
  dmarc: string | null;
  status: CheckStatus;
  message: string;
}

export interface PwaSignals {
  present: boolean;
  manifestUrl: string | null;
  appleTouchIcon: boolean;
  status: CheckStatus;
  message: string;
}

export interface SchemaFlags {
  breadcrumb: boolean;
  organization: boolean;
  website: boolean;
  faq: boolean;
}

export interface TextFileCheck {
  present: boolean;
  url: string;
  status: CheckStatus;
  message: string;
  preview: string | null;
  bytes: number;
  lineCount: number;
}

export interface MixedContentItem {
  url: string;
  kind: "image" | "script" | "stylesheet" | "iframe" | "media" | "other";
}

/** Free extras most AITDK-style tools skip — no paid APIs. */
export interface SiteExtras {
  excerpt: string | null;
  readingMinutes: number;
  llmsTxt: TextFileCheck;
  adsTxt: TextFileCheck;
  humansTxt: TextFileCheck;
  securityTxt: TextFileCheck;
  faqSchema: {
    present: boolean;
    questionCount: number;
    status: CheckStatus;
    message: string;
  };
  mixedContent: {
    applicable: boolean;
    count: number;
    status: CheckStatus;
    message: string;
    items: MixedContentItem[];
  };
  security: {
    score: number;
    https: boolean;
    checks: Array<{ id: string; label: string; present: boolean }>;
  };
  redirected: boolean;
  requestedUrl: string;
  redirectChain: RedirectHop[];
  ssl: SslProbe;
  dns: DnsProbe;
  stack: string[];
  trackers: string[];
  textHtmlRatio: number;
  textHtmlStatus: CheckStatus;
  textHtmlMessage: string;
  pwa: PwaSignals;
  schemaFlags: SchemaFlags;
  titleH1: {
    score: number | null;
    status: CheckStatus;
    message: string;
  };
}

export interface WhoisResult {
  domain: string;
  createdAt: string | null;
  expiresAt: string | null;
  updatedAt: string | null;
  registrar: string | null;
  status: string[];
  nameServers: string[];
  ageYears: number | null;
  available: boolean;
  source: "rdap" | "none";
  checkStatus: CheckStatus;
  message: string;
}

export interface IssueCheckCard {
  id: string;
  title: string;
  description: string;
  status: CheckStatus;
  /** Why this matters for SEO / GEO */
  why: string;
  /** Concrete fix guidance */
  fix: string;
}

export interface AuditIssue {
  id: string;
  category: "on-page" | "technical" | "geo" | "overview";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
}

export interface AuditResult {
  success: true;
  domain: string;
  url: string;
  fetchedAt: string;
  score: number;
  grade: SeoGrade;
  title: MetaTitleResult;
  description: MetaDescriptionResult;
  keywords: KeywordsResult;
  favicon: FaviconResult;
  robotsMeta: RobotsMetaResult;
  canonical: CanonicalResult;
  headings: HeadingsResult;
  images: ImagesResult;
  openGraph: OpenGraphResult;
  social: SocialResult;
  links: LinksResult;
  hreflangs: HreflangsResult;
  structured: StructuredDataResult;
  density: DensityResult;
  geo: GeoScoreResult;
  tech: PageTechResult;
  whois: WhoisResult;
  extras: SiteExtras;
  issueChecks: IssueCheckCard[];
  robots: RobotsResult;
  issues: AuditIssue[];
  summary: string;
}

export interface AuditErrorResult {
  success: false;
  domain: string;
  url: string | null;
  error: string;
  code:
    | "INVALID_URL"
    | "TIMEOUT"
    | "UNREACHABLE"
    | "PARSE_ERROR"
    | "RATE_LIMITED"
    | "UNKNOWN";
}

export type AuditResponse = AuditResult | AuditErrorResult;

function resolveSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  // Vercel production hostname (stable) → preview deployment URL
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prod) return `https://${prod.replace(/^https?:\/\//, "")}`;
  const preview = process.env.VERCEL_URL?.trim();
  if (preview) return `https://${preview.replace(/^https?:\/\//, "")}`;
  return "https://theseosoul.com";
}

export const SITE_URL = resolveSiteUrl();
/** Canonical brand string — UI wordmark renders The + Seo + Soul. */
export const SITE_NAME = "TheSeoSoul";
export const SITE_HOST = (() => {
  try {
    return new URL(SITE_URL).hostname.replace(/^www\./, "");
  } catch {
    return "theseosoul.com";
  }
})();
export const SITE_EMAIL = "hello@theseosoul.com";

/** Domains allowed in sitemap + default indexable audit pages. */
export const INDEXABLE_AUDIT_DOMAINS = [
  "shopify.com",
  "stripe.com",
  "notion.so",
  "vercel.com",
  "github.com",
  "cloudflare.com",
] as const;
