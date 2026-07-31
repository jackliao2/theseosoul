import { SITE_URL } from "@/lib/audit/types";

/**
 * Normalize a user-provided URL or bare domain into a canonical https URL.
 * Handles missing protocol, trailing slashes, and lowercase hostnames.
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
 * Convert a route param like "shopify.com" or "www.shopify.com" into audit inputs.
 */
export function domainFromParam(param: string): {
  url: string;
  domain: string;
  hostname: string;
} {
  const decoded = decodeURIComponent(param).trim().toLowerCase();
  return normalizeUrl(decoded);
}

export function auditCanonicalUrl(domain: string): string {
  return `${SITE_URL}/audit/${domain.replace(/^www\./, "")}`;
}

export function isValidDomainParam(param: string): boolean {
  try {
    domainFromParam(param);
    return true;
  } catch {
    return false;
  }
}
