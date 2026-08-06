import { Agent, fetch as undiciFetch } from "undici";
import type { RedirectHop } from "@/lib/audit/types";

/**
 * Primary HTML fetch budget. Keep this snappy for normal sites;
 * alternate-host fallback uses a shorter budget (see fetchHtml).
 */
export const FETCH_TIMEOUT_MS = 14_000;
const FALLBACK_TIMEOUT_MS = 10_000;
const BODY_TIMEOUT_MS = 16_000;

/** Force HTTP/1.1 — many enterprise CDNs break Node's default HTTP/2 streams. */
const http1Agent = new Agent({
  allowH2: false,
  connectTimeout: 8_000,
  headersTimeout: 14_000,
  bodyTimeout: 20_000,
  keepAliveTimeout: 8_000,
});

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
} as const;

export class FetchTimeoutError extends Error {
  constructor(message = "Request timed out") {
    super(message);
    this.name = "FetchTimeoutError";
  }
}

function isTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === "AbortError" || error.name === "TimeoutError") return true;
  if (error.name === "FetchTimeoutError") return true;
  const msg = error.message.toLowerCase();
  return msg.includes("timeout") || msg.includes("aborted");
}

function formatFetchError(error: unknown): string {
  if (!(error instanceof Error)) return "Unknown fetch error";
  const cause =
    "cause" in error && error.cause instanceof Error
      ? `: ${error.cause.message}`
      : "";
  return `${error.message}${cause}`;
}

/** Flatten Error + nested cause into one string for classification. */
export function describeFetchError(error: unknown): string {
  if (!(error instanceof Error)) return String(error ?? "Unknown error");
  const parts = [error.message];
  let current: unknown = error.cause;
  let depth = 0;
  while (current instanceof Error && depth < 4) {
    parts.push(current.message);
    current = current.cause;
    depth += 1;
  }
  return parts.join(" | ");
}

/**
 * Turn low-level fetch/DNS/TLS failures into a short user-facing explanation.
 * Avoids dumping Undici’s bare “fetch failed” in the UI.
 */
export function humanizeFetchFailure(error: unknown, url: string): string {
  const detail = describeFetchError(error).toLowerCase();

  if (
    /enotfound|getaddrinfo|nxdomain|err_name_not_resolved|name not resolved/i.test(
      detail
    )
  ) {
    return "This domain doesn’t resolve in DNS — it may be unregistered, expired, or have no website configured.";
  }
  if (/econnrefused/i.test(detail)) {
    return "The host refused the connection — nothing appears to be listening on HTTPS for this site.";
  }
  if (/econnreset|econnaborted|epipe|socket hang up/i.test(detail)) {
    return "The connection was dropped before we could load the page. The site may be down or filtering bots.";
  }
  if (/cert|ssl|tls|unable to verify/i.test(detail)) {
    return "We couldn’t establish a trusted HTTPS connection (TLS/certificate problem).";
  }
  if (/http\s*404/i.test(detail)) {
    return "The server responded with 404 Not Found for this URL.";
  }
  if (/http\s*403/i.test(detail)) {
    return "The server blocked our request (HTTP 403). A WAF or bot filter may be in the way.";
  }
  if (/http\s*5\d\d/i.test(detail)) {
    return "The server returned an error response. Try again in a moment.";
  }
  if (/fetch failed/i.test(detail)) {
    return `We couldn’t reach ${url}. The site may be offline, have no public page, or be blocking automated requests.`;
  }

  const raw = error instanceof Error ? error.message.trim() : "";
  if (raw && !/^fetch failed$/i.test(raw)) {
    return raw;
  }
  return `We couldn’t reach ${url}. The site may be offline or unreachable.`;
}

/** Exact host first, then www/apex alternate. */
function buildUrlCandidates(url: string): string[] {
  const parsed = new URL(url);
  const host = parsed.hostname.toLowerCase();
  const alternate = host.startsWith("www.")
    ? host.replace(/^www\./, "")
    : `www.${host}`;

  const primary = new URL(parsed.toString());
  primary.hostname = host;

  const secondary = new URL(parsed.toString());
  secondary.hostname = alternate;

  return [primary.toString(), secondary.toString()];
}

function collectHeaders(responseHeaders: Headers): Record<string, string> {
  const headerKeys = [
    "content-type",
    "content-encoding",
    "server",
    "x-robots-tag",
    "x-frame-options",
    "content-security-policy",
    "strict-transport-security",
    "x-content-type-options",
    "referrer-policy",
    "permissions-policy",
    "cross-origin-opener-policy",
    "cross-origin-resource-policy",
    "cache-control",
    "cf-ray",
    "x-vercel-id",
  ];
  const headers: Record<string, string> = {};
  for (const key of headerKeys) {
    const value = responseHeaders.get(key);
    if (value) headers[key] = value;
  }
  return headers;
}

async function readTextWithTimeout(
  read: () => Promise<string>,
  timeoutMs: number
): Promise<string> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      read(),
      new Promise<string>((_, reject) => {
        timer = setTimeout(() => {
          reject(
            new FetchTimeoutError(
              `Timed out after ${timeoutMs / 1000}s reading response body`
            )
          );
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Manual redirect follow so we can record the hop chain (still one request per hop).
 */
async function requestWithRedirects(
  startUrl: string,
  timeoutMs: number,
  accept: string
): Promise<{
  ok: boolean;
  status: number;
  finalUrl: string;
  headers: Headers;
  text: () => Promise<string>;
  redirectChain: RedirectHop[];
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const redirectChain: RedirectHop[] = [];
  let current = startUrl;

  try {
    for (let hop = 0; hop < 8; hop += 1) {
      const response = await undiciFetch(current, {
        signal: controller.signal,
        redirect: "manual",
        dispatcher: http1Agent,
        headers: {
          ...BROWSER_HEADERS,
          Accept: accept,
        },
      });

      redirectChain.push({ url: current, status: response.status });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        try {
          await response.body?.cancel();
        } catch {
          // ignore
        }
        if (!location) {
          throw new Error(`Redirect ${response.status} without Location`);
        }
        current = new URL(location, current).toString();
        continue;
      }

      return {
        ok: response.ok,
        status: response.status,
        finalUrl: response.url || current,
        headers: response.headers as unknown as Headers,
        text: () => response.text(),
        redirectChain,
      };
    }

    throw new Error("Too many redirects");
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHtmlCandidate(
  candidate: string,
  timeoutMs: number
): Promise<{
  html: string;
  finalUrl: string;
  status: number;
  headers: Record<string, string>;
  redirectChain: RedirectHop[];
}> {
  const response = await requestWithRedirects(
    candidate,
    timeoutMs,
    BROWSER_HEADERS.Accept
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Unable to fetch page`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (
    contentType &&
    !contentType.includes("text/html") &&
    !contentType.includes("application/xhtml")
  ) {
    throw new Error("Target URL did not return HTML content");
  }

  const html = await readTextWithTimeout(response.text, BODY_TIMEOUT_MS);
  return {
    html,
    finalUrl: response.finalUrl,
    status: response.status,
    headers: collectHeaders(response.headers),
    redirectChain: response.redirectChain,
  };
}

function toFetchFailure(
  error: unknown,
  timeoutMs: number,
  url: string,
  action: "fetching" | "tracing"
): never {
  if (isTimeoutError(error)) {
    throw new FetchTimeoutError(
      `Timed out after ${timeoutMs / 1000}s while ${action} ${url}`
    );
  }
  throw new Error(humanizeFetchFailure(error, url));
}

/**
 * Fast path: hit the exact host the user asked for.
 * Only if that fails, try www/apex alternate with a shorter budget.
 * (Avoids parallel dual-fetch that can stall serverless on the losing request.)
 */
export async function fetchHtml(
  url: string,
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<{
  html: string;
  finalUrl: string;
  status: number;
  headers: Record<string, string>;
  redirectChain: RedirectHop[];
}> {
  const candidates = buildUrlCandidates(url);
  let lastError: unknown;

  for (let i = 0; i < candidates.length; i += 1) {
    const budget = i === 0 ? timeoutMs : FALLBACK_TIMEOUT_MS;
    try {
      return await fetchHtmlCandidate(candidates[i], budget);
    } catch (error) {
      lastError = error;
    }
  }

  toFetchFailure(lastError, timeoutMs, url, "fetching");
}

export async function fetchText(
  url: string,
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<string | null> {
  try {
    const response = await requestWithRedirects(
      url,
      timeoutMs,
      "text/plain,*/*;q=0.8"
    );
    if (!response.ok) return null;
    return await readTextWithTimeout(response.text, BODY_TIMEOUT_MS);
  } catch {
    return null;
  }
}

/** Trace redirect hops without requiring HTML (for Redirect Checker tool). */
export async function traceRedirects(
  url: string,
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<{
  startUrl: string;
  finalUrl: string;
  status: number;
  redirectChain: RedirectHop[];
}> {
  const candidates = buildUrlCandidates(url);
  let lastError: unknown;

  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    const budget = i === 0 ? timeoutMs : FALLBACK_TIMEOUT_MS;
    try {
      const response = await requestWithRedirects(
        candidate,
        budget,
        BROWSER_HEADERS.Accept
      );
      await response.text().catch(() => null);
      return {
        startUrl: candidate,
        finalUrl: response.finalUrl,
        status: response.status,
        redirectChain: response.redirectChain,
      };
    } catch (error) {
      lastError = error;
    }
  }

  toFetchFailure(lastError, timeoutMs, url, "tracing");
}
