import { SITE_URL } from "@/lib/audit/types";

/**
 * Normalize a user-provided URL or bare domain into a canonical https URL.
 * Handles missing protocol, trailing slashes, and lowercase hostnames.
 * Preserves path and query (hash stripped).
 */
export function normalizeUrl(input: string): {
  url: string;
  domain: string;
  hostname: string;
} {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("URL is required");
  }

  let candidate = trimmed;

  // Strip common prefixes users paste
  candidate = candidate.replace(/^\/+/, "");

  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("Invalid URL format");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported");
  }

  const hostname = parsed.hostname.toLowerCase();

  if (!hostname || !hostname.includes(".")) {
    throw new Error("Please enter a valid domain (e.g. shopify.com)");
  }

  // Reject obvious non-domains / localhost for production audits
  if (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)
  ) {
    throw new Error("Please enter a public website domain");
  }

  parsed.protocol = "https:";
  parsed.hostname = hostname;
  parsed.hash = "";

  // Normalize path: root stays as origin without trailing slash noise
  const pathname =
    parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/+$/, "");

  const url = `${parsed.origin}${pathname}${parsed.search}`;
  const domain = hostname.replace(/^www\./, "");

  return { url, domain, hostname };
}

/**
 * Shareable audit path segment(s) after /audit/
 * e.g. "stripe.com" or "stripe.com/docs"
 * Query strings are omitted from the pretty share URL (path is enough for SEO tests).
 */
export function auditShareSlug(input: {
  domain: string;
  url: string;
}): string {
  try {
    const parsed = new URL(input.url);
    const pathname =
      parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/+$/, "");
    const domain = input.domain.replace(/^www\./, "");
    return pathname ? `${domain}${pathname}` : domain;
  } catch {
    return input.domain.replace(/^www\./, "");
  }
}

/** Absolute canonical report URL for sharing / metadata. */
export function auditCanonicalUrl(
  input: string | { domain: string; url: string }
): string {
  if (typeof input === "string") {
    const domain = input.replace(/^www\./, "");
    return `${SITE_URL}/audit/${domain}`;
  }
  return `${SITE_URL}/audit/${auditShareSlug(input)}`;
}

/** Client/router path: /audit/example.com or /audit/example.com/blog */
export function auditHref(input: {
  domain: string;
  url: string;
}): string {
  return `/audit/${auditShareSlug(input)}`;
}

/**
 * Convert a route param like "shopify.com" into audit inputs.
 * Prefer {@link targetFromSegments} for catch-all routes.
 * Does not lowercase path segments (host casing is normalized in normalizeUrl).
 */
export function domainFromParam(param: string): {
  url: string;
  domain: string;
  hostname: string;
} {
  const decoded = decodeURIComponent(param).trim();
  return normalizeUrl(decoded);
}

/** Build /audit/... href from a tool result domain + preferred live URL. */
export function auditReportHref(
  domain: string,
  preferredUrl?: string | null
): string {
  if (preferredUrl) {
    try {
      return auditHref(normalizeUrl(preferredUrl));
    } catch {
      /* fall through */
    }
  }
  return `/audit/${domain.replace(/^www\./, "")}`;
}

/** Join catch-all [...target] segments into a normalizable host[/path]. */
export function targetFromSegments(segments: string[]): {
  url: string;
  domain: string;
  hostname: string;
} {
  if (!segments.length) {
    throw new Error("URL is required");
  }
  const joined = segments
    .map((s) => decodeURIComponent(s).trim())
    .filter(Boolean)
    .join("/");
  return normalizeUrl(joined);
}

export function isValidDomainParam(param: string): boolean {
  try {
    domainFromParam(param);
    return true;
  } catch {
    return false;
  }
}

export function isValidAuditTarget(segments: string[]): boolean {
  try {
    targetFromSegments(segments);
    return true;
  } catch {
    return false;
  }
}

/** Cache key must distinguish path audits on the same host. */
export function auditCacheKey(url: string, domain: string): string {
  try {
    const parsed = new URL(url);
    const path =
      parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/+$/, "");
    const search = parsed.search;
    return `audit:${domain.toLowerCase()}${path}${search}`;
  } catch {
    return `audit:${domain.toLowerCase()}`;
  }
}
