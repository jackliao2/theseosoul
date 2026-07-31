import { Agent, fetch as undiciFetch } from "undici";
import type { RedirectHop } from "@/lib/audit/types";

export const FETCH_TIMEOUT_MS = 12_000;

/** Force HTTP/1.1 — many enterprise CDNs break Node's default HTTP/2 streams. */
const http1Agent = new Agent({
  allowH2: false,
  connectTimeout: 10_000,
  headersTimeout: 12_000,
  bodyTimeout: 20_000,
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

function buildUrlCandidates(url: string): string[] {
  const parsed = new URL(url);
  const hosts = new Set<string>([parsed.hostname]);
  if (parsed.hostname.startsWith("www.")) {
    hosts.add(parsed.hostname.replace(/^www\./, ""));
  } else {
    hosts.add(`www.${parsed.hostname}`);
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

  for (const candidate of candidates) {
    try {
      const response = await requestWithRedirects(
        candidate,
        timeoutMs,
        BROWSER_HEADERS.Accept
      );

      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status}: Unable to fetch page`);
        continue;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (
        contentType &&
        !contentType.includes("text/html") &&
        !contentType.includes("application/xhtml")
      ) {
        lastError = new Error("Target URL did not return HTML content");
        continue;
      }

      const html = await response.text();
      return {
        html,
        finalUrl: response.finalUrl,
        status: response.status,
        headers: collectHeaders(response.headers),
        redirectChain: response.redirectChain,
      };
    } catch (error) {
      lastError = error;
      if (
        isTimeoutError(error) &&
        candidates.indexOf(candidate) === candidates.length - 1
      ) {
        throw new FetchTimeoutError(
          `Timed out after ${timeoutMs / 1000}s while fetching ${url}`
        );
      }
    }
  }

  if (isTimeoutError(lastError)) {
    throw new FetchTimeoutError(
      `Timed out after ${timeoutMs / 1000}s while fetching ${url}`
    );
  }

  throw new Error(formatFetchError(lastError));
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
    return await response.text();
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

  for (const candidate of candidates) {
    try {
      const response = await requestWithRedirects(
        candidate,
        timeoutMs,
        BROWSER_HEADERS.Accept
      );
      // Drain body so the socket can close; hop data is already recorded
      await response.text().catch(() => null);
      return {
        startUrl: candidate,
        finalUrl: response.finalUrl,
        status: response.status,
        redirectChain: response.redirectChain,
      };
    } catch (error) {
      lastError = error;
      if (
        isTimeoutError(error) &&
        candidates.indexOf(candidate) === candidates.length - 1
      ) {
        throw new FetchTimeoutError(
          `Timed out after ${timeoutMs / 1000}s while tracing ${url}`
        );
      }
    }
  }

  if (isTimeoutError(lastError)) {
    throw new FetchTimeoutError(
      `Timed out after ${timeoutMs / 1000}s while tracing ${url}`
    );
  }

  throw new Error(formatFetchError(lastError));
}
