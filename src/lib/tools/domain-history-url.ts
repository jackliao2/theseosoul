import { SITE_URL } from "@/lib/audit/types";
import { normalizeUrl } from "@/lib/url";

/** First-party reports allowed in the sitemap — not every lookup. */
export const INDEXABLE_DOMAIN_HISTORY_DOMAINS = ["theseosoul.com"] as const;

export function canonicalDomainHistoryParam(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return normalizeUrl(decodeURIComponent(trimmed)).domain;
  } catch {
    try {
      return normalizeUrl(trimmed).domain;
    } catch {
      return null;
    }
  }
}

export function domainHistoryPath(domain: string): string {
  return `/tools/domain-history/${encodeURIComponent(domain.toLowerCase())}`;
}

export function domainHistoryPathFromInput(input: string): string {
  const domain = canonicalDomainHistoryParam(input);
  if (!domain) {
    throw new Error("Please enter a valid domain (e.g. example.com)");
  }
  return domainHistoryPath(domain);
}

export function domainHistoryCanonicalUrl(domain: string): string {
  return `${SITE_URL}${domainHistoryPath(domain)}`;
}

export function isIndexableDomainHistory(domain: string): boolean {
  const clean = domain.toLowerCase().replace(/^www\./, "");
  return (INDEXABLE_DOMAIN_HISTORY_DOMAINS as readonly string[]).includes(
    clean
  );
}

export function getIndexableDomainHistoryDomains(): string[] {
  return [...INDEXABLE_DOMAIN_HISTORY_DOMAINS];
}
