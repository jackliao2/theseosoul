import { FetchTimeoutError, fetchText } from "@/lib/audit/fetch";
import { analyzeRobots } from "@/lib/audit/robots";

export { FetchTimeoutError };

export type SitemapKind = "urlset" | "sitemapindex" | "unknown" | "missing";

export type SitemapProbe = {
  url: string;
  present: boolean;
  kind: SitemapKind;
  httpOk: boolean;
  urlCount: number | null;
  samples: string[];
  bytes: number;
  note: string;
};

export type SitemapCheckResult = {
  success: true;
  domain: string;
  origin: string;
  robotsPresent: boolean;
  robotsSitemapDirectives: string[];
  probes: SitemapProbe[];
  summary: string;
  verdict: "pass" | "warn" | "fail";
};

function classifyKind(content: string): SitemapKind {
  if (/<sitemapindex[\s>]/i.test(content)) return "sitemapindex";
  if (/<urlset[\s>]/i.test(content)) return "urlset";
  if (/<url[\s>]|<loc[\s>]/i.test(content)) return "urlset";
  return "unknown";
}

function countLocs(content: string): number {
  return Array.from(content.matchAll(/<loc\s*>/gi)).length;
}

function sampleLocs(content: string, limit = 8): string[] {
  const locs = Array.from(content.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)).map(
    (m) => m[1].trim()
  );
  return Array.from(new Set(locs)).slice(0, limit);
}

async function probeSitemapUrl(url: string): Promise<SitemapProbe> {
  const content = await fetchText(url, 8_000);
  if (!content || content.trim().length < 8) {
    return {
      url,
      present: false,
      kind: "missing",
      httpOk: false,
      urlCount: null,
      samples: [],
      bytes: 0,
      note: "Not found or empty response.",
    };
  }

  const looksHtml =
    /<\s*html|<!doctype html/i.test(content.slice(0, 500)) &&
    !/<urlset|<sitemapindex|<loc/i.test(content);

  if (looksHtml) {
    return {
      url,
      present: false,
      kind: "missing",
      httpOk: true,
      urlCount: null,
      samples: [],
      bytes: Buffer.byteLength(content, "utf8"),
      note: "Response looks like HTML, not an XML sitemap.",
    };
  }

  const kind = classifyKind(content);
  const urlCount = countLocs(content);
  const samples = sampleLocs(content);
  const present = kind !== "unknown" || urlCount > 0;

  return {
    url,
    present,
    kind: present ? kind : "unknown",
    httpOk: true,
    urlCount: present ? urlCount : null,
    samples,
    bytes: Buffer.byteLength(content, "utf8"),
    note: present
      ? kind === "sitemapindex"
        ? "Sitemap index — lists other sitemap files."
        : kind === "urlset"
          ? "URL set — lists page URLs."
          : "Fetched, but XML type is unclear."
      : "Fetched, but did not look like a sitemap.",
  };
}

export async function checkSitemapTool(
  url: string,
  domain: string
): Promise<SitemapCheckResult> {
  const origin = new URL(url).origin;
  const robots = await analyzeRobots(origin);

  const candidates = new Set<string>();
  candidates.add(new URL("/sitemap.xml", origin).toString());
  for (const directive of robots.sitemapDirectives.slice(0, 4)) {
    try {
      candidates.add(new URL(directive, origin).toString());
    } catch {
      /* skip bad directive */
    }
  }

  const probes: SitemapProbe[] = [];
  for (const candidate of candidates) {
    probes.push(await probeSitemapUrl(candidate));
  }

  const found = probes.filter((p) => p.present);
  let verdict: SitemapCheckResult["verdict"] = "pass";
  let summary = "";

  if (found.length === 0) {
    verdict = "fail";
    summary = robots.sitemapDirectives.length
      ? "robots.txt lists Sitemap URLs, but none returned a usable XML sitemap."
      : "No usable sitemap found at /sitemap.xml and robots.txt has no Sitemap: lines.";
  } else if (!robots.present || robots.sitemapDirectives.length === 0) {
    verdict = "warn";
    summary = `Found ${found.length} sitemap file(s), but robots.txt does not declare a Sitemap: directive — add one so crawlers discover it reliably.`;
  } else {
    verdict = "pass";
    summary = `Found ${found.length} usable sitemap file(s) and robots.txt declares Sitemap: directive(s).`;
  }

  return {
    success: true,
    domain,
    origin,
    robotsPresent: robots.present,
    robotsSitemapDirectives: robots.sitemapDirectives,
    probes,
    summary,
    verdict,
  };
}
