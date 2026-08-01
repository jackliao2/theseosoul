import { Agent, fetch as undiciFetch } from "undici";
import type { RedirectHop } from "@/lib/audit/types";

/** Per-attempt budget for HTML audits (enterprise CDNs / WAF often need headroom on Vercel). */
export const FETCH_TIMEOUT_MS = 22_000;
const BODY_TIMEOUT_MS = 25_000;

/** Force HTTP/1.1 — many enterprise CDNs break Node's default HTTP/2 streams. */
const http1Agent = new Agent({
  allowH2: false,
  connectTimeout: 12_000,
  headersTimeout: 22_000,
  bodyTimeout: 30_000,
  keepAliveTimeout: 10_000,
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
  // Helps some bot/WAF scores treat us closer to a real browser navigation.
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

/**
 * Apex + www variants. Prefer www first — many enterprise sites (HPE, etc.)
 * park a slow/WAF-heavy apex that only 301s to www.
 */
function buildUrlCandidates(url: string): string[] {
  const parsed = new URL(url);
  const hosts = new Set<string>();
  const host = parsed.hostname.toLowerCase();
  if (host.startsWith("www.")) {
    hosts.add(host);
    hosts.add(host.replace(/^www\./, ""));
  } else {
    hosts.add(`www.${host}`);
    hosts.add(host);
  }

  return Array.from(hosts).map((hostname) => {
    const next = new URL(parsed.toString());
    next.hostname = hostname;
    return next.toString();
  });
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
        // Drain/cancel body for redirect responses
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

function rethrowAggregate(
  error: unknown,
  timeoutMs: number,
  url: string,
  action: "fetching" | "tracing"
): never {
  if (error instanceof AggregateError) {
    const errors = error.errors;
    if (errors.length && errors.every((e) => isTimeoutError(e))) {
      throw new FetchTimeoutError(
        `Timed out after ${timeoutMs / 1000}s while ${action} ${url}`
      );
    }
    throw new Error(formatFetchError(errors[0] ?? error));
  }
  if (isTimeoutError(error)) {
    throw new FetchTimeoutError(
      `Timed out after ${timeoutMs / 1000}s while ${action} ${url}`
    );
  }
  throw error instanceof Error ? error : new Error(formatFetchError(error));
}

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

  if (candidates.length === 1) {
    try {
      return await fetchHtmlCandidate(candidates[0], timeoutMs);
    } catch (error) {
      rethrowAggregate(error, timeoutMs, url, "fetching");
    }
  }

  // Race apex/www — don't burn the full budget on a sticky apex WAF.
  try {
    return await Promise.any(
      candidates.map((candidate) => fetchHtmlCandidate(candidate, timeoutMs))
    );
  } catch (error) {
    rethrowAggregate(error, timeoutMs, url, "fetching");
  }
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

  const attempt = async (candidate: string) => {
    const response = await requestWithRedirects(
      candidate,
      timeoutMs,
      BROWSER_HEADERS.Accept
    );
    await response.text().catch(() => null);
    return {
      startUrl: candidate,
      finalUrl: response.finalUrl,
      status: response.status,
      redirectChain: response.redirectChain,
    };
  };

  if (candidates.length === 1) {
    try {
      return await attempt(candidates[0]);
    } catch (error) {
      rethrowAggregate(error, timeoutMs, url, "tracing");
    }
  }

  try {
    return await Promise.any(candidates.map((c) => attempt(c)));
  } catch (error) {
    rethrowAggregate(error, timeoutMs, url, "tracing");
  }
}
