import {
  FetchTimeoutError,
  fetchText,
  traceRedirects,
} from "@/lib/audit/fetch";
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
  /** Parent index URL when this came from nested expansion */
  parentUrl?: string;
};

export type SampleUrlProbe = {
  url: string;
  finalUrl: string;
  status: number;
  redirected: boolean;
  ok: boolean;
  note: string;
};

export type SitemapCheckResult = {
  success: true;
  domain: string;
  origin: string;
  robotsPresent: boolean;
  robotsSitemapDirectives: string[];
  /** robots Sitemap: lines that did not resolve to a usable sitemap */
  missingRobotsSitemaps: string[];
  probes: SitemapProbe[];
  nestedProbes: SitemapProbe[];
  sampleChecks: SampleUrlProbe[];
  totalLocEstimate: number | null;
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

function extractLocs(content: string, limit = 50): string[] {
  const locs = Array.from(content.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)).map(
    (m) => m[1].trim()
  );
  return Array.from(new Set(locs)).slice(0, limit);
}

async function probeSitemapUrl(
  url: string,
  parentUrl?: string
): Promise<SitemapProbe> {
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
      parentUrl,
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
      parentUrl,
    };
  }

  const kind = classifyKind(content);
  const urlCount = countLocs(content);
  const samples = extractLocs(content, 12);
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
    parentUrl,
  };
}

async function probeSamplePage(url: string): Promise<SampleUrlProbe> {
  try {
    const traced = await traceRedirects(url, 6_000);
    const redirected = traced.redirectChain.length > 1;
    const ok = traced.status >= 200 && traced.status < 300;
    let note = `HTTP ${traced.status}`;
    if (redirected) note += ` → ${traced.finalUrl}`;
    if (traced.status >= 300 && traced.status < 400) {
      note = `Redirected (${traced.status})`;
    } else if (traced.status >= 400) {
      note = `Broken sample — HTTP ${traced.status}`;
    } else if (ok) {
      note = redirected
        ? `OK after redirect (${traced.status})`
        : `Reachable (${traced.status})`;
    }
    return {
      url,
      finalUrl: traced.finalUrl,
      status: traced.status,
      redirected,
      ok,
      note,
    };
  } catch (error) {
    return {
      url,
      finalUrl: url,
      status: 0,
      redirected: false,
      ok: false,
      note:
        error instanceof Error
          ? `Unreachable — ${error.message}`
          : "Unreachable",
    };
  }
}

function isLikelyPageUrl(loc: string): boolean {
  return !/\.xml(?:$|\?)/i.test(loc);
}

export async function checkSitemapTool(
  url: string,
  domain: string
): Promise<SitemapCheckResult> {
  const origin = new URL(url).origin;
  const robots = await analyzeRobots(origin);

  const candidates = new Set<string>();
  candidates.add(new URL("/sitemap.xml", origin).toString());
  const resolvedRobotsDirectives: string[] = [];
  for (const directive of robots.sitemapDirectives.slice(0, 4)) {
    try {
      const absolute = new URL(directive, origin).toString();
      candidates.add(absolute);
      resolvedRobotsDirectives.push(absolute);
    } catch {
      /* skip bad directive */
    }
  }

  const probes: SitemapProbe[] = [];
  for (const candidate of candidates) {
    probes.push(await probeSitemapUrl(candidate));
  }

  // Expand sitemap indexes one level (up to 3 child sitemaps each)
  const nestedProbes: SitemapProbe[] = [];
  const pageSamples = new Set<string>();
  let totalLocEstimate = 0;
  let hasLocCount = false;

  for (const probe of probes) {
    if (!probe.present) continue;

    if (probe.kind === "sitemapindex") {
      const childUrls = probe.samples
        .filter((loc) => /\.xml(?:$|\?)/i.test(loc) || loc.includes("sitemap"))
        .slice(0, 3);
      for (const childUrl of childUrls) {
        const child = await probeSitemapUrl(childUrl, probe.url);
        nestedProbes.push(child);
        if (child.present && child.urlCount != null) {
          totalLocEstimate += child.urlCount;
          hasLocCount = true;
        }
        if (child.present && child.kind === "urlset") {
          for (const loc of child.samples.filter(isLikelyPageUrl).slice(0, 8)) {
            pageSamples.add(loc);
          }
        } else if (child.present && child.kind === "sitemapindex") {
          // Second level: one grandchild urlset only
          const grandchildUrl = child.samples.find(
            (loc) => /\.xml(?:$|\?)/i.test(loc) || loc.includes("sitemap")
          );
          if (grandchildUrl) {
            const grandchild = await probeSitemapUrl(grandchildUrl, child.url);
            nestedProbes.push(grandchild);
            if (grandchild.present && grandchild.urlCount != null) {
              totalLocEstimate += grandchild.urlCount;
              hasLocCount = true;
            }
            if (grandchild.present) {
              for (const loc of grandchild.samples
                .filter(isLikelyPageUrl)
                .slice(0, 8)) {
                pageSamples.add(loc);
              }
            }
          }
        }
      }
      if (probe.urlCount != null && childUrls.length === 0) {
        totalLocEstimate += probe.urlCount;
        hasLocCount = true;
      }
    } else if (probe.kind === "urlset") {
      if (probe.urlCount != null) {
        totalLocEstimate += probe.urlCount;
        hasLocCount = true;
      }
      for (const loc of probe.samples.filter(isLikelyPageUrl)) {
        pageSamples.add(loc);
      }
    }
  }

  const sampleChecks: SampleUrlProbe[] = [];
  for (const sample of Array.from(pageSamples).slice(0, 5)) {
    sampleChecks.push(await probeSamplePage(sample));
  }

  const found = probes.filter((p) => p.present);
  const missingRobotsSitemaps = resolvedRobotsDirectives.filter(
    (directive) => !probes.some((p) => p.url === directive && p.present)
  );

  const brokenSamples = sampleChecks.filter((s) => !s.ok);
  let verdict: SitemapCheckResult["verdict"] = "pass";
  let summary = "";

  if (found.length === 0) {
    verdict = "fail";
    summary = robots.sitemapDirectives.length
      ? "robots.txt lists Sitemap URLs, but none returned a usable XML sitemap."
      : "No usable sitemap found at /sitemap.xml and robots.txt has no Sitemap: lines.";
  } else if (missingRobotsSitemaps.length > 0) {
    verdict = "warn";
    summary = `${missingRobotsSitemaps.length} robots.txt Sitemap: URL(s) did not return usable XML. Other sitemap file(s) were found.`;
  } else if (brokenSamples.length > 0) {
    verdict = "warn";
    summary = `Sitemap found, but ${brokenSamples.length}/${sampleChecks.length} sample URL(s) failed — listed pages may be broken or blocked.`;
  } else if (!robots.present || robots.sitemapDirectives.length === 0) {
    verdict = "warn";
    summary = `Found ${found.length} sitemap file(s), but robots.txt does not declare a Sitemap: directive — add one so crawlers discover it reliably.`;
  } else {
    verdict = "pass";
    const nestedNote = nestedProbes.filter((p) => p.present).length
      ? ` Expanded ${nestedProbes.filter((p) => p.present).length} nested sitemap(s).`
      : "";
    const sampleNote =
      sampleChecks.length > 0
        ? ` ${sampleChecks.filter((s) => s.ok).length}/${sampleChecks.length} sample URLs reachable.`
        : "";
    summary = `Found ${found.length} usable sitemap file(s) and robots.txt declares Sitemap: directive(s).${nestedNote}${sampleNote}`;
  }

  return {
    success: true,
    domain,
    origin,
    robotsPresent: robots.present,
    robotsSitemapDirectives: robots.sitemapDirectives,
    missingRobotsSitemaps,
    probes,
    nestedProbes,
    sampleChecks,
    totalLocEstimate: hasLocCount ? totalLocEstimate : null,
    summary,
    verdict,
  };
}
