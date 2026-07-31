import { runAudit } from "@/lib/audit/engine";
import {
  AUDIT_CACHE_TTL_MS,
  cacheGet,
  cacheSet,
} from "@/lib/audit/cache";
import { checkAuditRateLimit } from "@/lib/audit/limit";
import type { AuditResponse, AuditResult } from "@/lib/audit/types";
import { domainFromParam, normalizeUrl } from "@/lib/url";

function resolveDomain(input: string): { domain: string; url: string | null } {
  try {
    const normalized = input.includes("/")
      ? normalizeUrl(input)
      : domainFromParam(input);
    return { domain: normalized.domain, url: normalized.url };
  } catch {
    return { domain: input.trim() || "unknown", url: null };
  }
}

/**
 * Rate-limit + short result cache wrapper used by API route and /audit pages.
 * Pass `fresh: true` to bypass the short result cache (Refresh button).
 */
export async function runGuardedAudit(
  input: string,
  clientIp: string,
  opts?: { fresh?: boolean }
): Promise<AuditResponse> {
  const { domain, url } = resolveDomain(input);

  // Only rate-limit when the input looks like a domain we would actually audit.
  if (domain.includes(".")) {
    const cacheKey = `audit:${domain.toLowerCase().replace(/^www\./, "")}`;
    if (!opts?.fresh) {
      const cached = cacheGet<AuditResult>(cacheKey);
      if (cached) return cached;
    }

    const limited = checkAuditRateLimit(clientIp, domain);
    if (!limited.ok) {
      const who =
        limited.reason === "domain"
          ? `this domain (${domain})`
          : "your IP";
      return {
        success: false,
        domain,
        url,
        error: `Too many audits for ${who}. Try again in ~${limited.retryAfterSec}s.`,
        code: "RATE_LIMITED",
      };
    }

    const result = await runAudit(input);
    if (result.success) {
      cacheSet(cacheKey, result, AUDIT_CACHE_TTL_MS);
    }
    return result;
  }

  return runAudit(input);
}
