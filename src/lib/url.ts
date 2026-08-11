import { SITE_URL } from "@/lib/audit/types";

export type NormalizedUrl = {
  url: string;
  domain: string;
  hostname: string;
};

export type AuditRouteSearchParams = Record<
  string,
  string | string[] | undefined
>;

/** Reserved report query param used only when the clean route cannot be exact. */
export const AUDIT_EXACT_URL_PARAM = "url";
export const MAX_AUDIT_URL_BYTES = 4_096;

const SENSITIVE_QUERY_NAMES = new Set([
  "access_key",
  "access_token",
  "assertion",
  "apikey",
  "api_key",
  "auth",
  "authorization",
  "awsaccesskeyid",
  "bearer",
  "client_secret",
  "code",
  "credential",
  "credentials",
  "id_token",
  "jwt",
  "key",
  "oauth_code",
  "nonce",
  "otp",
  "password",
  "passwd",
  "relaystate",
  "samlresponse",
  "secret",
  "session",
  "session_id",
  "sessionid",
  "sid",
  "sig",
  "signature",
  "state",
  "ticket",
  "token",
]);

function normalizedQueryName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function sensitiveQueryName(name: string): boolean {
  const normalized = normalizedQueryName(name);
  if (SENSITIVE_QUERY_NAMES.has(normalized)) return true;

  const parts = normalized.split("_");
  const sensitivePart = parts.some((part) =>
    [
      "credential",
      "jwt",
      "key",
      "password",
      "passwd",
      "secret",
      "session",
      "signature",
      "token",
    ].includes(part)
  );
  return (
    sensitivePart ||
    /(credential|password|passwd|secret|sessionid|signature|token)$/.test(
      normalized
    )
  );
}

function assertAuditUrlSize(value: string): void {
  if (new TextEncoder().encode(value).byteLength > MAX_AUDIT_URL_BYTES) {
    throw new Error(
      `URLs longer than ${MAX_AUDIT_URL_BYTES.toLocaleString("en-US")} bytes cannot be audited.`
    );
  }
}

/**
 * Normalize a user-provided URL or bare domain.
 * Bare domains default to HTTPS; an explicit HTTP URL stays HTTP.
 * Preserves host, path and query (hash stripped).
 */
export function normalizeUrl(input: string): NormalizedUrl {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("URL is required");
  }
  assertAuditUrlSize(trimmed);

  let candidate = trimmed;

  // Strip common prefixes users paste
  candidate = candidate.replace(/^\/+/, "");

  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(candidate)) {
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

  if (parsed.username || parsed.password) {
    throw new Error(
      "URLs containing a username or password cannot be audited. Remove sign-in credentials and try again."
    );
  }

  for (const name of parsed.searchParams.keys()) {
    if (sensitiveQueryName(name)) {
      const displayName =
        name.length > 64 ? `${name.slice(0, 61)}...` : name;
      throw new Error(
        `This URL contains a sensitive query parameter ("${displayName}"). Remove credentials, authentication codes, tokens, keys, or signed-link parameters before auditing.`
      );
    }
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

  parsed.hostname = hostname;
  parsed.hash = "";

  // Root stays as the origin without trailing-slash noise. A non-root trailing
  // slash is significant and is preserved by the exact report URL marker.
  const pathname = parsed.pathname === "/" ? "" : parsed.pathname;

  const url = `${parsed.origin}${pathname}${parsed.search}`;
  assertAuditUrlSize(url);
  const domain = hostname.replace(/^www\./, "");

  return { url, domain, hostname };
}

/**
 * Readable audit path segment(s) after /audit/.
 * e.g. "stripe.com" or "stripe.com/docs"
 * Protocol and query are omitted here; auditHref carries them when required.
 */
export function auditShareSlug(input: {
  domain: string;
  url: string;
}): string {
  try {
    const parsed = new URL(input.url);
    const pathname =
      parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/+$/, "");
    const hostname = parsed.hostname.toLowerCase();
    return pathname ? `${hostname}${pathname}` : hostname;
  } catch {
    return input.domain;
  }
}

/** Absolute canonical report URL for sharing / metadata. */
export function auditCanonicalUrl(
  input: string | { domain: string; url: string }
): string {
  if (typeof input === "string") {
    return `${SITE_URL}/audit/${input}`;
  }
  return `${SITE_URL}${auditHref(input)}`;
}

/** Client/router path: /audit/example.com or /audit/example.com/blog */
export function auditHref(input: {
  domain: string;
  url: string;
}): string {
  const base = `/audit/${auditShareSlug(input)}`;

  try {
    const parsed = new URL(input.url);
    const nonRootTrailingSlash =
      parsed.pathname !== "/" && parsed.pathname.endsWith("/");
    const needsExactUrl =
      parsed.protocol !== "https:" ||
      Boolean(parsed.search) ||
      Boolean(parsed.port) ||
      nonRootTrailingSlash ||
      /%[0-9a-f]{2}/i.test(parsed.pathname);

    if (!needsExactUrl) return base;

    const params = new URLSearchParams();
    params.set(AUDIT_EXACT_URL_PARAM, input.url);
    return `${base}?${params.toString()}`;
  } catch {
    return base;
  }
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
  return `/audit/${domain}`;
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
    // Next.js route params are already decoded. Decoding again breaks valid
    // paths such as `/100%25`, whose param value is the literal `100%`.
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join("/");
  return normalizeUrl(joined);
}

function decodeRouteSlugOnce(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/** Rebuild the exact audited URL from a clean catch-all route plus its marker. */
export function targetFromAuditRoute(
  segments: string[],
  searchParams: AuditRouteSearchParams
): NormalizedUrl {
  const routeTarget = targetFromSegments(segments);
  const encoded = searchParams[AUDIT_EXACT_URL_PARAM];

  if (encoded === undefined) return routeTarget;
  if (typeof encoded !== "string" || !encoded.trim()) {
    throw new Error("This audit link contains an invalid exact URL.");
  }

  const exactTarget = normalizeUrl(encoded);
  const routeSlug = segments.join("/");
  const exactSlug = auditShareSlug(exactTarget);
  // Next.js 16 can expose catch-all values in their encoded form during a
  // production request, while direct function callers may already have decoded
  // them once. Accept exactly those two representations of the generated slug.
  const matchesRoute =
    routeSlug === exactSlug || routeSlug === decodeRouteSlugOnce(exactSlug);

  if (!matchesRoute) {
    throw new Error(
      "The exact URL does not match this report path. Start a new audit with the full URL."
    );
  }

  return exactTarget;
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

/** Cache key must distinguish scheme, exact host, path and query audits. */
export function auditCacheKey(url: string, domain: string): string {
  try {
    const parsed = new URL(url);
    return `audit:${parsed.protocol}//${parsed.host.toLowerCase()}${parsed.pathname}${parsed.search}`;
  } catch {
    return `audit:${domain.toLowerCase()}`;
  }
}
