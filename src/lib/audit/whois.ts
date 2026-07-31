import { Agent, fetch as undiciFetch } from "undici";
import { PROBE_CACHE_TTL_MS, cacheGet, cacheSet } from "@/lib/audit/cache";
import type { WhoisResult } from "@/lib/audit/types";

/** HTTP/1.1 agent — RDAP endpoints can also trip Node HTTP/2 quirks. */
const http1Agent = new Agent({
  allowH2: false,
  connectTimeout: 8_000,
  headersTimeout: 8_000,
  bodyTimeout: 10_000,
});

function yearsSince(iso: string | null): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const years = (Date.now() - t) / (365.25 * 24 * 60 * 60 * 1000);
  return Number(years.toFixed(2));
}

function pickEvent(
  events: Array<{ eventAction?: string; eventDate?: string }> | undefined,
  action: string
): string | null {
  if (!events) return null;
  const match = events.find(
    (e) => (e.eventAction || "").toLowerCase() === action.toLowerCase()
  );
  return match?.eventDate ?? null;
}

function emptyWhois(domain: string, message: string): WhoisResult {
  return {
    domain,
    createdAt: null,
    expiresAt: null,
    updatedAt: null,
    registrar: null,
    status: [],
    nameServers: [],
    ageYears: null,
    available: false,
    source: "none",
    checkStatus: "warn",
    message,
  };
}

type RdapPayload = {
  events?: Array<{ eventAction?: string; eventDate?: string }>;
  status?: string[];
  nameservers?: Array<{ ldhName?: string }>;
  entities?: Array<{
    roles?: string[];
    vcardArray?: unknown[];
  }>;
};

function parseRdap(domain: string, data: RdapPayload): WhoisResult {
  const createdAt =
    pickEvent(data.events, "registration") ||
    pickEvent(data.events, "created");
  const expiresAt =
    pickEvent(data.events, "expiration") || pickEvent(data.events, "expire");
  const updatedAt =
    pickEvent(data.events, "last changed") ||
    pickEvent(data.events, "last update of RDAP database");

  let registrar: string | null = null;
  for (const entity of data.entities ?? []) {
    if (entity.roles?.includes("registrar")) {
      const vcard = entity.vcardArray;
      if (Array.isArray(vcard) && Array.isArray(vcard[1])) {
        for (const row of vcard[1] as unknown[]) {
          if (
            Array.isArray(row) &&
            row[0] === "fn" &&
            typeof row[3] === "string"
          ) {
            registrar = row[3];
            break;
          }
        }
      }
    }
    if (registrar) break;
  }

  const nameServers = (data.nameservers ?? [])
    .map((n) => n.ldhName?.replace(/\.$/, "").toLowerCase())
    .filter((n): n is string => Boolean(n));

  const createdAtIso = createdAt ?? null;

  return {
    domain,
    createdAt: createdAtIso,
    expiresAt: expiresAt ?? null,
    updatedAt: updatedAt ?? null,
    registrar,
    status: Array.isArray(data.status)
      ? data.status.map(String).slice(0, 12)
      : [],
    nameServers: nameServers.slice(0, 12),
    ageYears: yearsSince(createdAtIso),
    available: true,
    source: "rdap",
    checkStatus: "pass",
    message: registrar
      ? `Registered via ${registrar}.`
      : "Domain registration data loaded from RDAP.",
  };
}

async function fetchRdap(url: string): Promise<RdapPayload | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);
  try {
    const res = await undiciFetch(url, {
      signal: controller.signal,
      dispatcher: http1Agent,
      headers: { Accept: "application/rdap+json, application/json" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    return (await res.json()) as RdapPayload;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Free WHOIS via public RDAP (no API key).
 * Parallel registry probes + 6h cache; never throws.
 */
export async function lookupWhois(domain: string): Promise<WhoisResult> {
  const bare = domain.replace(/^www\./, "").toLowerCase();
  const cacheKey = `whois:${bare}`;
  const cached = cacheGet<WhoisResult>(cacheKey);
  if (cached) return cached;

  try {
    const tld = bare.split(".").pop() ?? "";
    const endpoints = [
      `https://rdap.org/domain/${bare}`,
      tld === "com" || tld === "net"
        ? `https://rdap.verisign.com/${tld}/v1/domain/${bare}`
        : null,
      tld === "org"
        ? `https://rdap.publicinterestregistry.org/rdap/domain/${bare}`
        : null,
      `https://www.rdap.net/domain/${bare}`,
    ].filter((u): u is string => Boolean(u));

    const results = await Promise.all(endpoints.map(fetchRdap));
    for (const data of results) {
      if (data?.events?.length || data?.nameservers?.length) {
        const parsed = parseRdap(bare, data);
        cacheSet(cacheKey, parsed, PROBE_CACHE_TTL_MS);
        return parsed;
      }
    }
  } catch {
    // degrade — WHOIS is optional
  }

  const empty = emptyWhois(
    bare,
    "Could not reach a public RDAP registry for WHOIS data."
  );
  cacheSet(cacheKey, empty, 30 * 60 * 1000);
  return empty;
}
