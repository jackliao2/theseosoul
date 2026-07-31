import * as cheerio from "cheerio";
import type {
  CanonicalResult,
  CheckStatus,
  FaviconResult,
  HeadingItem,
  HeadingsResult,
  ImageItem,
  ImagesResult,
  KeywordsResult,
  MetaDescriptionResult,
  MetaTitleResult,
  OpenGraphResult,
  RobotsMetaResult,
  TwitterCardResult,
} from "@/lib/audit/types";

function statusForTitle(length: number, hasContent: boolean): CheckStatus {
  if (!hasContent) return "fail";
  if (length >= 30 && length <= 60) return "pass";
  if (length > 0 && length < 30) return "warn";
  if (length > 60 && length <= 70) return "warn";
  return "fail";
}

function statusForDescription(length: number, hasContent: boolean): CheckStatus {
  if (!hasContent) return "fail";
  if (length >= 120 && length <= 160) return "pass";
  if (length >= 70 && length < 120) return "warn";
  if (length > 160 && length <= 180) return "warn";
  return "fail";
}

export function parseMetaTitle($: cheerio.CheerioAPI): MetaTitleResult {
  const content = $("title").first().text().replace(/\s+/g, " ").trim() || null;
  const length = content?.length ?? 0;
  const status = statusForTitle(length, Boolean(content));

  let message = `The title length (${length} characters) is good.`;
  if (!content) message = "Missing <title> tag.";
  else if (length < 30)
    message = `The title length (${length} characters) is too short. Aim for 30–60.`;
  else if (length > 60)
    message = `The title length (${length} characters) is too long. Aim for 30–60.`;

  return { content, length, idealMax: 60, status, message };
}

export function parseMetaDescription(
  $: cheerio.CheerioAPI
): MetaDescriptionResult {
  const content =
    $('meta[name="description"]').attr("content")?.replace(/\s+/g, " ").trim() ||
    null;
  const length = content?.length ?? 0;
  const status = statusForDescription(length, Boolean(content));

  let message = `The description length (${length} characters) is good.`;
  if (!content) message = "Missing meta description.";
  else if (length < 120)
    message = `The description length (${length} characters) is too short. Aim for 120–160.`;
  else if (length > 160)
    message = `The description length (${length} characters) is too long. Aim for 120–160.`;

  return { content, length, idealMax: 160, status, message };
}

export function parseKeywords($: cheerio.CheerioAPI): KeywordsResult {
  const content =
    $('meta[name="keywords"]').attr("content")?.replace(/\s+/g, " ").trim() ||
    null;

  if (!content) {
    return {
      content: null,
      status: "info",
      message: "No meta keywords tag (optional / largely ignored by Google).",
    };
  }

  return {
    content,
    status: "info",
    message: "Meta keywords present (limited SEO impact).",
  };
}

export function parseFavicon(
  $: cheerio.CheerioAPI,
  baseUrl: string
): FaviconResult {
  const candidates = [
    $('link[rel="icon"]').attr("href"),
    $('link[rel="shortcut icon"]').attr("href"),
    $('link[rel="apple-touch-icon"]').attr("href"),
  ].filter(Boolean) as string[];

  const raw = candidates[0] ?? null;
  let href: string | null = null;

  if (raw) {
    try {
      href = new URL(raw, baseUrl).toString();
    } catch {
      href = raw;
    }
  } else {
    try {
      href = new URL("/favicon.ico", baseUrl).toString();
    } catch {
      href = null;
    }
  }

  return {
    href,
    status: raw ? "pass" : "warn",
    message: raw
      ? "Favicon link detected."
      : "No explicit favicon link; falling back to /favicon.ico.",
  };
}

export function parseRobotsMeta($: cheerio.CheerioAPI): RobotsMetaResult {
  const content =
    $('meta[name="robots"]').attr("content")?.trim() ||
    $('meta[name="googlebot"]').attr("content")?.trim() ||
    null;

  if (!content) {
    return {
      content: null,
      status: "pass",
      message: "No robots meta tag (defaults to index,follow).",
    };
  }

  const lower = content.toLowerCase();
  const blocked = /noindex|none/.test(lower);

  return {
    content,
    status: blocked ? "fail" : "pass",
    message: blocked
      ? `Robots meta restricts indexing: ${content}`
      : `Robots meta: ${content}`,
  };
}

export function parseCanonical(
  $: cheerio.CheerioAPI,
  requestUrl: string
): CanonicalResult {
  const href =
    $('link[rel="canonical"]').attr("href")?.trim() ||
    $('link[rel="Canonical"]').attr("href")?.trim() ||
    null;

  const present = Boolean(href);
  let matchesRequest: boolean | null = null;

  if (href) {
    try {
      const canonical = new URL(href, requestUrl);
      const request = new URL(requestUrl);
      matchesRequest =
        canonical.hostname.replace(/^www\./, "") ===
          request.hostname.replace(/^www\./, "") &&
        canonical.pathname.replace(/\/+$/, "") ===
          request.pathname.replace(/\/+$/, "");
    } catch {
      matchesRequest = false;
    }
  }

  let status: CheckStatus = "pass";
  let message = "Canonical URL is present.";

  if (!present) {
    status = "fail";
    message = "No canonical link tag found.";
  } else if (matchesRequest === false) {
    status = "warn";
    message = "Canonical URL differs from the requested URL.";
  }

  return { href, present, matchesRequest, status, message };
}

export function parseHeadings($: cheerio.CheerioAPI): HeadingsResult {
  const items: HeadingItem[] = [];

  $("h1, h2, h3").each((_, el) => {
    const tag = ($(el).prop("tagName") || "").toLowerCase();
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!text) return;

    const level = Number(tag.replace("h", "")) as 1 | 2 | 3;
    if (level >= 1 && level <= 3) {
      items.push({ level, text: text.slice(0, 200) });
    }
  });

  const h1Count = items.filter((i) => i.level === 1).length;
  const h2Count = items.filter((i) => i.level === 2).length;
  const h3Count = items.filter((i) => i.level === 3).length;

  let h1Status: CheckStatus = "pass";
  let h1Message = `Found ${h1Count} H1 tag.`;
  if (h1Count === 0) {
    h1Status = "fail";
    h1Message = "No H1 heading found on the page.";
  } else if (h1Count === 1) {
    h1Status = "pass";
    h1Message = "Exactly one H1 tag found.";
  } else {
    h1Status = "warn";
    h1Message = `Found ${h1Count} H1 tags. Prefer a single primary H1.`;
  }

  let h2Status: CheckStatus = "pass";
  let h2Message = `Found ${h2Count} H2 tags.`;
  if (h2Count === 0) {
    h2Status = "warn";
    h2Message = "No H2 headings found.";
  }

  let h3Status: CheckStatus = "pass";
  let h3Message = `Found ${h3Count} H3 tags.`;
  if (h3Count === 0) {
    h3Status = "info";
    h3Message = "No H3 headings found.";
  }

  let status: CheckStatus = "pass";
  let message = "Heading structure looks healthy.";
  if (h1Status === "fail") {
    status = "fail";
    message = h1Message;
  } else if (h1Status === "warn" || h2Status === "warn") {
    status = "warn";
    message = h1Status === "warn" ? h1Message : h2Message;
  }

  return {
    h1Count,
    h2Count,
    h3Count,
    items: items.slice(0, 80),
    status,
    message,
    h1Status,
    h1Message,
    h2Status,
    h2Message,
    h3Status,
    h3Message,
  };
}

export function parseImages($: cheerio.CheerioAPI): ImagesResult {
  const items: ImageItem[] = [];
  let missingAlt = 0;
  let missingTitle = 0;

  $("img").each((_, el) => {
    const src = ($(el).attr("src") || $(el).attr("data-src") || "").trim();
    const altAttr = $(el).attr("alt");
    const titleAttr = $(el).attr("title");
    const missing = altAttr === undefined || altAttr.trim() === "";
    if (missing) missingAlt += 1;
    if (titleAttr === undefined || titleAttr.trim() === "") missingTitle += 1;
    items.push({
      src: src.slice(0, 300),
      alt: altAttr?.trim() || null,
      title: titleAttr?.trim() || null,
      missingAlt: missing,
    });
  });

  const total = items.length;
  const unique = new Set(items.map((item) => item.src).filter(Boolean)).size;
  const withAlt = total - missingAlt;
  let status: CheckStatus = "pass";
  let message = "All images include alt attributes.";

  if (total === 0) {
    status = "info";
    message = "No images detected on the page.";
  } else if (missingAlt > 0) {
    const ratio = missingAlt / total;
    status = ratio > 0.25 ? "fail" : "warn";
    message = `${missingAlt} of ${total} images are missing alt text.`;
  }

  return {
    total,
    unique,
    missingAlt,
    missingTitle,
    withAlt,
    items: items.slice(0, 100),
    status,
    message,
  };
}

export function parseOpenGraph($: cheerio.CheerioAPI): OpenGraphResult {
  const tags: Record<string, string> = {};
  const keys = [
    "og:title",
    "og:description",
    "og:image",
    "og:url",
    "og:type",
    "og:site_name",
  ];

  for (const key of keys) {
    const value = $(`meta[property="${key}"]`).attr("content")?.trim();
    if (value) tags[key] = value;
  }

  const present = Object.keys(tags).length > 0;
  const required = ["og:title", "og:description", "og:image"].every(
    (k) => Boolean(tags[k])
  );

  let status: CheckStatus = "pass";
  let message = "Core Open Graph tags are present.";

  if (!present) {
    status = "fail";
    message = "No Open Graph tags found.";
  } else if (!required) {
    status = "warn";
    message = "Some recommended Open Graph tags are missing.";
  }

  return { present, tags, status, message };
}

export function parseTwitterCards($: cheerio.CheerioAPI): TwitterCardResult {
  const tags: Record<string, string> = {};
  const keys = [
    "twitter:card",
    "twitter:title",
    "twitter:description",
    "twitter:image",
    "twitter:site",
  ];

  for (const key of keys) {
    const value =
      $(`meta[name="${key}"]`).attr("content")?.trim() ||
      $(`meta[property="${key}"]`).attr("content")?.trim();
    if (value) tags[key] = value;
  }

  const present = Object.keys(tags).length > 0;
  let status: CheckStatus = "pass";
  let message = "Twitter Card tags are present.";

  if (!present) {
    status = "warn";
    message = "No Twitter Card tags found.";
  } else if (!tags["twitter:card"]) {
    status = "warn";
    message = "Twitter Card tags incomplete (missing twitter:card).";
  }

  return { present, tags, status, message };
}

export function loadDocument(html: string): cheerio.CheerioAPI {
  return cheerio.load(html);
}
