import type * as cheerio from "cheerio";
import type { CheckStatus, PwaSignals, SchemaFlags } from "@/lib/audit/types";

const STACK_RULES: Array<{ id: string; test: (html: string, headers: Record<string, string>, $: cheerio.CheerioAPI) => boolean }> = [
  { id: "WordPress", test: (h) => /wp-content|wp-includes|wordpress/i.test(h) },
  { id: "Shopify", test: (h) => /cdn\.shopify\.com|Shopify\.theme/i.test(h) },
  { id: "Next.js", test: (h) => /_next\/static|__NEXT_DATA__/i.test(h) },
  { id: "Nuxt", test: (h) => /_nuxt\//i.test(h) },
  { id: "Webflow", test: (h) => /webflow/i.test(h) },
  { id: "Squarespace", test: (h) => /squarespace/i.test(h) },
  { id: "Wix", test: (h) => /static\.wixstatic\.com|wix\.com/i.test(h) },
  { id: "Drupal", test: (h) => /drupal/i.test(h) || /name="Generator"[^>]*Drupal/i.test(h) },
  { id: "React", test: (h) => /react(?:-dom)?[.-]/i.test(h) || /data-reactroot/i.test(h) },
  { id: "Vue", test: (h) => /vue(?:\.runtime)?(?:\.min)?\.js/i.test(h) },
  { id: "Cloudflare", test: (_h, headers) => Boolean(headers.server?.match(/cloudflare/i) || headers["cf-ray"]) },
  { id: "Vercel", test: (_h, headers) => Boolean(headers.server?.match(/vercel/i) || headers["x-vercel-id"]) },
  { id: "Netlify", test: (_h, headers) => Boolean(headers.server?.match(/netlify/i)) },
  {
    id: "Google Tag Manager",
    test: (h) => /googletagmanager\.com\/gtm\.js/i.test(h),
  },
];

const TRACKER_RULES: Array<{ id: string; pattern: RegExp }> = [
  { id: "Google Analytics", pattern: /google-analytics\.com|gtag\/js|googletagmanager\.com\/gtag/i },
  {
    id: "Google AdSense",
    pattern: /pagead2\.googlesyndication\.com|adsbygoogle/i,
  },
  { id: "GTM", pattern: /googletagmanager\.com\/gtm\.js/i },
  { id: "Meta Pixel", pattern: /connect\.facebook\.net|fbevents\.js/i },
  { id: "TikTok Pixel", pattern: /analytics\.tiktok\.com/i },
  { id: "Hotjar", pattern: /static\.hotjar\.com|hotjar/i },
  { id: "Clarity", pattern: /clarity\.ms/i },
  { id: "LinkedIn Insight", pattern: /snap\.licdn\.com|linkedin\.com\/px/i },
  { id: "HubSpot", pattern: /js\.hs-scripts\.com|hs-analytics/i },
];

export function sniffStack(
  html: string,
  headers: Record<string, string>,
  $: cheerio.CheerioAPI
): string[] {
  const found: string[] = [];
  for (const rule of STACK_RULES) {
    if (rule.test(html, headers, $)) found.push(rule.id);
  }
  const generator = $('meta[name="generator"]').attr("content")?.trim();
  if (generator && !found.some((f) => generator.toLowerCase().includes(f.toLowerCase()))) {
    found.push(generator.split(/[,\s]/)[0].slice(0, 40));
  }
  return Array.from(new Set(found)).slice(0, 10);
}

export function sniffTrackers(html: string): string[] {
  return TRACKER_RULES.filter((r) => r.pattern.test(html)).map((r) => r.id);
}

export function textHtmlRatio(html: string, wordCount: number): {
  ratio: number;
  status: CheckStatus;
  message: string;
} {
  const bytes = Buffer.byteLength(html, "utf8") || 1;
  const textBytes = Math.max(0, wordCount) * 5;
  const ratio = Math.round((textBytes / bytes) * 1000) / 10;

  let status: CheckStatus = "pass";
  let message = `Text≈${ratio}% of HTML size (${wordCount} words / ${bytes} bytes).`;
  if (ratio < 5) {
    status = "warn";
    message = `Very low text-to-HTML ratio (${ratio}%) — page may be script-heavy.`;
  } else if (ratio < 10) {
    status = "info";
    message = `Low text-to-HTML ratio (${ratio}%).`;
  }

  return { ratio, status, message };
}

export function detectPwa($: cheerio.CheerioAPI, origin: string): PwaSignals {
  const manifestHref =
    $('link[rel="manifest"]').attr("href")?.trim() ||
    $('link[rel="Manifest"]').attr("href")?.trim() ||
    null;

  let manifestUrl: string | null = null;
  if (manifestHref) {
    try {
      manifestUrl = new URL(manifestHref, origin).toString();
    } catch {
      manifestUrl = manifestHref;
    }
  }

  const appleTouchIcon = $('link[rel="apple-touch-icon"]').length > 0;
  const present = Boolean(manifestUrl) || appleTouchIcon;

  return {
    present,
    manifestUrl,
    appleTouchIcon,
    status: manifestUrl ? "pass" : appleTouchIcon ? "info" : "info",
    message: manifestUrl
      ? "Web app manifest linked."
      : appleTouchIcon
        ? "apple-touch-icon present; no manifest link."
        : "No PWA manifest / apple-touch-icon detected.",
  };
}

export function detectSchemaFlags(types: string[]): SchemaFlags {
  const norm = types.map((t) => t.toLowerCase());
  const has = (name: string) =>
    norm.some((t) => t === name || t.endsWith(`/${name}`));

  return {
    breadcrumb: has("breadcrumblist"),
    organization: has("organization") || has("localbusiness"),
    website: has("website"),
    faq: has("faqpage") || has("question"),
  };
}

export function titleH1Overlap(
  title: string | null,
  h1Texts: string[]
): {
  score: number | null;
  status: CheckStatus;
  message: string;
} {
  if (!title || h1Texts.length === 0) {
    return {
      score: null,
      status: "info",
      message: "Need both title and H1 to compare overlap.",
    };
  }

  const titleTokens = tokenize(title);
  const h1Tokens = new Set(h1Texts.flatMap(tokenize));
  if (titleTokens.length === 0) {
    return { score: null, status: "info", message: "Title has no usable tokens." };
  }

  const hit = titleTokens.filter((t) => h1Tokens.has(t)).length;
  const score = Math.round((hit / titleTokens.length) * 100);

  let status: CheckStatus = "pass";
  let message = `Title↔H1 token overlap ${score}%.`;
  if (score < 20) {
    status = "warn";
    message = `Low title↔H1 overlap (${score}%) — they may target different topics.`;
  } else if (score < 40) {
    status = "info";
    message = `Moderate title↔H1 overlap (${score}%).`;
  }

  return { score, status, message };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3);
}
