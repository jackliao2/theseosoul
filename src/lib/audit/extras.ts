import type * as cheerio from "cheerio";
import { fetchText } from "@/lib/audit/fetch";
import { probeDns, probeSsl } from "@/lib/audit/probe";
import {
  detectPwa,
  detectSchemaFlags,
  sniffStack,
  sniffTrackers,
  textHtmlRatio,
  titleH1Overlap,
} from "@/lib/audit/sniff";
import type {
  CheckStatus,
  MixedContentItem,
  RedirectHop,
  SiteExtras,
  TextFileCheck,
} from "@/lib/audit/types";

const SECURITY_CHECKS = [
  { id: "hsts", header: "strict-transport-security", label: "HSTS" },
  { id: "xcto", header: "x-content-type-options", label: "X-Content-Type" },
  { id: "csp", header: "content-security-policy", label: "CSP" },
  { id: "xfo", header: "x-frame-options", label: "X-Frame-Options" },
  { id: "rp", header: "referrer-policy", label: "Referrer-Policy" },
] as const;

export function parseExcerpt($: cheerio.CheerioAPI): string | null {
  const candidates = $("main p, article p, .content p, #content p, p")
    .toArray()
    .map((el) =>
      $(el)
        .text()
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((t) => t.length >= 60 && t.length <= 400);

  return candidates[0] ?? null;
}

export function readingMinutes(wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.max(1, Math.round(wordCount / 220));
}

export function analyzeSecurity(
  headers: Record<string, string>,
  hasHttps: boolean
): SiteExtras["security"] {
  const checks = SECURITY_CHECKS.map((item) => ({
    id: item.id,
    label: item.label,
    present: Boolean(headers[item.header]),
  }));

  const presentCount =
    checks.filter((c) => c.present).length + (hasHttps ? 1 : 0);
  const max = checks.length + 1;
  const score = Math.round((presentCount / max) * 100);

  return {
    score,
    https: hasHttps,
    checks,
  };
}

function looksLikeHtml(content: string): boolean {
  return /<\s*html|<\s*body|<!doctype/i.test(content.slice(0, 400));
}

async function checkTextFile(
  origin: string,
  path: string,
  opts: {
    missingMessage: string;
    presentMessage: string;
    validate?: (content: string) => { ok: boolean; note: string };
    optional?: boolean;
  }
): Promise<TextFileCheck> {
  const url = new URL(path, origin).toString();
  const content = await fetchText(url, 5_000);

  if (!content || content.trim().length < 4 || looksLikeHtml(content)) {
    return {
      present: false,
      url,
      status: opts.optional ? "info" : "warn",
      message: opts.missingMessage,
      preview: null,
      bytes: 0,
      lineCount: 0,
    };
  }

  const trimmed = content.trim();
  const validation = opts.validate?.(trimmed) ?? { ok: true, note: "" };
  const preview = trimmed.replace(/\s+/g, " ").slice(0, 220);
  const lineCount = trimmed.split(/\r?\n/).filter((l) => l.trim()).length;
  const status: CheckStatus = validation.ok ? "pass" : "warn";

  return {
    present: true,
    url,
    status,
    message: validation.ok
      ? opts.presentMessage
      : `${opts.presentMessage.replace(/\.$/, "")} — ${validation.note}`,
    preview,
    bytes: Buffer.byteLength(content, "utf8"),
    lineCount,
  };
}

export async function checkLlmsTxt(origin: string): Promise<TextFileCheck> {
  return checkTextFile(origin, "/llms.txt", {
    missingMessage: "No llms.txt found — AI tools have no curated site summary.",
    presentMessage: "llms.txt present — helpful for AI assistants and GEO.",
    validate: (c) =>
      c.length >= 40
        ? { ok: true, note: "" }
        : { ok: false, note: "file looks very short." },
  });
}

export async function checkAdsTxt(origin: string): Promise<TextFileCheck> {
  return checkTextFile(origin, "/ads.txt", {
    missingMessage:
      "No ads.txt — fine if you don’t sell ads; publishers should add one.",
    presentMessage: "ads.txt present.",
    optional: true,
    validate: (c) => {
      const records = c
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"));
      const ok = records.some((l) => l.split(",").length >= 3);
      return ok
        ? { ok: true, note: "" }
        : {
            ok: false,
            note: "no valid publisher records (domain, publisher id, relationship).",
          };
    },
  });
}

export async function checkHumansTxt(origin: string): Promise<TextFileCheck> {
  return checkTextFile(origin, "/humans.txt", {
    missingMessage: "No humans.txt (optional credits / team file).",
    presentMessage: "humans.txt present.",
    optional: true,
  });
}

export async function checkSecurityTxt(origin: string): Promise<TextFileCheck> {
  const validate = (c: string) =>
    /contact:/i.test(c)
      ? { ok: true, note: "" }
      : { ok: false, note: "missing Contact: field." };

  const [primary, fallback] = await Promise.all([
    checkTextFile(origin, "/.well-known/security.txt", {
      missingMessage: "No security.txt (optional vulnerability contact file).",
      presentMessage: "security.txt present.",
      optional: true,
      validate,
    }),
    checkTextFile(origin, "/security.txt", {
      missingMessage: "No security.txt (optional vulnerability contact file).",
      presentMessage: "security.txt present.",
      optional: true,
      validate,
    }),
  ]);
  return primary.present ? primary : fallback;
}

/** Scan page HTML for http:// asset URLs on an HTTPS page. */
export function scanMixedContent(
  $: cheerio.CheerioAPI,
  pageUrl: string
): SiteExtras["mixedContent"] {
  let pageIsHttps = false;
  try {
    pageIsHttps = new URL(pageUrl).protocol === "https:";
  } catch {
    pageIsHttps = false;
  }

  if (!pageIsHttps) {
    return {
      applicable: false,
      count: 0,
      status: "info",
      message: "Page is not HTTPS — mixed content check skipped.",
      items: [],
    };
  }

  const found = new Map<string, MixedContentItem>();

  const push = (raw: string | undefined, kind: MixedContentItem["kind"]) => {
    if (!raw) return;
    const value = raw.trim();
    if (!value || value.startsWith("data:") || value.startsWith("//")) return;

    let absolute: string;
    try {
      absolute = new URL(value, pageUrl).toString();
    } catch {
      return;
    }

    if (!absolute.toLowerCase().startsWith("http://")) return;
    if (found.has(absolute)) return;

    found.set(absolute, { url: absolute, kind });
  };

  $("img[src]").each((_, el) => push($(el).attr("src"), "image"));
  $("img[srcset], source[srcset]").each((_, el) => {
    const srcset = $(el).attr("srcset") || "";
    for (const part of srcset.split(",")) {
      push(part.trim().split(/\s+/)[0], "image");
    }
  });
  $("script[src]").each((_, el) => push($(el).attr("src"), "script"));
  $('link[href]').each((_, el) => {
    const rel = ($(el).attr("rel") || "").toLowerCase();
    if (
      rel.includes("stylesheet") ||
      rel.includes("preload") ||
      rel.includes("icon")
    ) {
      push($(el).attr("href"), "stylesheet");
    }
  });
  $("iframe[src]").each((_, el) => push($(el).attr("src"), "iframe"));
  $("video[src], audio[src], source[src], embed[src]").each((_, el) =>
    push($(el).attr("src"), "media")
  );
  $("object[data]").each((_, el) => push($(el).attr("data"), "media"));
  $("[style*='http://']").each((_, el) => {
    const style = $(el).attr("style") || "";
    const match = style.match(/url\(\s*['"]?(http:\/\/[^'")\s]+)/i);
    if (match?.[1]) push(match[1], "other");
  });

  const items = Array.from(found.values()).slice(0, 40);
  const count = found.size;

  if (count === 0) {
    return {
      applicable: true,
      count: 0,
      status: "pass",
      message: "No mixed-content http:// assets found on this HTTPS page.",
      items: [],
    };
  }

  return {
    applicable: true,
    count,
    status: count >= 5 ? "fail" : "warn",
    message: `Found ${count} http:// asset(s) on an HTTPS page (mixed content).`,
    items,
  };
}

export function detectFaqSchema(
  types: string[],
  $: cheerio.CheerioAPI
): SiteExtras["faqSchema"] {
  const normalized = types.map((t) => t.toLowerCase());
  const hasFaqPage = normalized.some(
    (t) => t === "faqpage" || t.endsWith("/faqpage")
  );
  const hasQuestion = normalized.some(
    (t) => t === "question" || t.endsWith("/question")
  );

  let questionCount = 0;
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text().trim();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as unknown;
      questionCount += countFaqQuestions(parsed);
    } catch {
      // ignore
    }
  });

  // Microdata FAQ
  if (questionCount === 0) {
    $('[itemtype*="FAQPage"], [itemtype*="Question"]').each(() => {
      questionCount += 1;
    });
  }

  const present = hasFaqPage || hasQuestion || questionCount > 0;
  if (!present) {
    return {
      present: false,
      questionCount: 0,
      status: "info",
      message: "No FAQ schema (FAQPage / Question) detected.",
    };
  }

  return {
    present: true,
    questionCount,
    status: questionCount >= 2 || hasFaqPage ? "pass" : "warn",
    message: hasFaqPage
      ? `FAQPage schema found${questionCount ? ` · ${questionCount} question(s)` : ""}.`
      : `Question schema found · ${questionCount || "?"} item(s).`,
  };
}

function countFaqQuestions(node: unknown): number {
  if (!node || typeof node !== "object") return 0;
  if (Array.isArray(node)) {
    return node.reduce<number>((sum, item) => sum + countFaqQuestions(item), 0);
  }

  const obj = node as Record<string, unknown>;
  const typeVal = obj["@type"];
  const types = Array.isArray(typeVal)
    ? typeVal.filter((t): t is string => typeof t === "string")
    : typeof typeVal === "string"
      ? [typeVal]
      : [];

  const isFaqPage = types.some((t) => /faqpage$/i.test(t));
  const isQuestion = types.some((t) => /question$/i.test(t));

  if (isFaqPage) {
    if (Array.isArray(obj.mainEntity)) return obj.mainEntity.length;
    if (obj.mainEntity) return Math.max(1, countFaqQuestions(obj.mainEntity));
  }

  if (isQuestion) return 1;

  let count = 0;
  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") count += countFaqQuestions(value);
  }
  return count;
}

export async function buildSiteExtras(input: {
  $: cheerio.CheerioAPI;
  html: string;
  origin: string;
  hostname: string;
  domain: string;
  wordCount: number;
  headers: Record<string, string>;
  hasHttps: boolean;
  requestedUrl: string;
  finalUrl: string;
  schemaTypes: string[];
  redirectChain: RedirectHop[];
  title: string | null;
  h1Texts: string[];
}): Promise<SiteExtras> {
  const ratio = textHtmlRatio(input.html, input.wordCount);

  const sslFallback = {
    available: false,
    validTo: null,
    daysRemaining: null,
    issuer: null,
    status: "info" as const,
    message: "TLS probe skipped (non-HTTPS).",
  };

  const [
    llmsTxt,
    adsTxt,
    humansTxt,
    securityTxt,
    ssl,
    dns,
  ] = await Promise.all([
    checkLlmsTxt(input.origin),
    checkAdsTxt(input.origin),
    checkHumansTxt(input.origin),
    checkSecurityTxt(input.origin),
    input.hasHttps
      ? probeSsl(input.hostname).catch(() => ({
          ...sslFallback,
          status: "warn" as const,
          message: "TLS probe failed — skipped without blocking the audit.",
        }))
      : Promise.resolve(sslFallback),
    probeDns(input.domain).catch(() => ({
      available: false,
      a: [] as string[],
      aaaa: [] as string[],
      mx: [] as string[],
      ns: [] as string[],
      spf: null,
      dmarc: null,
      status: "warn" as const,
      message: "DNS probe failed — skipped without blocking the audit.",
    })),
  ]);

  const redirected =
    input.redirectChain.length > 1 ||
    normalizeComparable(input.requestedUrl) !==
      normalizeComparable(input.finalUrl);

  return {
    excerpt: parseExcerpt(input.$),
    readingMinutes: readingMinutes(input.wordCount),
    llmsTxt,
    adsTxt,
    humansTxt,
    securityTxt,
    faqSchema: detectFaqSchema(input.schemaTypes, input.$),
    mixedContent: scanMixedContent(input.$, input.finalUrl),
    security: analyzeSecurity(input.headers, input.hasHttps),
    redirected,
    requestedUrl: input.requestedUrl,
    redirectChain: input.redirectChain,
    ssl,
    dns,
    stack: sniffStack(input.html, input.headers, input.$),
    trackers: sniffTrackers(input.html),
    textHtmlRatio: ratio.ratio,
    textHtmlStatus: ratio.status,
    textHtmlMessage: ratio.message,
    pwa: detectPwa(input.$, input.origin),
    schemaFlags: detectSchemaFlags(input.schemaTypes),
    titleH1: titleH1Overlap(input.title, input.h1Texts),
  };
}

function normalizeComparable(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}${u.pathname.replace(/\/$/, "")}${u.search}`;
  } catch {
    return url;
  }
}
